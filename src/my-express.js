import os from 'os';
import bcrypt from 'bcrypt';
import express from 'express';
import { Note } from './models/note.model.js';
import { User } from './models/user.model.js';
import formData from "express-form-data";
import bodyParser from 'body-parser';
import { parseNote, getAvailableNoteId } from './utils.js';
import { DEFAULT_USER, DEFAULT_PASSWORD, SALT_ROUNDS } from './constants.js';

const app = express();

// ========= MIDDLEWAREZ =========

// parse body as json
app.use(express.json());

// handle url encoded data
app.use(express.urlencoded({ extended: true }));

// handle text/plain
app.use(bodyParser.text({ type: 'text/plain' }));

// handle multipart/form-data
const options = {
  uploadDir: os.tmpdir(),
  autoClean: true
};
app.use(formData.parse(options));
app.use(formData.format());
app.use(formData.stream());
app.use(formData.union());

// add basic auth
app.use((req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth){
    req.headers.authorization = JSON.stringify({ username: DEFAULT_USER, password: DEFAULT_PASSWORD });
    return next();
  }
  const [username, password] = Buffer.from(auth.split(' ')[1], 'base64').toString().split(':');
  if (req.path === '/register' && req.method === 'POST'){
    req.headers.authorization = JSON.stringify({ username, password});
    return next();
  }
  bcrypt.hash(password, SALT_ROUNDS).then((err, hash) => {
    User.findOne({ username }).then((user) => {
      if (!user)
        return res.status(401).send('Invalid Credentials!\n');
      bcrypt.compare(password, user.password).then((result) => {
        if (!result)
          return res.status(401).send('Invalid Credentials!\n');
        req.headers.authorization = JSON.stringify({ username, password: hash });
        next();
      });
    });
  });
});

// ========= API ENDPOINTS =========

// /notes endpoints
app.get('/notes', async (req, res) => {
  const { username } = JSON.parse(req.headers.authorization);
  const query = { username };
  Note.find(query).select({ _id: 0, __v: 0})
    .then((notes) => {
      notes = notes.map(note => note.toObject());
      res.send(JSON.stringify(notes, null, 4));
    });
});

app.get('/notes/:noteId', (req, res) => {
  const { username } = JSON.parse(req.headers.authorization);
  const { noteId } = req.params;
  const { json } = req.query;
  const query = { username, noteId };
  Note.findOne(query).select({ _id: 0, __v: 0})
    .then((note) => {
      if (!note)
        return res.status(404).send('Note does not Exist!\n');
      if (json)
        return res.send(JSON.stringify(note.toObject(), null, 4));
      return note.title ? res.send(note.title + '\n' + note.content) : res.send(note.content);
    });
});

app.post('/notes', async (req, res) => {
  const { username } = JSON.parse(req.headers.authorization);
  const { json } = req.query;
  const noteObj = parseNote(req);
  const noteId = await getAvailableNoteId(username);
  if (!noteObj.content)
    return res.status(400).send('Bad Request, empty note!\n');
  const newNote = {
    ...noteObj,
    noteId,
    username,
    created: new Date(),
    last_modified: new Date(),
  };
  Note.create(newNote).then((note) => {
    res.send(json ? JSON.stringify(newNote, null, 4) : `Created Note! ID: ${noteId}\n`);
  });
});

app.post('/notes/:noteId', (req, res) => {
  const { username } = JSON.parse(req.headers.authorization);
  const { noteId } = req.params;
  const { json } = req.query;
  const noteObj = parseNote(req);
  if (!noteObj.content)
    return res.status(400).send('Bad Request, empty note!\n');
  const query = { username, noteId };
  const newNote = {
    ...noteObj,
    noteId,
    username,
    created: new Date(),
    last_modified: new Date(),
  };
  Note.findOneAndUpdate(query, newNote, { upsert: true, new: true }).then((note) => {
    res.send(json ? JSON.stringify(newNote, null, 4) : 'Note Saved!\n');
  });
});

app.put('/notes/:noteId', (req, res) => {
  const { username } = JSON.parse(req.headers.authorization);
  const { noteId } = req.params;
  const { json } = req.query;
  const noteObj = parseNote(req);
  const query = { username, noteId };
  Note.findOne(query)
    .then((note) => {
      if (!note)
        return res.status(404).send('Can\'t update note, does not exist!\n');
      note.title = noteObj.title || note.title;
      note.content = noteObj.content || note.content;
      note.categories = noteObj.categories || note.categories;
      note.last_modified = new Date();
      note.save().then((note) => {
        note = note.toObject();
        delete note._id;
        delete note.__v;
        res.send(json ? JSON.stringify(note, null, 4) : 'Note Updated!\n');
      });
    });
});

