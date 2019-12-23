require ('dotenv').config()
const knex = require('knex')
const FoldersService = require('../folders/folders-service')
const NotesService = require('../notes/notes-service')

const knexInstance = knex({
    client: 'pg',
    connection: process.env.DB_URL,
})

FoldersService.getAllFolders(knexInstance)
    .then(folders => console.log(folders))
    .then(() =>
        FoldersService.insertFolder(knexInstance, {
            folder_name: 'new folder',
        })
    )
    .then(newFolder => {
        console.log(newFolder)
        return FoldersService.updateFolder(
            knexInstance,
            newFolder.id,
            { folder_name: 'updated folder' }
        ).then(() => FoldersService.getById(knexInstance, newFolder.id))
    })
    .then(folder => {
        console.log(folder)
        return FoldersService.deleteFolder(knexInstance, folder.id)
    })

    NotesService.getAllNotes(knexInstance)
    .then(notes => console.log(notes))
    .then(() =>
        NotesService.insertNote(knexInstance, {
            note_name: 'new note',
            date_modified: new Date(),
            content: 'new content',
        })
    )
    .then(newNote => {
        console.log(newNote)
        return NotesService.updateNote(
            knexInstance,
            newNote.id,
            { note_name: 'updated note' }
        ).then(() => NotesService.getById(knexInstance, newNote.id))
    })
    .then(note => {
        console.log(note)
        return NotesService.deleteNote(knexInstance, note.id)
    })