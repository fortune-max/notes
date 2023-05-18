import { Request } from "express";
import { Note } from "./models/note.model";
import type { ParsedNote } from '../types';
import { DEFAULT_NOTE_CATEGORY } from "./constants";

export function parseNote(req: Request) : ParsedNote {
  let contentType = req.header('Content-Type') || 'text/plain';
  contentType = contentType.startsWith('multipart/form-data') ? 'multipart/form-data' : contentType;

  switch (contentType) {
    case 'text/plain':
      return {
        title: null,
        content: req.body,
        categories: [DEFAULT_NOTE_CATEGORY]
      };
    case 'multipart/form-data':
      return {
        title: null,
        content: req.body['f:1'],
        categories: [DEFAULT_NOTE_CATEGORY]
      };
    case 'application/json':
    case 'application/x-www-form-urlencoded':
    default:
      return {
        title: req.body.title || null,
        content: req.body.content || null,
        categories: req.body.categories || [DEFAULT_NOTE_CATEGORY],
      };
  }
}

export async function getAvailableNoteId(username: string, max=100): Promise<number>{
  const choice = Math.floor(Math.random() * max);
  const note = await Note.findOne({ username, noteId: choice });
  if (note)
    return getAvailableNoteId(username, max * 2);
  return choice;
}
