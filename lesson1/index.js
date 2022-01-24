const express = require('express')
const fs = require('fs')
const path = require('path')
const {getPostData, parseCookies, authorized} = require('./helpers/helpers')

const app = express()
const port = 8000

const user = {
    id: 123,
    username: 'testuser',
    password: 'qwerty'
}

app.use(express.static('files'))

app.route('/auth')
.post((req, res) => {
    getPostData(req)
    .then(response => {
        const data = JSON.parse(response)
        if (data.username === user.username && data.password === user.password) {
            res.cookie('userId', user.id, {expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2)})
            res.cookie('authorized', true, {maxAge: new Date(1000 * 60 * 60 * 24 * 2)})
            res.end()
        } else {
            res.cookie('userId', null, {expires: new Date(0)})
            res.cookie('authorized', null, {maxAge: new Date(0)})
            res.status(400).send('Incorrect login or password')
        }
    })
    .catch(error => {
        res.status(500).send(error)
    })
})

app.route('/get')
.get((req, res) => {
    try {
        const files = fs.readdirSync('files').join(', ')
        res.send(files)
    } catch {
        res.status(500).send('Internal server error')
    }
})
.all((req, res) => {
    res.status(405).send('HTTP method not allowed')
})

app.route('/post')
.post((req, res) => {
    const parsedCookies = parseCookies(req)
    if (authorized(user.id, parsedCookies)) {
        getPostData(req)
        .then(response => {
            try {
                const data = JSON.parse(response)
                const filename = data.filename
                const content = data.content
                if (filename === undefined || content === undefined) {
                    res.status(400).send('Filename or content is missing')
                } else {
                    fs.writeFileSync(path.resolve('files', `${filename}.txt`), `${content}`)
                    res.send('Success')
                }
            } catch {
                res.status(400).send('Filename or content is missing')
            }
        })
        .catch(error => {
            res.status(500).send(error)
        })
    } else {
        res.status(401).send('Unauthorized')
    }
})
.all((req, res) => {
    res.status(405).send('HTTP method not allowed')
})

app.route('/delete')
.delete((req, res) => {
    const parsedCookies = parseCookies(req)
    if (authorized(user.id, parsedCookies)) {
        getPostData(req)
        .then(response => {
            try {
                const data = JSON.parse(response)
                const filename = data.filename
                if (filename === undefined) {
                    res.status(400).send('Filename or content is missing')
                } else {
                    try {
                        fs.unlinkSync(path.resolve('files', `${filename}.txt`))
                        res.send('Success')
                    } catch {
                        res.status(404).send('File not found')
                    }
                }
            } catch {
                res.status(400).send('Filename is missing')
            }
        })
        .catch(error => {
            res.status(500).send(error)
        })
    } else {
        res.status(401).send('Unauthorized')
    }
})
.all((req, res) => {
    res.status(405).send('HTTP method not allowed')
})

app.route('/redirect')
.get((req, res) => {
    res.status(301).send('Moved to /redirected')
})
.all((req, res) => {
    res.status(405).send('HTTP method not allowed')
})

app.use((req, res, next) => {
    res.status(404).send('Not found!')
})

app.listen(port, () => {
    console.log(`Server is running on port ${port}`)
})

