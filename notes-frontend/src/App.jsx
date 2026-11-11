import { useState, useEffect, useMemo } from "react";
import { useAuth } from "./context/AuthContext";
import { notesApi } from "./services/api";
import Navbar from "./components/Navbar";
import NoteCard from "./components/NoteCard";
import NoteModal from "./components/NoteModal";
import AuthForm from "./components/AuthForm";
import CategoryFilter from "./components/CategoryFilter";
import { Calendar, Pin, NotebookPen, SearchX, Plus, Trash2, AlertTriangle } from "lucide-react";

const DEFAULT_CATEGORIES = ["All", "Work", "Personal", "Ideas", "Study", "Tasks", "General"];

function getDateKey(dateString) {
  if (!dateString) return new Date().toISOString().split("T")[0];
  const d = new Date(dateString);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function formatGroupDate(dateKey) {
  try {
    const [year, month, day] = dateKey.split("-").map(Number);
    const noteDate = new Date(year, month - 1, day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const checkDate = new Date(year, month - 1, day);
    checkDate.setHours(0, 0, 0, 0);

    const options = { month: "short", day: "numeric", year: "numeric" };
    if (checkDate.getTime() === today.getTime()) {
      return `Today — ${noteDate.toLocaleDateString("en-US", options)}`;
    }
    if (checkDate.getTime() === yesterday.getTime()) {
      return `Yesterday — ${noteDate.toLocaleDateString("en-US", options)}`;
    }
    return noteDate.toLocaleDateString("en-US", {
      weekday: "long",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return dateKey;
  }
}

export default function App() {
  const { isAuthenticated, loading } = useAuth();
  const [notes, setNotes] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState(null);

  const [noteToDelete, setNoteToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchNotes = async () => {
    try {
      const data = await notesApi.getNotes();
      setNotes(data.notes || []);
    } catch (err) {
      console.error("Failed to load notes", err);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchNotes();
    }
  }, [isAuthenticated]);

  const handleSaveNote = async (noteData) => {
    try {
      if (editingNote) {
        const res = await notesApi.updateNote(editingNote._id, noteData);
        setNotes((prev) =>
          prev.map((n) => (n._id === editingNote._id ? res.note : n))
        );
      } else {
        const res = await notesApi.createNote(noteData);
        setNotes((prev) => [res.note, ...prev]);
      }
      setIsModalOpen(false);
      setEditingNote(null);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to save note");
    }
  };

  const handleConfirmDelete = async () => {
    if (!noteToDelete) return;
    setIsDeleting(true);
    try {
      await notesApi.deleteNote(noteToDelete._id);
      setNotes((prev) => prev.filter((n) => n._id !== noteToDelete._id));
      setNoteToDelete(null);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete note");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleTogglePin = async (note) => {
    try {
      const res = await notesApi.updateNote(note._id, {
        isPinned: !note.isPinned,
      });
      setNotes((prev) =>
        prev.map((n) => (n._id === note._id ? res.note : n))
      );
    } catch (err) {
      alert("Failed to toggle pin");
    }
  };

  const { categories, categoryCounts } = useMemo(() => {
    const counts = { All: notes.length };
    const set = new Set(DEFAULT_CATEGORIES);

    notes.forEach((note) => {
      const cat = note.category || "General";
      set.add(cat);
      counts[cat] = (counts[cat] || 0) + 1;
    });

    return {
      categories: Array.from(set),
      categoryCounts: counts,
    };
  }, [notes]);

  const filteredNotes = useMemo(() => {
    return notes.filter((note) => {
      if (selectedCategory !== "All") {
        const noteCat = note.category || "General";
        if (noteCat.toLowerCase() !== selectedCategory.toLowerCase()) {
          return false;
        }
      }

      if (search.trim()) {
        const q = search.toLowerCase();
        const titleMatch = note.title?.toLowerCase().includes(q);
        const contentMatch = note.content?.toLowerCase().includes(q);
        const tagMatch = note.tags?.some((t) => t.toLowerCase().includes(q));
        const catMatch = note.category?.toLowerCase().includes(q);
        if (!titleMatch && !contentMatch && !tagMatch && !catMatch) {
          return false;
        }
      }

      return true;
    });
  }, [notes, selectedCategory, search]);

  const dateGroups = useMemo(() => {
    const groups = {};
    filteredNotes.forEach((note) => {
      const dateKey = getDateKey(note.createdAt);
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(note);
    });

    const sortedKeys = Object.keys(groups).sort((a, b) => (a < b ? 1 : -1));
    return sortedKeys.map((key) => ({
      dateKey: key,
      formattedDate: formatGroupDate(key),
      notes: groups[key],
    }));
  }, [filteredNotes]);

  const pinnedNotes = useMemo(
    () => filteredNotes.filter((n) => n.isPinned),
    [filteredNotes]
  );

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-3">
        <div className="w-8 h-8 border-3 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin" />
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          Loading NotesApp...
        </span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthForm />;
  }

  return (
    <div className="min-h-screen bg-slate-50/80 text-slate-800 flex flex-col relative pb-20">
      <Navbar
        search={search}
        setSearch={setSearch}
        onNewNote={() => {
          setEditingNote(null);
          setIsModalOpen(true);
        }}
      />

      <main className="max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 flex-1 flex flex-col">
        <div className="mb-6 bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs">
          <CategoryFilter
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            categoryCounts={categoryCounts}
          />
        </div>

        {filteredNotes.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center py-20 px-4 text-center">
            {search || selectedCategory !== "All" ? (
              <>
                <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-3 border border-slate-200">
                  <SearchX className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-800 mb-1">
                  No matching notes
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mb-4">
                  No notes found matching your search or category filter.
                </p>
                <button
                  onClick={() => {
                    setSearch("");
                    setSelectedCategory("All");
                  }}
                  className="text-xs font-semibold px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-700 transition-colors cursor-pointer"
                >
                  Clear Filters
                </button>
              </>
            ) : (
              <>
                <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mb-4 shadow-sm">
                  <NotebookPen className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-1">
                  No notes yet
                </h3>
                <p className="text-sm text-slate-500 max-w-md mb-5 leading-relaxed">
                  Start capturing your thoughts, tasks, and ideas organized by category.
                </p>
                <button
                  onClick={() => {
                    setEditingNote(null);
                    setIsModalOpen(true);
                  }}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  Create your first note
                </button>
              </>
            )}
          </div>
        ) : (
          <div className="space-y-8">
            {pinnedNotes.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3.5">
                  <Pin className="w-4 h-4 fill-amber-500 text-amber-500" />
                  <h2 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                    Pinned Notes ({pinnedNotes.length})
                  </h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {pinnedNotes.map((note) => (
                    <NoteCard
                      key={`pinned-${note._id}`}
                      note={note}
                      onEdit={(n) => {
                        setEditingNote(n);
                        setIsModalOpen(true);
                      }}
                      onDelete={(n) => setNoteToDelete(n)}
                      onTogglePin={handleTogglePin}
                    />
                  ))}
                </div>
              </div>
            )}

            <div>
              {pinnedNotes.length > 0 && (
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  All Notes by Date
                </h2>
              )}

              {dateGroups.map((group) => (
                <section key={group.dateKey} className="mb-8">
                  <div className="flex items-center gap-3 my-4">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-700 bg-white px-3.5 py-1.5 rounded-xl border border-slate-200/90 shadow-2xs">
                      <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                      <span>{group.formattedDate}</span>
                      <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-500">
                        {group.notes.length}
                      </span>
                    </div>
                    <div className="flex-1 h-px bg-slate-200/80" />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {group.notes.map((note) => (
                      <NoteCard
                        key={note._id}
                        note={note}
                        onEdit={(n) => {
                          setEditingNote(n);
                          setIsModalOpen(true);
                        }}
                        onDelete={(n) => setNoteToDelete(n)}
                        onTogglePin={handleTogglePin}
                      />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </div>
        )}
      </main>

      <button
        onClick={() => {
          setEditingNote(null);
          setIsModalOpen(true);
        }}
        className="fixed bottom-7 right-7 z-40 flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white pl-4 pr-5 py-3.5 rounded-full shadow-xl shadow-indigo-600/35 hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer group"
        title="Create New Note"
      >
        <Plus className="w-5 h-5 transition-transform group-hover:rotate-90 duration-200" />
        <span className="text-sm font-bold tracking-tight">New Note</span>
      </button>

      <NoteModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingNote(null);
        }}
        onSave={handleSaveNote}
        initialData={editingNote}
      />

      {noteToDelete && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div
            className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl border border-slate-100 text-center animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-3.5 border border-rose-100">
              <Trash2 className="w-6 h-6" />
            </div>

            <h3 className="text-base font-bold text-slate-900 mb-1.5">
              Delete this note?
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed mb-6">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-slate-700">
                "{noteToDelete.title}"
              </span>
              ? This action cannot be undone.
            </p>

            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setNoteToDelete(null)}
                className="flex-1 px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer border border-slate-200 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                className="flex-1 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white text-xs font-semibold rounded-xl shadow-md shadow-rose-600/25 transition-all cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? "Deleting..." : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
