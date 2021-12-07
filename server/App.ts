import express from 'express'
import path from 'path'
import url from 'url'
import { Server } from 'socket.io'
import * as websocket from './websocket.js'

const __dirname = path.dirname(url.fileURLToPath(import.meta.url))

export class App {
	public express
	public io

	constructor() {
		this.express = express()
		this.io = new Server()
		this.mountRoutes()
		this.initWebsocketServer()
	}

	private mountRoutes() {
		const router = express.Router()

		router.use(express.static(path.join(__dirname, 'src/pages')))

		router.get('/', (req, res) => res.sendFile(path.join(__dirname, './src/pages/start-page/start-page.html')))
		router.get('/login', (req, res) => res.sendFile(path.join(__dirname, './src/pages/login-page/login-page.html')))

		this.express.use('/', router)
	}

	private initWebsocketServer() {
		// Get the base urls from the environment variables
		const baseUrl = process.env.BASE_URL
		var baseUrls = []

		if (baseUrl != null) {
			baseUrls = baseUrl.split(',')
		}

		this.io.on('connection', (socket) => {
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
	}
}