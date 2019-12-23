require('dotenv').config()
const { expect } = require('chai')
const knex = require('knex')
const app = require('../src/app')
const { makeFoldersArray, makeMaliciousFolder } = require('./folders.fixtures')

describe('Notes Endpoints', function () {
    let db 
    const cleanup = () =>db.raw('TRUNCATE notes, folders RESTART IDENTITY CASCADE');
    before('make knex instance', () => {
        db = knex({
            client: 'pg',
            connection: process.env.TEST_DB_URL,
        })
        app.set('db', db)
    })

    after('disconnect from db', () => db.destroy())

    before('clean the table', cleanup);

    afterEach('clean the table', cleanup);

    describe(`GET /api/folders`, () => {
        context(`Given no folders`, () => {
            it(`responds with 200 and an empty list`, () => {
                return supertest(app)
                    .get('/api/folders')
                    .expect(200, [])
            })
        })
        context('Given there are folders in the database', () => {
            const testFolders = makeFoldersArray()

        beforeEach('insert folders', () => {
            return db
                .into('folders')
                .insert(testFolders)
        })

        it('GET /folders responds with 200 and all folders', () => {
            return supertest(app)
                .get('/api/folders')
                .expect(200, testFolders)
        })
    })
})

    describe(`GET /api/folders/:folder_id`, () => {
        context(`Given no folders`, () => {
            it(`responds with 404`, () => {
                const folderId = 123456
                return supertest(app)
                .get(`/folders/${folderId}`)
                .expect(404, { error: { message: `Folder doesn't exist` } })
            })
        })
        context('Given there are folders in the db', () => {
            const testFolders = makeFoldersArray()

            beforeEach('insert folders', () => {
                return db
                    .into('folders')
                    .insert(testFolders)
            })

        it('responds with 200 and the specified folder', () => {
           const folderId = 2
           const expectedFolder = testFolders[folderId -1]
           // same comment here as in notes
           return supertest(app)
            .get(`/folders/${folderId}`)
            .expect(200, expectedFolder) 
            })
        })

        context(`Given an XSS attack Folder`, () => {
            const maliciousFolder = makeMaliciousFolder();
            const expectedFolder = {
                id: 8,
                name: 'Bad Folder&lt;script&gt;alert(\"xss\");&lt;/script&gt;'
            }

            beforeEach('insert malicious Folder', () => {
                return db
                    .into('folders')
                    .insert([maliciousFolder])
            })
            it('removes XSS attack content', () => {
                return supertest(app)
                    .get(`/api/folders/${maliciousFolder.id}`)
                    .expect(200)
                    .expect(res => {
                        expect(res.body.name).to.eql(expectedFolder.name)
                    })
            })
        })
    })

    describe(`POST /api/folders`, () => {
        const testFolders = makeFoldersArray();
        beforeEach('insert malicious folder', () => {
            return db
                .into('folders')
                .insert(testFolders)
        })
        it(`creates a Folder, responding with 201 and the new folder`, () => {
            const newFolder = {
                id: 2,
                name: 'new test folder'
            };

            return supertest(app)
                .post('/api/folders')
                .send(newFolder)
                .expect(201)
                .expect(res => {
                    expect(res.body.name).to.eql(newFolder.name)
                    expect(res.body).to.have.property('id')
                    expect(res.body.id).to.eql(newFolder.id)
                    expect(res.headers.location).to.eql(`/api/folders/${res.body.id}`);
                })

                .then(res => {
                    supertest(app)
                        .get(`/api/${res.body.id}`)
                        .expect(res.body)
                })
        })

        const requiredFields = ['name']

        requiredFields.forEach(field => {
            const newFolder = {
                id: 8,
                name: 'new test folder'
            };

            it(`responds with 400 and an error message when the ${field} is missing`, () => {
                delete newFolder[field]

                return supertest(app)
                    .post(`api/folders`)
                    .send(newFolder)
                    .expect(400, {
                        error: { message: `Missing ${field} in request body` }
                    })
            })
        })

        it('removes XSS attack content from response', () => {
            const maliciousFolder = makeMaliciousFolder();
            const expectedFolder = {
                id: 8,
                name: 'bad folder &lt;script&gt;alert(\"xss\");&lt;/script&gt;'
            };

            return supertest(app)
            .post(`/api/folders`)
            .send(maliciousFolder)
            .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
            .expect(201)
            .expect(res => {
              expect(res.body.name).to.eql(expectedFolder.name)
            })
        })
    })

    describe(`DELETE /api/:folder_id`, () => {
        context(`Given no folder`, () => {
            it(`responds with 404`, () => {
                const folderId = 123456
                return supertest(app)
                    .delete(`api/folders/${folderId}`)
                    .expect(404, { error: { message: `Folder does not exist` } })
            })
        })
    })
})
