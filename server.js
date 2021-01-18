// ==========================REQUIRED_PACKAGES==================================
const express = require("express");
const { v4: uuidv4 } = require('uuid');

// ==========================REQUIRED_MODULES===================================
const fs = require('fs')
const path = require("path");
const { resolve, parse } = require("path");
const { Console } = require("console");
const { response } = require("express");

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
// GET / - Should return the index.html file
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

    async function updateDb(note) {
        // run the readDb function, and wait for the response
        const currentDb = await readDb(note)
        const parseDb = JSON.parse(currentDb)
        let newNote = true
        console.log('Current dB')
        console.log(parseDb)
        parseDb.filter(function (x) {
            if (x.id === note.id) {
                x.title = note.title
                x.text = note.text
                newNote = false
                console.log('-exisiting Note, Updated-')
                console.log(parseDb)
            }
        })

        if (newNote) {
            console.log('-new note-')
            note.id = uuidv4()
            parseDb.unshift(note)
            console.log(parseDb)
        }

        fs.writeFile('db/db.json', JSON.stringify(parseDb), err => {
            if (err) throw err
            console.log('-updated Db-')
            res.json('testing response')
        })

    }
    updateDb(note)
})


// ============================================================================


function readDb(note) {
    return new Promise((resolve, reject) => {
        fs.readFile('db/db.json', 'utf-8', (err, data) => {
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