app.patch('/notes/:noteId', (req, res) => {
  const { username } = JSON.parse(req.headers.authorization);
  const { noteId } = req.params;
  const { json } = req.query;
  const noteObj = parseNote(req);
  const query = { username, noteId };
  Note.findOne(query).then((note) => {
    if (!note)
      return res.status(404).send('Can\'t update note, does not exist!\n');
    const updatedFields = {
      title: noteObj.title || note.title,
      content: note.content + noteObj.content,
      categories: noteObj.categories ? [...new Set([...note.categories, ...noteObj.categories])] : note.categories,
      last_modified: new Date(),
    };
    note.set(updatedFields);
    note.save().then((note) => {
      note = note.toObject();
      delete note._id;
      delete note.__v;
      res.send(json ? JSON.stringify(note, null, 4) : 'Note Appended!\n');
    });
  });
});

app.delete('/notes/:noteId', (req, res) => {
  const { username } = JSON.parse(req.headers.authorization);
  const { noteId } = req.params;
  const { json } = req.query;
  const query = { username, noteId };
  Note.findOneAndDelete(query).select({ _id: 0, __v: 0}).then((note) => {
    if (!note)
      return res.status(404).send('Couldn\'t delete note, does not exist!\n');
    return res.status(200).send(json ? JSON.stringify(note.toObject(), null, 4) : 'Note Deleted!\n');
  });
});

// /categories endpoints

app.get('/categories', (req, res) => {
  const { username } = JSON.parse(req.headers.authorization);
  const query = { username };
  Note.find(query).select({ _id: 0, __v: 0})
    .then((notes) => {
      const categories = notes.reduce((acc, note) => {
        return [...new Set([...acc, ...note.categories])];
      }, []);
      res.send(JSON.stringify(categories, null, 4));
    });
});

app.get('/categories/:categoryName', (req, res) => {
  const { username } = JSON.parse(req.headers.authorization);
  const { categoryName } = req.params;
  const query = { username, categories: [categoryName] };
  Note.find(query).select({ _id: 0, __v: 0}).then((notes) => {
    notes = notes.map((note) => {
      return note.toObject();
    });
    res.send(JSON.stringify(notes, null, 4));
  });
});

app.delete('/categories/:categoryName', (req, res) => {
  const { username } = JSON.parse(req.headers.authorization);
  const { categoryName } = req.params;
  const query = { username, categories: [categoryName] };
  Note.deleteMany(query).select({ _id: 0, __v: 0}).then((notes) => {
    if (!notes.deletedCount)
      return res.status(404).send('Couldn\'t delete notes, does not exist!\n');
    return res.status(200).send('Notes Deleted!\n');
  });
});

// auth endpoints
app.post('/register', (req, res) => {
  const { username, password } = JSON.parse(req.headers.authorization);
  if (!username || !password)
    return res.status(400).send('Bad Request, missing username or password!\n');
  const query = { username };
  User.findOne(query).then((user) => {
    if (user)
      return res.status(409).send('User already exists!\n');
    bcrypt.hash(password, SALT_ROUNDS, (err, hash) => {
      const newUser = new User({ username, password: hash });
      newUser.save().then((user) => {
        res.send(`Successfully created user ${username}!\n`);
      });
    });
  });
});

app.delete('/users/:username', (req, res) => {
  const { username } = JSON.parse(req.headers.authorization);
  if (username !== req.params.username)
    return res.status(401).send('Unauthorized!\n');
  const query = { username };
  Note.deleteMany(query).then((notes) => {
    User.findOneAndDelete(query).then((user) => {
      return res.status(200).send(
        notes ? `Successfully deleted user ${username} and all associated notes!\n` : `Successfully deleted user ${username}!\n`
      );
    });
  });
});

app.get('/login', (req, res) => {
  const { username } = JSON.parse(req.headers.authorization);
  if (username === DEFAULT_USER){
    res.set('WWW-Authenticate', 'Basic realm="401"');
    return res.status(401).send('Unauthorized!\n');
  }
  return res.status(200).send(`Successfully logged in as ${username}!\n`);
});

app.get('/logout', (req, res) => {
  const { username } = JSON.parse(req.headers.authorization);
  return res.status(401).send(`Successfully logged out ${username}!\n`);
});

app.all('*', (req, res) => {
  res.status(404).send('Not Found!\n');
});

export default app;
