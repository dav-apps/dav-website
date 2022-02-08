import express from 'express'
import ejs from 'ejs'
import path from 'path'
import url from 'url'
import dotenv from 'dotenv'
import CryptoJS from 'crypto-js'
import { DateTime } from 'luxon'
import Stripe from 'stripe'
import {
	Dav,
	Auth,
	App as DavApp,
	User,
	Environment,
	AppsController,
	SessionsController,
	UsersController,
	DevsController,
	UserActivitiesController,
	AppUsersController,
	AppUserActivitiesController,
	CheckoutSessionsController,
	CustomerPortalSessionsController,
	ApiResponse,
	ApiErrorResponse,
	SessionResponseData,
	SignupResponseData,
	GetDevResponseData,
	GetUsersResponseData,
	GetUserActivitiesResponseData,
	GetAppUsersResponseData,
	GetAppUserActivitiesResponseData,
	CreateCheckoutSessionResponseData,
	CreateCustomerPortalSessionResponseData
} from 'dav-js'
import { CsrfToken, CsrfTokenContext } from './src/types.js'
import { supportedLocales, getLocale } from './src/locales.js'

dotenv.config()

const __dirname = path.dirname(url.fileURLToPath(import.meta.url))

export class App {
	public express
	private initialized: boolean = false
	private auth: Auth
	private csrfTokenStore: {
		[key: string]: CsrfToken
	} = {}

	constructor() {
		this.express = express()
		this.mountRoutes()
	}

