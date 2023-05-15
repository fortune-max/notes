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

## Examples - Most common use-case

e.g. Create a new note, specifying any fields you want (content is required)

```bash
curl -X POST -d '{"title":"My Note","content":"This is my note"}' -H "Content-Type: application/json" someurl.com/notes
```

More convenient way to create a new note using pipes
(Just specifying the note content, API picks an available noteId and returns it as response)

```bash
echo My notes content | curl -F 'f:1=<-' someurl.com/notes
# Created Note! ID: 12

curl someurl.com/notes/12
# My notes content

curl someurl.com/notes/12?json=true
# {"noteId": "12", "title":null, "content":"My notes content", "categories":["default"], "username":"public", "created":"2019-01-01T00:00:00Z", "last_modified":"2019-01-01T00:00:00Z"}

cat somefile | curl -F 'f:1=<-' someurl.com/notes
# Created Note! ID: 29
```

Or specifying the noteId

```bash
echo This is my MOTD with noteId of MOTD | curl -F 'f:1=<-' someurl.com/notes/motd

# To print out note
curl someurl.com/notes/motd
```

Viewing a note

```bash
curl someurl.com/notes/motd
curl someurl.com/notes/1
```

## Endpoints

### /notes

#### GET

Returns a list of notes for the current user. If the user is not authenticated, it will return the list of public notes for the `public` user.

#### POST

Creates a new note using the JSON data in the request body. Returns ID of created note as response

### /notes/{id}

#### GET

Returns the note with the given ID.

#### POST
Inserts a note with the given ID using the JSON data in the request body.

#### PUT

Updates the note with the given ID using the JSON data in the request body.

#### PATCH

Appends the note with the given ID using the JSON data in the request body.

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

### /register

#### POST

Creates a new user using the credentials provided with Basic Authentication.

### /users/{username}

#### DELETE
Delete the user with the given username. Must be authenticated as user.

### /login

#### GET
Logs the user in using the username and password in the Authorization header.

### /logout

#### GET
Logs the user out.

## Next steps

- Make a GUI for notes. For now the app is primarily used through the command line so this is not a priority for me as I am the primary user of the app. As things mature, it will be something I will explore.