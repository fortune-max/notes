# Notes

This is a note-taking API. It allows you to create, read, update and delete notes.

What's more is it allows you to easily manage these notes from the command line, allowing for easy integration with other tools. Or can easily serve as a backend for a note-taking frontend application. It can also be used for a quick pastebin.

It also has support for categories, allowing you to easily group notes together. There are some handy categories which have additional functionality, such as the `tmp` category which allows you to create temporary notes which are automatically deleted after a certain amount of time.

The API can be used while authenticated or unauthenticated. Unauthenticated users can only access public notes, while authenticated users can access both public and private notes.

Basic Authentication is used for authentication and to register a new user. The username and password are sent in the Authorization header as a base64 encoded string. The username and password are separated by a colon. The string is then prefixed with the string `Basic `.

If using a browser and not curl, the `/login` endpoint can be used to perform a login, which makes the header persistent until the user logs out. Logging out is done by going to the `/logout` endpoint.

In the command line, simply prefix the URL with the username and password separated by a colon when making requests to authenticated endpoints. For example, 

```bash
curl USER:PASS@someurl.com/notes
```

## Endpoints

### /notes

#### GET

Returns a list of notes. If the user is authenticated, it will return both public and private notes. If the user is not authenticated, it will only return public notes.

#### POST

Creates a new note using the JSON data in the request body.

### /notes/{id}

#### GET

Returns the note with the given ID.

#### PUT

Updates the note with the given ID using the JSON data in the request body.

#### DELETE

Deletes the note with the given ID.

### /categories

#### GET

Returns a list of all current note categories.

### /categories/{category}

#### GET

Returns a list of all notes in the given category.

#### DELETE

Deletes all notes in the given category.

### /users

#### POST

Creates a new user using the JSON data in the request body.

### /users/{username}

#### GET
Get the user with the given username. Must be authenticated as user.

#### DELETE
Delete the user with the given username. Must be authenticated as user.

### /login

#### GET
Logs the user in using the username and password in the Authorization header.

### /logout

#### GET
Logs the user out.

