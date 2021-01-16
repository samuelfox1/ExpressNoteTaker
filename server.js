// ==========================REQUIRED_PACKAGES==================================
const express = require("express");
const { v4: uuidv4 } = require('uuid');

// ==========================REQUIRED_MODULES===================================
const fs = require('fs')
const path = require("path");
const { resolve } = require("path");

// ==============================VARIABLES======================================
// CONST - define a constant reference to a value) = VALUE (basic values cannot be changed) or object (values inside objects can be changed)
// Tells node that we are creating an "express" server
const app = express();
// use a dynamic port when deployed on heroku server, or static 8080 when deployed on local server
const PORT = process.env.PORT || 8080;
// used to store db.json data
const dbData = []
// ==============================MIDDLEWARE=====================================

// Sets up the Express app to handle data parsing
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// middle ware to point towards public folder?
app.use(express.static('public'))
// =============================================================================


// ==============================ROUTER=========================================
// The below points our server to a series of "route" files.
// These routes give our server a "map" of how to respond when users visit or request data from various URLs.
// =============================================================================

//---------------------GET--------------------------
// GET * - Should return the index.html file
app.get('/', function (req, res) {
    //respond with finding the directory and sending the 'index.html' file
    res.sendFile(path.join(__dirname, 'index.html'))
})

// GET /notes - Should return the notes.html file.
app.get("/notes", (req, res) => {
    //respond with finding the directory and sending the 'notes.html' file
    res.sendFile(path.join(__dirname, '/public/notes.html'))

})

// GET /api/notes - Should read the db.json file and return all saved notes as JSON.
app.get("/api/notes", (req, res) => {
    console.log('-GET-')
    fs.readFile('db/db.json', 'utf8', (err, data) => {
        if (err) throw err
        res.json(JSON.parse(data))
    })

})

//---------------------POST-------------------------
//POST /api/notes - Should receive a new note to save on the request body, add it to the db.json file, and then return the new note to the client.
app.post('/api/notes', (req, res) => {
    console.log('-POST-')
    let note = req.body

    async function checkNote(editedNote) {
        // if a note does not have a unique id, it is a new note.
        if (editedNote.id === '' || editedNote.id === undefined) {
            console.log('-new note-')
            // assign the new note a unique id
            editedNote.id = uuidv4()
            // push the note into the global dbData array
            dbData.push(note)
            console.log(dbData)
        }
        // if the note has a unique id, it exists in the database already
        else {
            console.log('-existing note-')
            // run the readDb function, and wait for the response to filter throu array to find existing note id
            const readDataBase = await readDb(editedNote)
            const updateNote = JSON.parse(readDataBase).filter(x => x.id === editedNote.id)
            console.log('before')
            console.log(updateNote)
            //for the note id that matches, update the title & text to the new values
            updateNote.forEach(x => {
                x.title = editedNote.title
                x.text = editedNote.text
            });
            console.log('after')
            console.log(updateNote)
        }

    }

    checkNote(note)


    // // read the db.json file to get current data
    // fs.readFile('db/db.json', 'utf8', (err, data) => {
    //     if (err) throw err
    //     // parse the read data and store objects in a temp array
    //     let readData = JSON.parse(data)
    //     console.log('test')
    //     readData.forEach(element => {
    //         dbData.push(element)
    //     });
    //     console.log(dbData)
    //     fs.writeFile('db/db.json', JSON.stringify(dbData), err => {
    //         if (err) throw err
    //         console.log('updated')
    //         res.json(dbData)
    //     })
    // })
    // dbData.length = 0
})

// ============================================================================


function readDb(note) {
    return new Promise((resolve, reject) => {
        fs.readFile("db/db.json", "utf-8", (err, data) => {
            if (err) throw err
            // console.log('note')
            // console.log(note)
            // console.log('reading')
            // console.log(data)
            resolve(data)
        })
    })
}


// ==============================LISTENER=======================================
// The below code effectively "starts" our server
//listen to port 8080 for a change in the url path
app.listen(PORT, function () {
    console.log(`App listening on PORT: ${PORT}`);
});
// =============================================================================