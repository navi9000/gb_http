const express = require('express')
const fs = require('fs')

const app = express()
const port = 8000

app.use(express.static('files'))

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
    res.send('Success')
})
.all((req, res) => {
    res.status(405).send('HTTP method not allowed')
})

app.route('/delete')
.delete((req, res) => {
    res.send('Success')
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

