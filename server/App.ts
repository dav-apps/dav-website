import express from 'express'
import path from 'path'
import url from 'url'
import dotenv from 'dotenv'
import { Server } from 'socket.io'
import {
	Dav,
	Auth,
	Environment,
	SessionsController,
	ApiResponse,
	ApiErrorResponse,
	SessionResponseData
} from 'dav-js'
import * as websocket from './websocket.js'

dotenv.config()

const __dirname = path.dirname(url.fileURLToPath(import.meta.url))

export class App {
	public express
	public io
	private initialized: boolean = false
	private auth: Auth

	constructor() {
		this.express = express()
		this.io = new Server()
		this.mountRoutes()
		this.initWebsocketServer()
	}

	private mountRoutes() {
		const router = express.Router()

		router.use(express.static(path.join(__dirname, 'src/pages')))
		router.use(express.json())

		router.get('/', (req, res) => res.sendFile(path.join(__dirname, './src/pages/start-page/start-page.html')))
		router.get('/login', (req, res) => res.sendFile(path.join(__dirname, './src/pages/login-page/login-page.html')))

		router.post('/login', async (req, res) => {
			if (!this.checkReferer(req, res)) return
			this.init()

			// Do the API request
			let response: ApiResponse<SessionResponseData> | ApiErrorResponse = await SessionsController.CreateSession({
				auth: this.auth,
				email: req.body.email,
				password: req.body.password,
				appId: +process.env.APP_ID,
				apiKey: process.env.API_KEY,
				deviceName: "",
				deviceOs: ""
			})

			if (response.status == 201) {
				response = response as ApiResponse<SessionResponseData>
				res.status(response.status).send(response.data)
			} else {
				response = response as ApiErrorResponse
				res.status(response.status).send(response.errors)
			}
		})

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

	private checkReferer(req: any, res: any) {
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

	private init() {
		if (this.initialized) return
		this.initialized = true

		new Dav({ environment: process.env.ENV == "production" ? Environment.Production : Environment.Development, server: true })
		this.auth = new Auth({
			apiKey: process.env.DAV_API_KEY,
			secretKey: process.env.DAV_SECRET_KEY,
			uuid: process.env.DAV_UUID
		})
	}
}