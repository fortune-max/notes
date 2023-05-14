const request = require('supertest');
const app = require('./my-express');

describe('Test /notes endpoint', () => {
  test('should respond to the GET request with an array of notes', (done) => {
    request(app)
      .get('/notes')
      .then((response) => {
        expect(response.statusCode).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
        done();
      });
  });

  test('should respond to the POST request with a 200', (done) => {
    request(app)
      .post('/notes')
      .send({ title: 'test', content: 'test content' })
      .then((response) => {
        expect(response.statusCode).toBe(200);
        done();
      });
  });
});

describe('Test /notes/:noteId endpoint', () => {
  test('should respond to the GET request with a note object', (done) => {
    request(app)
      .get('/notes/1')
      .then((response) => {
        expect(response.statusCode).toBe(200);
        expect(typeof response.body).toBe('object');
        done();
      });
  });

  test('should respond to the GET request with a 404', (done) => {
    request(app)
      .get('/notes/100')
      .then((response) => {
        expect(response.statusCode).toBe(404);
        done();
      });
  });

  test('should respond to the DELETE request with a 200', (done) => {
    request(app)
      .delete('/notes/2')
      .then((response) => {
        expect(response.statusCode).toBe(200);
        done();
      });
  });

  test('should respond to the DELETE request with a 404', (done) => {
    request(app)
      .delete('/notes/100')
      .then((response) => {
        expect(response.statusCode).toBe(404);
        done();
      });
  });

  test('should respond to the PUT request with a 200', (done) => {
    request(app)
      .put('/notes/1')
      .then((response) => {
        expect(response.statusCode).toBe(200);
        done();
      });
  });

  test('should respond to the PUT request with a 404', (done) => {
    request(app)
      .put('/notes/100')
      .then((response) => {
        expect(response.statusCode).toBe(404);
        done();
      });
  });

  test('should respond to the POST request with a 200', (done) => {
    request(app)
      .post('/notes/3')
      .send({ title: 'test add new', content: 'test content new' })
      .then((response) => {
        expect(response.statusCode).toBe(200);
        expect(response.body.title).toBe('test add new');
        expect(response.body.content).toBe('test content new');
        done();
      });
  });
});

describe('Test /categories endpoint', () => {
  test('should respond to the GET request with an array of categories', (done) => {
    request(app)
      .get('/categories')
      .then((response) => {
        expect(response.statusCode).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
        done();
      });
  });
});

describe('Test /categories/:categoryId endpoint', () => {
  test('should respond to the GET request with a category object', (done) => {
    request(app)
      .get('/categories/general')
      .then((response) => {
        expect(response.statusCode).toBe(200);
        expect(typeof response.body).toBe('object');
        done();
      });
  });

  test('should respond to the GET request with a 404', (done) => {
    request(app)
      .get('/categories/xdsnbd')
      .then((response) => {
        expect(response.statusCode).toBe(404);
        done();
      });
  });

  test('should respond to the DELETE request with a 204', (done) => {
    request(app)
      .delete('/categories/tmp')
      .then((response) => {
        expect(response.statusCode).toBe(204);
        done();
      });
  });

  test('should respond to the DELETE request with a 404', (done) => {
    request(app)
      .delete('/categories/xdsnbd')
      .then((response) => {
        expect(response.statusCode).toBe(404);
        done();
      });
  });
});

describe('Test /users endpoint', () => {
  test('should add new user with POST and be able to GET', (done) => {
    request(app)
      .post('/users')
      .send({ username: 'testUser', password: 'testPassword' })
      .then((postUserResponse) => {
        expect(postUserResponse.statusCode).toBe(200);

        request(app)
          .get('/users/testUser')
          .then((getUserResponse) => {
            expect(getUserResponse.statusCode).toBe(200);
            expect(typeof getUserResponse.body).toBe('object');
            expect(getUserResponse.body.username).toBe('testUser');
            done();
          });
      });
  });

  test('should add new user with POST and be able to DELETE user', (done) => {
    request(app)
      .post('/users')
      .send({ username: 'testUser2', password: 'testPassword2' })
      .then((postUserResponse) => {
        expect(postUserResponse.statusCode).toBe(200);

        request(app)
          .delete('/users/testUser2')
          .then((deleteUserResponse) => {
            expect(deleteUserResponse.statusCode).toBe(204);
            done();
          });
      });
  });
});

describe('Test authentication', () => {
  test('/logout should respond with 401', (done) => {
    request(app)
      .get('/logout')
      .then((response) => {
        expect(response.statusCode).toBe(401);
        done();
      });
  });

  test('/login should respond with 401 if invalid token', (done) => {
    request(app)
      .get('/login')
      .then((response) => {
        expect(response.statusCode).toBe(401);
        done();
      });
  });

  test('/login should respond with 200 if valid token', (done) => {
    const token = btoa('dummyUser:dummyPassword');

    request(app)
      .get('/login')
      .set('Authorization', `Bearer ${token}`)
      .then((response) => {
        expect(response.statusCode).toBe(200);
        done();
      });
  });
});
