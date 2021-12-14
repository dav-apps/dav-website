import express from 'express'
import ejs from 'ejs'
import path from 'path'
import url from 'url'
import dotenv from 'dotenv'
import { Server } from 'socket.io'
import {
	Dav,
	Auth,
	App as DavApp,
	Environment,
	AppsController,
	SessionsController,
	ApiResponse,
	ApiErrorResponse,
	SessionResponseData,
	SignupResponseData,
	UsersController
} from 'dav-js'
import * as websocket from './websocket.js'
import { getLocale } from './src/locales.js'

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

		this.express.set("view engine", "html")
		this.express.engine('html', ejs.renderFile)
		this.express.set('views', path.join(__dirname, 'src/pages'))

		router.use(express.static(path.join(__dirname, 'src/pages')))
		router.use(express.json())

		router.get('/', (req, res) => {
			let locale = getLocale(req.acceptsLanguages()[0])

			res.render("start-page/start-page", {
				lang: locale.lang,
				locale: locale.startPage
			})
		})

		router.get('/login', (req, res) => {
			let locale = getLocale(req.acceptsLanguages()[0])

			res.render("login-page/login-page", {
				lang: locale.lang,
				locale: locale.loginPage
			})
		})

		router.get('/signup', (req, res) => res.render("signup-page/signup-page"))

		router.get('/pricing', (req, res) => {
			let locale = getLocale(req.acceptsLanguages()[0])

			res.render("pricing-page/pricing-page", {
				lang: locale.lang,
				locale: locale.pricingPage,
				pricingLocale: locale.misc.pricing
			})
		})

		router.get('/dev', (req, res) => res.render("dev-page/dev-page"))
		router.get('/dev/statistics', (req, res) => res.render("statistics-page/statistics-page"))
		router.get('/dev/:appId', (req, res) => res.render("app-page/app-page"))

		router.get('/apps', async (req, res) => {
			this.init()

			// Get the apps
			let response = await AppsController.GetApps()
			let locale = getLocale(req.acceptsLanguages()[0])

			if (response.status == 200) {
				let responseData = (response as ApiResponse<DavApp[]>).data

				res.render("apps-page/apps-page", {
					lang: locale.lang,
					locale: locale.appsPage,
					apps: responseData
				})
			} else {
				res.render("apps-page/apps-page", {
					lang: locale.lang,
					locale: locale.appsPage,
					apps: []
				})
			}
		})

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

		router.post('/signup', async (req, res) => {
			if (!this.checkReferer(req, res)) return
			this.init()

			// Do the API request
			let response: ApiResponse<SignupResponseData> | ApiErrorResponse = await UsersController.Signup({
				auth: this.auth,
				email: req.body.email,
				firstName: req.body.firstName,
				password: req.body.password,
				appId: +process.env.APP_ID,
				apiKey: process.env.API_KEY,
				deviceName: "",
				deviceOs: ""
			})
			
			if (response.status == 201) {
				response = response as ApiResponse<SignupResponseData>
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