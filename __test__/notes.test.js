import request from 'supertest';
import app from '../src/my-express.js';
import { Note } from '../src/models/note.model.js';
import { User } from '../src/models/user.model.js';
import { connect, disconnect } from './mockServer.js';
import notesFixture from './fixtures/notes.fixture.json';
import usersFixture from './fixtures/users.fixture.json';
import { TEST_USER, TEST_PASSWORD } from '../src/constants.js';

describe('Test /notes endpoint', () => {
  beforeEach(async () => {
    await connect();
    await Note.insertMany(notesFixture);
    await User.insertMany(usersFixture);
  });
  
  afterEach(async () => {
    await disconnect();
  });
 
  test('should respond to the GET request with an array of all notes', (done) => {
    request(app)
      .get('/notes')
      .then((response) => {
        const responseJSON = JSON.parse(response.text);
        expect(response.statusCode).toBe(200);
        expect(Array.isArray(responseJSON)).toBe(true);
        expect(responseJSON.length).toBe(2);
        expect(responseJSON[0].title).toBe('test title 1');
        done();
      });
  });

  test('should respond to GET noteID request with a note, no metadata', (done) => {
    request(app)
      .get('/notes/57')
      .then((response) => {
        expect(response.statusCode).toBe(200);
        expect(response.text).toBe('test title 1\ntest content 1');
        done();
      });
  });

  test('should respond 404 for a note that does not exist', (done) => {
    request(app)
      .get('/notes/999')
      .then((response) => {
        expect(response.statusCode).toBe(404);
        done();
      });
  });

  test('should respond to the POST request with ID of added note', (done) => {
    request(app)
      .post('/notes')
      .send({ title: 'test', content: 'test content' })
      .then((response) => {
        expect(response.statusCode).toBe(200);
        const noteId = response.text.split(' ').pop().trim();
        Note.findOne({ noteId }).then((note) => {
          expect(note.title).toBe('test');
          expect(note.content).toBe('test content');
          done();
        });
      });
  });

  test('should reject empty POST request', (done) => {
    request(app)
      .post('/notes')
      .send({})
      .then((response) => {
        expect(response.statusCode).toBe(400);
        done();
      });
  });

  test('should be able to POST a note to a specific noteId', (done) => {
    const noteId = 42;
    request(app)
      .post(`/notes/${noteId}`)
      .send({ title: 'test', content: 'test content' })
      .then((response) => {
        expect(response.statusCode).toBe(200);
        Note.findOne({ noteId }).then((note) => {
          expect(note.title).toBe('test');
          expect(note.content).toBe('test content');
          done();
        });
      });
  });

  test('should reject empty POST request to a specific noteId', (done) => {
    const noteId = 42;
    request(app)
      .post(`/notes/${noteId}`)
      .send({})
      .then((response) => {
        expect(response.statusCode).toBe(400);
        done();
      });
  });

  test('should update a note with PUT request', (done) => {
    const noteId = 57;
    request(app)
      .put(`/notes/${noteId}`)
      .send({ title: 'test upd', content: 'test content upd' })
      .then((response) => {
        expect(response.statusCode).toBe(200);
        Note.findOne({ noteId }).then((note) => {
          expect(note.title).toBe('test upd');
          expect(note.content).toBe('test content upd');
          done();
        });
      });
  });

  test('should return 404 if cannot find note to updatewith PUT', (done) => {
    const noteId = 999;
    request(app)
      .put(`/notes/${noteId}`)
      .send({ title: 'test upd', content: 'test content upd' })
      .then((response) => {
        expect(response.statusCode).toBe(404);
        done();
      });
  });

  test('should append content to a note with PATCH request', (done) => {
    const noteId = 57;
    request(app)
      .patch(`/notes/${noteId}`)
      .send({ content: 'test content upd' })
      .then((response) => {
        expect(response.statusCode).toBe(200);
        Note.findOne({ noteId }).then((note) => {
          expect(note.title).toBe('test title 1');
          expect(note.content).toBe('test content 1test content upd');
          done();
        });
      });
  });

  test('should return 404 if cannot find note to update with PATCH', (done) => {
    const noteId = 999;
    request(app)
      .patch(`/notes/${noteId}`)
      .send({ content: 'test content upd' })
      .then((response) => {
        expect(response.statusCode).toBe(404);
        done();
      });
  });

  test('should delete a note with DELETE request', (done) => {
    const noteId = 57;
    request(app)
      .delete(`/notes/${noteId}`)
      .then((response) => {
        expect(response.statusCode).toBe(200);
        Note.findOne({ noteId }).then((note) => {
          expect(note).toBe(null);
          done();
        });
      });
  });

  test('should return 404 if cannot find note to delete', (done) => {
    const noteId = 999;
    request(app)
      .delete(`/notes/${noteId}`)
      .then((response) => {
        expect(response.statusCode).toBe(404);
        done();
      });
  });
});

