import * as path from 'path'
import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import dotenv from 'dotenv'
import * as websocket from './websocket.js'

dotenv.config()

const app = express()
const http = createServer(app)
const io = new Server(http)

function getRoot(request, response) {
	response.sendFile(path.resolve('./dav-website/index.html'))
}

function getUndefined(request, response) {
	response.sendFile(path.resolve('./dav-website/index.html'))
}

app.use(express.static('./dav-website'))

app.get('/', getRoot)
app.get('/*', getUndefined)

io.on('connection', (socket) => {
	// Check if the request has the referer header
	let refererHeader = socket.handshake.headers.referer

	if (!refererHeader || !refererHeader.startsWith(process.env.BASE_URL)) {
		// Close the connection
		socket.disconnect()
	} else {
		websocket.init(socket)
	}
})

http.listen(process.env.PORT || 3000)