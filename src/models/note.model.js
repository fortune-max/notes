import { model, Schema } from "mongoose";

// Define schema for Note
export const NoteSchema = new Schema({
  noteId: String,
  title: String,
  content: String,
  categories: [String],
  created: Date,
  last_modified: Date,
  username: String,  
});

// Export the model
export const Note = model('Note', NoteSchema);
