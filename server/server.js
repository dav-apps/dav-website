import * as path from 'path'
import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import dotenv from 'dotenv'
dotenv.config()
import {
	Dav,
	Auth,
	Environment,
	SessionsController,
	UsersController
} from 'dav-js'
import * as websocket from './websocket.js'

const app = express()
const http = createServer(app)
const io = new Server(http)
var initialized = false
var auth

function getRoot(request, response) {
	response.sendFile(path.resolve('./dav-website/index.html'))
}

function getUndefined(request, response) {
	response.sendFile(path.resolve('./dav-website/index.html'))
}

app.use(express.static('./dav-website'))
app.use(express.json())

app.get('/', getRoot)
app.get('/*', getUndefined)

app.post('/create_session', async (req, res) => {
	if (!checkReferer(req, res)) return
	init()

	let response = await SessionsController.CreateSession({
		auth,
		email: req.body.email,
		password: req.body.password,
		appId: req.body.appId,
		apiKey: req.body.apiKey,
		deviceName: req.body.deviceName,
		deviceOs: req.body.deviceOs
	})

	if (response.status == 201) {
		res.status(response.status).send(response.data)
	} else {
		res.status(response.status).send(response.errors)
	}
})

app.post('/create_session_from_access_token', async (req, res) => {
	if (!checkReferer(req, res)) return
	init()

	let response = await SessionsController.CreateSessionFromAccessToken({
		auth,
		accessToken: req.body.accessToken,
		appId: req.body.appId,
		apiKey: req.body.apiKey,
		deviceName: req.body.deviceName,
		deviceOs: req.body.deviceOs
	})

	if (response.status == 201) {
		res.status(response.status).send(response.data)
	} else {
		res.status(response.status).send(response.errors)
	}
})

// Get the base urls from the environment variables
const baseUrl = process.env.BASE_URL
var baseUrls = []

if (baseUrl != null) {
	baseUrls = baseUrl.split(',')
}

io.on('connection', (socket) => {
	// Check if the request has the referer header
	let refererHeader = socket.handshake.headers.referer

	// Check if the base urls contain the referer
	if (!refererHeader || baseUrls.findIndex(baseUrl => refererHeader.startsWith(baseUrl)) == -1) {
		// Close the connection
		socket.disconnect()
	} else {
		websocket.init(socket)
	}
})

function checkReferer(req, res) {
	// Get the base urls from the environment variables
	const baseUrl = process.env.BASE_URL
	var baseUrls = []

	if (baseUrl != null) {
		baseUrls = baseUrl.split(',')
	}

	// Check if the request has the referer header
	let refererHeader = req.headers.referer

	// Check if the base urls contain the referer
	if (!refererHeader || baseUrls.findIndex(baseUrl => refererHeader.startsWith(baseUrl)) == -1) {
		res.sendStatus(403)
		return false
	}

	return true
}

function init() {
	if (initialized) return
	initialized = true

	new Dav({ environment: process.env.ENV == "production" ? Environment.Production : Environment.Development, server: true })
	auth = new Auth({
		apiKey: process.env.DAV_API_KEY,
		secretKey: process.env.DAV_SECRET_KEY,
		uuid: process.env.DAV_UUID
	})
}

http.listen(process.env.PORT || 3000)