import { Pin, Edit3, Trash2, Clock, Tag } from "lucide-react";
import { CATEGORY_STYLES } from "./CategoryFilter";

export default function NoteCard({ note, onEdit, onDelete, onTogglePin }) {
  const category = note.category || "General";
  const catStyle =
    CATEGORY_STYLES[category]?.color ||
    "text-slate-700 bg-slate-100 border-slate-200";

  const timeString = new Date(note.createdAt).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div
      className={`group relative bg-white border rounded-2xl p-5 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between ${
        note.isPinned
          ? "border-amber-300 ring-1 ring-amber-300/40 bg-gradient-to-b from-amber-50/20 to-white"
          : "border-slate-200/90 hover:border-slate-300"
      }`}
    >
      <div>
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <span
            className={`inline-flex items-center text-[11px] font-semibold px-2.5 py-0.5 rounded-lg border ${catStyle}`}
          >
            {category}
          </span>

          <button
            onClick={() => onTogglePin(note)}
            className={`p-1.5 rounded-lg transition-all cursor-pointer ${
              note.isPinned
                ? "bg-amber-100 text-amber-700 hover:bg-amber-200"
                : "text-slate-300 hover:text-slate-600 hover:bg-slate-100 opacity-60 group-hover:opacity-100"
            }`}
            title={note.isPinned ? "Unpin note" : "Pin note to top"}
          >
            <Pin
              className={`w-4 h-4 ${note.isPinned ? "fill-amber-500 text-amber-600" : ""}`}
            />
          </button>
        </div>

        <h3 className="font-bold text-slate-900 text-base leading-snug break-words mb-2">
          {note.title}
        </h3>

        {note.content && (
          <p className="text-slate-600 text-sm whitespace-pre-wrap break-words leading-relaxed mb-4 font-normal">
            {note.content}
          </p>
        )}

        {note.tags && note.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {note.tags.map((tag, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-50 border border-slate-200 text-slate-600"
              >
                <Tag className="w-2.5 h-2.5 text-slate-400" />
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-slate-100 mt-2 text-xs text-slate-400">
        <span className="flex items-center gap-1.5 font-medium">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          {timeString}
        </span>

        <div className="flex items-center gap-1">
          <button
            onClick={() => onEdit(note)}
            className="flex items-center gap-1 px-2 py-1 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer font-medium"
            title="Edit note"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit</span>
          </button>
          <button
            onClick={() => onDelete(note)}
            className="flex items-center gap-1 px-2 py-1 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer font-medium"
            title="Delete note"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete</span>
          </button>
        </div>
      </div>
    </div>
  );
}
