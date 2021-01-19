// the express framework will be used to communicate between our front end and backend over https
const express = require("express");
// fs module will be used to read & write to 'db.json' file as the database
const fs = require('fs')
// uuid module will be used to generate uniqe id#'s for each note
const { v4: uuidv4 } = require('uuid');
// path module will auto-fill the file path to a specified file
const path = require("path");
// Tells node that we are creating an "express" server
const app = express();
// use a dynamic port when deployed on heroku server, or static 8080 when deployed on local server
const PORT = process.env.PORT || 8080;
// Sets up the Express app to handle data parsing
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// middleware to point towards public folder
app.use(express.static('public'))

// ===============================ROUTING=======================================

//----------------GET-------------------
app.get('/', function (req, res) {
    // respond with finding the directory and sending the 'index.html' file
    res.sendFile(path.join(__dirname, '/public/index.html'))
})
app.get("/notes", (req, res) => {
    // respond with finding the directory and sending the 'notes.html' file
    res.sendFile(path.join(__dirname, '/public/notes.html'))
})
app.get("/api/notes", (req, res) => {
    // read the 'db.json' file and return the data
    fs.readFile('db/db.json', 'utf8', (err, data) => {
        if (err) throw err
        res.json(JSON.parse(data))
    })
})

//---------------POST-------------------
app.post('/api/notes', (req, res) => {
    let note = req.body
    // async function to 1.Check if note saved is new or existing. 2.Update data accordingly. 3. Save changes to 'db.json' file.
    async function updateDb(note) {
        // run the readDb function, and wait for the response
        const currentDb = await readDb()
        let newNote = true
        // if the id of note saved matches an id in the database, update that object.
        currentDb.filter((x) => {
            if (x.id === note.id) {
                x.title = note.title
                x.text = note.text
                //set status variable to false to skip creating a new object.
                newNote = false
                console.log(`Note '${note.title}' updated`)
            }
        })
        // if note is new, create an id number, add object to currentDb array
        if (newNote) {
            note.id = uuidv4()
            currentDb.push(note)
            console.log(`Note '${note.title}' added`)
        }
        // write the updated data to the db.json file
        await writeDb(currentDb).then(() => {
            res.json('updated')
        })
    }
    updateDb(note)
})

//--------------DELETE------------------
app.delete('/api/notes/:id', (req, res) => {
    let id = req.params.id

    async function deleteNoteFromDb(id) {
        const currentDb = await readDb()
        for (let i = 0; i < currentDb.length; i++) {
            if (currentDb[i].id === id) {
                console.log(`Note '${currentDb[i].title}' deleted`)
                currentDb.splice(i, 1)
            }
        }
        // write the updated data to the db.json file
        await writeDb(currentDb).then(() => {
            res.json('updated')
        })
    }
    deleteNoteFromDb(id)
})

// ==============================FUNCTIONS======================================
function readDb() {
    return new Promise((resolve, reject) => {
        // read the 'db.json' file and return the data
        fs.readFile('db/db.json', 'utf-8', (err, data) => {
            if (err) throw err
            // respond to await function
            resolve(JSON.parse(data))
        })
    })
}
function writeDb(updatedData) {
    return new Promise((resolve, reject) => {
        // write the updated data to the 'db.json' file
        fs.writeFile('db/db.json', JSON.stringify(updatedData), err => {
            if (err) throw err
            // respond to await function
            resolve()
        })
    })
}

// ==============================LISTENER=======================================
app.listen(PORT, function () {
    console.log(`Express Note Taker listening on PORT: ${PORT}`);
});