describe('Test /categories endpoint', () => {
  beforeEach(async () => {
    await connect();
    await Note.insertMany(notesFixture);
    await User.insertMany(usersFixture);
  });

  afterEach(async () => {
    await disconnect();
  });

  test('should return all categories for all notes', (done) => {
    request(app)
      .get('/categories')
      .then((response) => {
        const responseJSON = JSON.parse(response.text);
        expect(response.statusCode).toBe(200);
        expect(Array.isArray(responseJSON)).toBe(true);
        expect(responseJSON.length).toBe(2);
        expect(responseJSON[0]).toBe('default');
        expect(responseJSON[1]).toBe('tmp');
        done();
      });
  });

  test('get all notes for a category', (done) => {
    request(app)
      .get('/categories/default')
      .then((response) => {
        const responseJSON = JSON.parse(response.text);
        expect(response.statusCode).toBe(200);
        expect(Array.isArray(responseJSON)).toBe(true);
        expect(responseJSON.length).toBe(1);
        expect(responseJSON[0].title).toBe('test title 1');
        done();
      });
  });

  test('delete a category', (done) => {
    request(app)
      .delete('/categories/default')
      .then((response) => {
        expect(response.statusCode).toBe(200);
        Note.findOne({ categories: ['default'] }).then((note) => {
          expect(note).toBe(null);
          done();
        });
      });
    });

  test('try to delete a category that does not exist', (done) => {
    request(app)
      .delete('/categories/doesnotexist')
      .then((response) => {
        expect(response.statusCode).toBe(404);
        done();
      });
  });
});

describe('Test json=true query param', () => {
  beforeEach(async () => {
    await connect();
    await Note.insertMany(notesFixture);
    await User.insertMany(usersFixture);
  });
  
  afterEach(async () => {
    await disconnect();
  });

  test('should respond to GET noteID w/ JSON query request with a note object', (done) => {
    request(app)
      .get('/notes/57?json=true')
      .then((response) => {
        const responseJSON = JSON.parse(response.text);
        expect(response.statusCode).toBe(200);
        Note.findOne({ noteId: responseJSON.noteId }).then((note) => {
          expect(note.title).toBe(responseJSON.title);
          expect(note.content).toBe(responseJSON.content);
          expect(note.title).toBe('test title 1');
          expect(note.content).toBe('test content 1');
          done();
        });
      });
  });

  test('should respond to the POST request with JSON of added note', (done) => {
    request(app)
      .post('/notes?json=true')
      .send({ title: 'test', content: 'test content' })
      .then((response) => {
        expect(response.statusCode).toBe(200);
        const responseJSON = JSON.parse(response.text);
        Note.findOne({ noteId: responseJSON.noteId }).then((note) => {
          expect(note.title).toBe(responseJSON.title);
          expect(note.content).toBe(responseJSON.content);
          expect(note.title).toBe('test');
          expect(note.content).toBe('test content');
          done();
        });
      });
  });

  test('should be able to POST a note to a specific noteId with JSON', (done) => {
    request(app)
      .post('/notes/42?json=true')
      .send({ title: 'test', content: 'test content' })
      .then((response) => {
        expect(response.statusCode).toBe(200);
        const responseJSON = JSON.parse(response.text);
        Note.findOne({ noteId: responseJSON.noteId }).then((note) => {
          expect(note.title).toBe(responseJSON.title);
          expect(note.content).toBe(responseJSON.content);
          expect(note.title).toBe('test');
          expect(note.content).toBe('test content');
          done();
        });
      });
  });

  test('should update a note with PUT request with JSON', (done) => {
    request(app)
      .put('/notes/57?json=true')
      .send({ title: 'test upd', content: 'test content upd' })
      .then((response) => {
        expect(response.statusCode).toBe(200);
        const responseJSON = JSON.parse(response.text);
        Note.findOne({ noteId: responseJSON.noteId }).then((note) => {
          expect(note.title).toBe(responseJSON.title);
          expect(note.content).toBe(responseJSON.content);
          expect(note.title).toBe('test upd');
          expect(note.content).toBe('test content upd');
          done();
        });
      });
  });

  test('should append content to a note with PATCH request with JSON', (done) => {
    request(app)
      .patch('/notes/57?json=true')
      .send({ content: 'test content upd' })
      .then((response) => {
        expect(response.statusCode).toBe(200);
        const responseJSON = JSON.parse(response.text);
        Note.findOne({ noteId: responseJSON.noteId }).then((note) => {
          expect(note.title).toBe(responseJSON.title);
          expect(note.content).toBe(responseJSON.content);
          expect(note.title).toBe('test title 1');
          expect(note.content).toBe('test content 1test content upd');
          done();
        });
      });
  });

  test('should delete a note with DELETE request with JSON', (done) => {
    const noteId = 57;
    request(app)
      .delete(`/notes/${noteId}?json=true`)
      .then((response) => {
        expect(response.statusCode).toBe(200);
        const responseJSON = JSON.parse(response.text);
        Note.findOne({ noteId: responseJSON.noteId }).then((note) => {
          expect(note).toBe(null);
          done();
        });
      });
  });
});