	private mountRoutes() {
		const router = express.Router()

		this.express.set("view engine", "html")
		this.express.engine('html', ejs.renderFile)
		this.express.set('views', path.join(__dirname, 'src/pages'))

		router.use(express.static(path.join(__dirname, 'src/pages')))
		router.use(express.json())
		router.use(express.raw({ type: "image/*" }))

		//#region Public endpoints
		router.get('/', async (req, res) => {
			let locale = getLocale(req.acceptsLanguages(supportedLocales) as string)
			let user = await this.getUser(this.getRequestCookies(req)["accessToken"])

			if (user != null) {
				res.render("user-start-page/user-start-page", {
					lang: locale.lang,
					locale: locale.userStartPage,
					navbarLocale: locale.navbarComponent,
					user
				})
			} else {
				res.render("start-page/start-page", {
					lang: locale.lang,
					locale: locale.startPage,
					navbarLocale: locale.navbarComponent,
					footerLocale: locale.footerComponent,
					user: null,
					isMobile: req.headers["sec-ch-ua-mobile"] == "?1"
				})
			}
		})

		router.get('/login', async (req, res) => {
			let locale = getLocale(req.acceptsLanguages(supportedLocales) as string)
			let user = await this.getUser(this.getRequestCookies(req)["accessToken"])
			let csrfToken = this.addCsrfToken(CsrfTokenContext.LoginPage)

			res.render("login-page/login-page", {
				lang: locale.lang,
				locale: locale.loginPage,
				navbarLocale: locale.navbarComponent,
				user,
				csrfToken
			})
		})

		router.get('/signup', async (req, res) => {
			let locale = getLocale(req.acceptsLanguages(supportedLocales) as string)
			let user = await this.getUser(this.getRequestCookies(req)["accessToken"])
			let csrfToken = this.addCsrfToken(CsrfTokenContext.SignupPage)

			res.render("signup-page/signup-page", {
				lang: locale.lang,
				locale: locale.signupPage,
				navbarLocale: locale.navbarComponent,
				user,
				csrfToken
			})
		})

		router.get('/logout', (req, res) => {
			// Remove the accessToken cookie and redirect to the start page
			res.clearCookie("accessToken").redirect("/")
		})

		router.get('/contact', async (req, res) => {
			let locale = getLocale(req.acceptsLanguages(supportedLocales) as string)
			let user = await this.getUser(this.getRequestCookies(req)["accessToken"])

			res.render("contact-page/contact-page", {
				lang: locale.lang,
				locale: locale.contactPage,
				navbarLocale: locale.navbarComponent,
				footerLocale: locale.footerComponent,
				user
			})
		})

		router.get('/privacy', async (req, res) => {
			let locale = getLocale(req.acceptsLanguages(supportedLocales) as string)
			let user = await this.getUser(this.getRequestCookies(req)["accessToken"])

			res.render("privacy-page/privacy-page", {
				lang: locale.lang,
				locale: locale.privacyPage,
				navbarLocale: locale.navbarComponent,
				footerLocale: locale.footerComponent,
				user
			})
		})

		router.get('/pocketlib/terms', async (req, res) => {
			let locale = getLocale(req.acceptsLanguages(supportedLocales) as string)
			let user = await this.getUser(this.getRequestCookies(req)["accessToken"])

			res.render("pocketlib-terms-page/pocketlib-terms-page", {
				lang: locale.lang,
				locale: locale.pocketlibTermsPage,
				navbarLocale: locale.navbarComponent,
				footerLocale: locale.footerComponent,
				user
			})
		})

		router.get('/pricing', async (req, res) => {
			let locale = getLocale(req.acceptsLanguages(supportedLocales) as string)
			let user = await this.getUser(this.getRequestCookies(req)["accessToken"])

			res.render("pricing-page/pricing-page", {
				lang: locale.lang,
				locale: locale.pricingPage,
				navbarLocale: locale.navbarComponent,
				footerLocale: locale.footerComponent,
				pricingLocale: locale.misc.pricing,
				user,
				isMobile: req.headers["sec-ch-ua-mobile"] == "?1"
			})
		})

		router.get('/user', async (req, res) => {
			let locale = getLocale(req.acceptsLanguages(supportedLocales) as string)
			let user = await this.getUser(this.getRequestCookies(req)["accessToken"])
			let csrfToken = this.addCsrfToken(CsrfTokenContext.UserPage)
			let card = null
			let periodEndDate = null

			if (user.PeriodEnd != null) {
				periodEndDate = DateTime.fromJSDate(user.PeriodEnd).setLocale(locale.lang).toFormat('DDD')
			}

			if (req.query.plan == "1") {
				user.Plan = 1
			} else if (req.query.plan == "2") {
				user.Plan = 2
			}

			if (user.StripeCustomerId) {
				// Get the stripe customer and payment method
				let stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: null })
				let paymentMethods = await stripe.customers.listPaymentMethods(user.StripeCustomerId, { limit: 1, type: "card" })

				if (paymentMethods.data.length > 0) {
					card = paymentMethods.data[0].card
				}
			}

			res.render("user-page/user-page", {
				lang: locale.lang,
				locale: locale.userPage,
				navbarLocale: locale.navbarComponent,
				pricingLocale: locale.misc.pricing,
				user,
				csrfToken,
				isMobile: req.headers["sec-ch-ua-mobile"] == "?1",
				card,
				periodEndDate
			})
		})

		router.get('/dev', async (req, res) => {
			let locale = getLocale(req.acceptsLanguages(supportedLocales) as string)
			let accessToken = this.getRequestCookies(req)["accessToken"]
			let user = await this.getUser(accessToken)
			let dev = await this.getDev(accessToken)

			if (user == null || dev == null) {
				res.redirect("/")
			}

			res.render("dev-page/dev-page", {
				lang: locale.lang,
				locale: locale.devPage,
				navbarLocale: locale.navbarComponent,
				user,
				dev
			})
		})

		router.get('/dev/statistics', async (req, res) => {
			let locale = getLocale(req.acceptsLanguages(supportedLocales) as string)
			let user = await this.getUser(this.getRequestCookies(req)["accessToken"])
			let csrfToken = this.addCsrfToken(CsrfTokenContext.DevPages)

			res.render("statistics-page/statistics-page", {
				lang: locale.lang,
				locale: locale.statisticsPage,
				navbarLocale: locale.navbarComponent,
				csrfToken,
				user
			})
		})

		router.get('/dev/:appId', async (req, res) => {
			let locale = getLocale(req.acceptsLanguages(supportedLocales) as string)
			let user = await this.getUser(this.getRequestCookies(req)["accessToken"])
			let csrfToken = this.addCsrfToken(CsrfTokenContext.DevPages)

			res.render("app-page/app-page", {
				lang: locale.lang,
				locale: locale.appPage,
				navbarLocale: locale.navbarComponent,
				csrfToken,
				user
			})
		})

		router.get('/dev/:appId/statistics', async (req, res) => {
			let locale = getLocale(req.acceptsLanguages(supportedLocales) as string)
			let user = await this.getUser(this.getRequestCookies(req)["accessToken"])
			let csrfToken = this.addCsrfToken(CsrfTokenContext.DevPages)

			res.render("app-statistics-page/app-statistics-page", {
				lang: locale.lang,
				locale: locale.appStatisticsPage,
				navbarLocale: locale.navbarComponent,
				csrfToken,
				user
			})
		})

		router.get('/apps', async (req, res) => {
			this.init()

			// Get the apps
			let response = await AppsController.GetApps()
			let locale = getLocale(req.acceptsLanguages(supportedLocales) as string)
			let user = await this.getUser(this.getRequestCookies(req)["accessToken"])

			res.render("apps-page/apps-page", {
				lang: locale.lang,
				locale: locale.appsPage,
				navbarLocale: locale.navbarComponent,
				user,
				apps: response.status == 200 ? (response as ApiResponse<DavApp[]>).data : []
			})
		})
		//#endregion

		//#region API endpoints
		router.get('/api/users', async (req, res) => {
			if (
				!this.checkReferer(req, res)
				|| !this.checkCsrfToken(req.headers["x-csrf-token"] as string, CsrfTokenContext.DevPages)
			) {
				res.status(403).end()
				return
			}
			this.init()

			let response = await UsersController.GetUsers({
				accessToken: this.getRequestCookies(req)["accessToken"]
			})

			if (response.status == 200) {
				response = response as ApiResponse<GetUsersResponseData>
				res.status(response.status).send(response.data)
			} else {
				response = response as ApiErrorResponse
				res.status(response.status).send(response.errors)
			}
		})

		router.get('/api/user_activities', async (req, res) => {
			if (
				!this.checkReferer(req, res)
				|| !this.checkCsrfToken(req.headers["x-csrf-token"] as string, CsrfTokenContext.DevPages)
			) {
				res.status(403).end()
				return
			}
			this.init()

			let response = await UserActivitiesController.GetUserActivities({
				accessToken: this.getRequestCookies(req)["accessToken"],
				start: DateTime.now().startOf("day").minus({ months: 6 }).toSeconds()
			})

			if (response.status == 200) {
				response = response as ApiResponse<GetUserActivitiesResponseData>
				res.status(response.status).send(response.data)
			} else {
				response = response as ApiErrorResponse
				res.status(response.status).send(response.errors)
			}
		})

		router.get('/api/app/:id', async (req, res) => {
			if (
				!this.checkReferer(req, res)
				|| !this.checkCsrfToken(req.headers["x-csrf-token"] as string, CsrfTokenContext.DevPages)
			) {
				res.status(403).end()
				return
			}
			this.init()

			let response = await AppsController.GetApp({
				accessToken: this.getRequestCookies(req)["accessToken"],
				id: +req.params.id
			})

			if (response.status == 200) {
				response = response as ApiResponse<DavApp>
				res.status(response.status).send(response.data)
			} else {
				response = response as ApiErrorResponse
				res.status(response.status).send(response.errors)
			}
		})

		router.get('/api/app/:id/users', async (req, res) => {
			if (
				!this.checkReferer(req, res)
				|| !this.checkCsrfToken(req.headers["x-csrf-token"] as string, CsrfTokenContext.DevPages)
			) {
				res.status(403).end()
				return
			}
			this.init()

			let response = await AppUsersController.GetAppUsers({
				accessToken: this.getRequestCookies(req)["accessToken"],
				id: +req.params.id
			})

			if (response.status == 200) {
				response = response as ApiResponse<GetAppUsersResponseData>
				res.status(response.status).send(response.data)
			} else {
				response = response as ApiErrorResponse
				res.status(response.status).send(response.errors)
			}
		})

		router.get('/api/app/:id/user_activities', async (req, res) => {
			if (
				!this.checkReferer(req, res)
				|| !this.checkCsrfToken(req.headers["x-csrf-token"] as string, CsrfTokenContext.DevPages)
			) {
				res.status(403).end()
				return
			}
			this.init()

			let response = await AppUserActivitiesController.GetAppUserActivities({
				accessToken: this.getRequestCookies(req)["accessToken"],
				id: +req.params.id
			})

			if (response.status == 200) {
				response = response as ApiResponse<GetAppUserActivitiesResponseData>
				res.status(response.status).send(response.data)
			} else {
				response = response as ApiErrorResponse
				res.status(response.status).send(response.errors)
			}
		})

		router.post('/login', async (req, res) => {
			if (
				!this.checkReferer(req, res)
				|| !this.checkCsrfToken(req.headers["x-csrf-token"] as string, CsrfTokenContext.LoginPage)
			) {
				res.status(403).end()
				return
			}
			this.init()

			// Do the API request
			let response = await SessionsController.CreateSession({
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
				res
					.status(response.status)
					.cookie("accessToken", response.data.accessToken, { httpOnly: true, secure: true })
					.send(response.data)
			} else {
				response = response as ApiErrorResponse
				res.status(response.status).send(response.errors)
			}
		})

		router.post('/signup', async (req, res) => {
			if (
				!this.checkReferer(req, res)
				|| !this.checkCsrfToken(req.headers["x-csrf-token"] as string, CsrfTokenContext.SignupPage)
			) {
				res.status(403).end()
				return
			}
			this.init()

			// Do the API request
			let response = await UsersController.Signup({
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
				res
					.status(response.status)
					.cookie("accessToken", response.data.accessToken, { httpOnly: true, secure: true })
					.send(response.data)
			} else {
				response = response as ApiErrorResponse
				res.status(response.status).send(response.errors)
			}
		})

		router.put('/api/user', async (req, res) => {
			if (
				!this.checkReferer(req, res)
				|| !this.checkCsrfToken(req.headers["x-csrf-token"] as string, CsrfTokenContext.UserPage)
			) {
				res.status(403).end()
				return
			}
			this.init()

			let response = await UsersController.UpdateUser({
				accessToken: this.getRequestCookies(req)["accessToken"],
				firstName: req.body.firstName,
				email: req.body.email,
				password: req.body.password
			})

			if (response.status == 200) {
				response = response as ApiResponse<User>
				res.status(response.status).send(response.data)
			} else {
				response = response as ApiErrorResponse
				res.status(response.status).send({ errors: response.errors })
			}
		})

		router.put('/api/user/profile_image', async (req, res) => {
			if (
				!this.checkReferer(req, res)
				|| !this.checkCsrfToken(req.headers["x-csrf-token"] as string, CsrfTokenContext.UserPage)
			) {
				res.status(403).end()
				return
			}
			this.init()

			let response = await UsersController.SetProfileImageOfUser({
				accessToken: this.getRequestCookies(req)["accessToken"],
				data: req.body,
				type: req.headers['content-type']
			})

			if (response.status == 200) {
				response = response as ApiResponse<User>
				res.status(response.status).send(response.data)
			} else {
				response = response as ApiErrorResponse
				res.status(response.status).send({ errors: response.errors })
			}
		})

		router.post('/api/checkout_session', async (req, res) => {
			if (
				!this.checkReferer(req, res)
				|| !this.checkCsrfToken(req.headers["x-csrf-token"] as string, CsrfTokenContext.UserPage)
			) {
				res.status(403).end()
				return
			}
			this.init()

			let response = await CheckoutSessionsController.CreateCheckoutSession({
				accessToken: this.getRequestCookies(req)["accessToken"],
				mode: req.body.mode,
				plan: req.body.plan,
				successUrl: req.body.successUrl,
				cancelUrl: req.body.cancelUrl
			})

			if (response.status == 201) {
				response = response as ApiResponse<CreateCheckoutSessionResponseData>
				res.status(response.status).send(response.data)
			} else {
				response = response as ApiErrorResponse
				res.status(response.status).send({ errors: response.errors })
			}
		})

		router.post('/api/customer_portal_session', async (req, res) => {
			if (
				!this.checkReferer(req, res)
				|| !this.checkCsrfToken(req.headers["x-csrf-token"] as string, CsrfTokenContext.UserPage)
			) {
				res.status(403).end()
				return
			}
			this.init()

			let response = await CustomerPortalSessionsController.CreateCustomerPortalSession({
				accessToken: this.getRequestCookies(req)["accessToken"]
			})

			if (response.status == 201) {
				response = response as ApiResponse<CreateCustomerPortalSessionResponseData>
				res.status(response.status).send(response.data)
			} else {
				response = response as ApiErrorResponse
				res.status(response.status).send({ errors: response.errors })
			}
		})

		router.put('/api/subscription/cancel', async (req, res) => {
			if (
				!this.checkReferer(req, res)
				|| !this.checkCsrfToken(req.headers["x-csrf-token"] as string, CsrfTokenContext.UserPage)
			) {
				res.status(403).end()
				return
			}
			this.init()

			let user = await this.getUser(this.getRequestCookies(req)["accessToken"])

			if (user == null) {
				res.status(412).end()
				return
			}

			let stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: null })
			let subscriptions = await stripe.subscriptions.list({ customer: user.StripeCustomerId })

			if (subscriptions.data.length == 0) {
				res.status(412).end()
				return
			}

			let subscription = subscriptions.data[0]

			// Cancel or continue the subscription
			await stripe.subscriptions.update(subscription.id, {
				cancel_at_period_end: !subscription.cancel_at_period_end
			})

			res.status(200).send({
				cancelAtPeriodEnd: !subscription.cancel_at_period_end
			})
		})

		router.put('/api/app/:id', async (req, res) => {
			if (
				!this.checkReferer(req, res)
				|| !this.checkCsrfToken(req.headers["x-csrf-token"] as string, CsrfTokenContext.DevPages)
			) {
				res.status(403).end()
				return
			}
			this.init()

			let response = await AppsController.UpdateApp({
				accessToken: this.getRequestCookies(req)["accessToken"],
				id: +req.params.id,
				name: req.body.name,
				description: req.body.description,
				webLink: req.body.webLink,
				googlePlayLink: req.body.googlePlayLink,
				microsoftStoreLink: req.body.microsoftStoreLink,
				published: req.body.published
			})

			if (response.status == 200) {
				response = response as ApiResponse<DavApp>
				res.status(response.status).send(response.data)
			} else {
				response = response as ApiErrorResponse
				res.status(response.status).send({ errors: response.errors })
			}
		})
		//#endregion

		this.express.use('/', router)
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

	private getRequestCookies(req) {
		if (req.headers.cookie == null) return {}
		const rawCookies = req.headers.cookie.split('; ')
		const parsedCookies = {}

		rawCookies.forEach(rawCookie => {
			const parsedCookie = rawCookie.split('=')
			parsedCookies[parsedCookie[0]] = parsedCookie[1]
		})

		return parsedCookies
	}

	private async getUser(accessToken: string): Promise<User> {
		if (accessToken == null) return null

		let getUserResponse = await UsersController.GetUser({ accessToken })
		if (getUserResponse.status != 200) return null

		return (getUserResponse as ApiResponse<User>).data
	}

	private async getDev(accessToken: string): Promise<GetDevResponseData> {
		if (accessToken == null) return null

		let getDevResponse = await DevsController.GetDev({ accessToken })
		if (getDevResponse.status != 200) return null

		return (getDevResponse as ApiResponse<GetDevResponseData>).data
	}

	private addCsrfToken(context: CsrfTokenContext): string {
		let token = CryptoJS.lib.WordArray.random(32).toString(CryptoJS.enc.Hex)

		this.csrfTokenStore[token] = {
			creationDate: DateTime.now(),
			context
		}

		return token
	}

	private checkCsrfToken(token: string, context: CsrfTokenContext): boolean {
		if (token == null || token.length == 0) return false

		let currentDate = DateTime.now()
		let result = false

		for (let key of Object.keys(this.csrfTokenStore)) {
			let csrfToken = this.csrfTokenStore[key]
			if (csrfToken == null) continue

			if (csrfToken.creationDate.plus({ hours: 1 }) < currentDate) {
				// Remove the token
				delete this.csrfTokenStore[key]
				continue
			}

			if (csrfToken.context == context && key == token) {
				result = true
				break
			}
		}

		return result
	}
}