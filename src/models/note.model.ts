import { model, Schema } from "mongoose";

// password: {type: String, required: true },

// Define schema for Note
export const NoteSchema = new Schema({
  noteId: { type: String, unique: true, required: true },
  title: { type: String },
  content: { type: String, required: true },
  categories: {type: [String], required: true },
  created: { type: Date, required: true },
  last_modified: { type: Date, required: true },
  username: { type: String, required: true },
});

// Export the model
export const Note = model('Note', NoteSchema);