describe('Test authentication and account actions', () => {
  beforeEach(async () => {
    await connect();
    await Note.insertMany(notesFixture);
    await User.insertMany(usersFixture);
  });
  
  afterEach(async () => {
    await disconnect();
  });

  test('/login should respond with 200 if valid credentials', (done) => {
    request(app)
      .get('/login')
      .set('Authorization', `Bearer ${btoa(TEST_USER + ':' + TEST_PASSWORD)}`)
      .then((response) => {
        expect(response.statusCode).toBe(200);
        done();
      });
  });

  test('/login should respond with 401 if invalid credentials', (done) => {
    request(app)
      .get('/login')
      .set('Authorization', `Bearer ${btoa('invalidUser:invalidPassword')}`)
      .then((response) => {
        expect(response.statusCode).toBe(401);
        done();
      });
  });

  test('/login should respond with 401 if incorrect credentials', (done) => {
    request(app)
      .get('/login')
      .set('Authorization', `Bearer ${btoa(TEST_USER + ':' + 'invalidPassword')}`)
      .then((response) => {
        expect(response.statusCode).toBe(401);
        done();
      });
  });

  test('/login should respond with 401 if no credentials', (done) => {
    request(app)
      .get('/login')
      .then((response) => {
        expect(response.statusCode).toBe(401);
        done();
      });
  });

  test('/logout should respond with 401', (done) => {
    request(app)
      .get('/logout')
      .then((response) => {
        expect(response.statusCode).toBe(401);
        done();
      });
  });

  test('/register should respond with 200 if valid credentials', (done) => {
    request(app)
      .post('/register')
      .set('Authorization', `Bearer ${btoa('newUser:newPassword')}`)
      .then((response) => {
        expect(response.statusCode).toBe(200);
        done();
      });
  });

  test('/register should respond with 409 if username exists', (done) => {
    request(app)
      .post('/register')
      .set('Authorization', `Bearer ${btoa(TEST_USER + ':' + TEST_PASSWORD)}`)
      .then((response) => {
        expect(response.statusCode).toBe(409);
        done();
      });
  });

  test('/register should respond with 400 if incomplete credentials', (done) => {
    request(app)
      .post('/register')
      .set('Authorization', `Bearer ${btoa(TEST_USER + ':')}`)
      .then((response) => {
        expect(response.statusCode).toBe(400);
        done();
      });
  });

  test('user can delete their user account', (done) => {
    request(app)
      .delete(`/users/${TEST_USER}`)
      .set('Authorization', `Bearer ${btoa(TEST_USER + ':' + TEST_PASSWORD)}`)
      .then((response) => {
        expect(response.statusCode).toBe(200);
        User.findOne({ username: TEST_USER }).then((user) => {
          expect(user).toBe(null);
          done();
        });
      });
  });

  test('user cannot delete another user account', (done) => {
    request(app)
      .delete(`/users/testuser2`)
      .set('Authorization', `Bearer ${btoa(TEST_USER + ':' + TEST_PASSWORD)}`)
      .then((response) => {
        expect(response.statusCode).toBe(401);
        User.findOne({ username: TEST_USER }).then((user) => {
          expect(user).not.toBe(null);
          done();
        });
      });
  });
});

describe('Try other POST Content-Types', () => {
  beforeEach(async () => {
    await connect();
    await Note.insertMany(notesFixture);
    await User.insertMany(usersFixture);
  });
  
  afterEach(async () => {
    await disconnect();
  });

  test('test text/plain Content-Type', (done) => {
    request(app)
      .post('/notes')
      .set('Content-Type', 'text/plain')
      .send('test content')
      .then((response) => {
        expect(response.statusCode).toBe(200);
        const noteId = response.text.split(' ').pop().trim();
        Note.findOne({ noteId }).then((note) => {
          expect(note.title).toBe(null);
          expect(note.content).toBe('test content');
          done();
        });
      });
  });

  test('test application/x-www-form-urlencoded Content-Type', (done) => {
    request(app)
      .post('/notes')
      .set('Content-Type', 'application/x-www-form-urlencoded')
      .send('title=test&content=test content')
      .then((response) => {
        expect(response.statusCode).toBe(200);
        const noteId = response.text.split(' ').pop().trim();
        Note.findOne({ noteId }).then((note) => {
          expect(note.title).toBe('test');
          expect(note.content).toBe('test content');
          done();
        });
      });
  });

  test('test multipart/form-data Content-Type', (done) => {
    request(app)
      .post('/notes')
      .set('Content-Type', 'multipart/form-data')
      .field('f:1', 'test content')
      .then((response) => {
        expect(response.statusCode).toBe(200);
        const noteId = response.text.split(' ').pop().trim();
        Note.findOne({ noteId }).then((note) => {
          expect(note.title).toBe(null);
          expect(note.content).toBe('test content');
          done();
        });
      });
  });
});

describe('Test invalid routes', () => {
  test('test /invalid route', (done) => {
    request(app)
      .get('/invalid')
      .then((response) => {
        expect(response.statusCode).toBe(404);
        done();
      });
  });
});
