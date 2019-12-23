function makeNotesArray() {
    return [
        {
            id: 1,
            note_name: 'test note 1',
            date_modified: Date.now(),
            folder_id: '1',
            content: 'test content'
        },
        {
            id: 2,
            note_name: 'test note 2',
            date_modified: Date.now(),
            folder_id: '2',
            content: 'test content'
        },
        {
            id: 3,
            note_name: 'test note 3',
            date_modified: Date.now(),
            folder_id: '3',
            content: 'test content'
        },
    ];
}
module.exports = {makeNotesArray};