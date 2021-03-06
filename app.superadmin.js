const express = require('express')
const path = require('path')
const favicon = require('serve-favicon')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const http = require('http')

const api = require('./api/route.superadmin.js')

const app = express()

const port = process.env.PORT || 2999

app.set('port', port)

app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
    extended: false
}))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))

app.use('/api', api)

app.all('/*', function(req, res, next) {
    res.sendFile('index.superadmin.html', { root: __dirname + '/public' })
})

const server = http.createServer(app)

server.listen(port)
server.on('listening', () => console.log(`Server listening on ${port}`))
