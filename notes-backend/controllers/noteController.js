const Note = require("../models/NoteModel");

exports.getNotes = async (req, res) => {
  try {
    const filter = { user: req.userId };

    if (req.query.search) {
      const regex = new RegExp(req.query.search.trim(), "i");
      filter.$or = [{ title: regex }, { content: regex }, { tags: regex }];
    }

    if (req.query.category && req.query.category !== "All") {
      filter.category = req.query.category;
    }

    if (req.query.tag) {
      filter.tags = req.query.tag;
    }

    const notes = await Note.find(filter).sort({ isPinned: -1, createdAt: -1 });
    res.status(200).json({ notes });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch notes" });
  }
};


exports.getNoteById = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);

    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    if (note.user.toString() !== req.userId) {
      return res.status(403).json({ message: "Access denied: You do not own this note" });
    }

    res.status(200).json({ note });
  } catch (err) {
    res.status(500).json({ message: "Error fetching note" });
  }
};

exports.createNote = async (req, res) => {
  try {
    const { title, content, isPinned, tags, color, category } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ message: "Note title is required" });
    }

    const note = await Note.create({
      title: title.trim(),
      content: content || "",
      category: category && category.trim() ? category.trim() : "General",
      isPinned: Boolean(isPinned),
      tags: Array.isArray(tags) ? tags : [],
      color: color || "default",
      user: req.userId,
    });

    res.status(201).json({ message: "Note created", note });
  } catch (err) {
    res.status(500).json({ message: "Failed to create note" });
  }
};

exports.updateNote = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);

    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    if (note.user.toString() !== req.userId) {
      return res.status(403).json({ message: "Access denied: You do not own this note" });
    }

    const { title, content, isPinned, tags, color, category } = req.body;
    if (title !== undefined) note.title = title.trim();
    if (content !== undefined) note.content = content;
    if (category !== undefined) note.category = category.trim() || "General";
    if (isPinned !== undefined) note.isPinned = isPinned;
    if (tags !== undefined) note.tags = tags;
    if (color !== undefined) note.color = color;

    await note.save();

    res.status(200).json({ message: "Note updated", note });
  } catch (err) {
    res.status(500).json({ message: "Failed to update note" });
  }
};

exports.deleteNote = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);

    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    if (note.user.toString() !== req.userId) {
      return res.status(403).json({ message: "Access denied: You do not own this note" });
    }

    await Note.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: "Note deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete note" });
  }
};
