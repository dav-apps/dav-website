import express from "express"
import ejs from "ejs"
import path from "path"
import url from "url"
import dotenv from "dotenv"
import CryptoJS from "crypto-js"
import { DateTime } from "luxon"
import Stripe from "stripe"
import {
	Dav,
	Auth,
	App as DavApp,
	User,
	Dev,
	Environment,
	ErrorCodes,
	isSuccessStatusCode,
	AppsController,
	SessionsController,
	UsersController,
	DevsController,
	UserSnapshotsController,
	AppUserSnapshotsController,
	CheckoutSessionsController,
	CustomerPortalSessionsController,
	ApiResponse,
	ApiErrorResponse,
	ApiErrorResponse2,
	ErrorCode,
	UserSnapshotResource,
	AppUserSnapshotResource,
	CreateCheckoutSessionResponseData,
	CreateCustomerPortalSessionResponseData
} from "dav-js"
import { CsrfToken, CsrfTokenContext } from "./src/types.js"
import { supportedLocales, getLocale } from "./src/locales.js"

dotenv.config()

const __dirname = path.dirname(url.fileURLToPath(import.meta.url))
const accessTokenCookieName = "accessToken"

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
		this.express.engine("html", ejs.renderFile)
		this.express.set("views", path.join(__dirname, "src/pages"))

		router.use(express.static(path.join(__dirname, "src/pages")))
		router.use("/assets", express.static(path.join(__dirname, "../assets")))
		router.use(express.json())
		router.use(express.raw({ type: "image/*", limit: "2mb" }))

		router.use((req, res, next) => {
			this.init()
			next()
		})

		//#region Public endpoints
		router.get("/", async (req, res) => {
			let locale = getLocale(req.acceptsLanguages(supportedLocales))
			let userResponse = await this.getUser(
				this.getRequestCookies(req)["accessToken"]
			)
			let message = req.query.message

			if (userResponse.accessToken) {
				this.setAccessTokenCookie(res, userResponse.accessToken)
			}

			let errorMessageText = null
			let successMessageText = null

			if (message == "passwordReset") {
				successMessageText = locale.misc.messages.passwordResetMessage
			} else if (message == "confirmUser") {
				successMessageText = locale.misc.messages.confirmUserMessage
			} else if (message == "changeEmail") {
				successMessageText = locale.misc.messages.saveNewEmailMessage
			} else if (message == "changePassword") {
				successMessageText = locale.misc.messages.saveNewPasswordMessage
			} else if (message == "resetEmail") {
				successMessageText = locale.misc.messages.resetNewEmailMessage
			} else if (message == "error") {
				errorMessageText = locale.misc.messages.errorMessage
			}

			if (userResponse.user != null) {
				res.render("user-start-page/user-start-page", {
					lang: locale.lang,
					locale: locale.userStartPage,
					navbarLocale: locale.navbarComponent,
					user: userResponse.user,
					errorMessageText,
					successMessageText
				})
			} else {
				res.render("start-page/start-page", {
					lang: locale.lang,
					locale: locale.startPage,
					navbarLocale: locale.navbarComponent,
					footerLocale: locale.footerComponent,
					user: null,
					isMobile: req.headers["sec-ch-ua-mobile"] == "?1",
					errorMessageText,
					successMessageText
				})
			}
		})

		router.get("/login", async (req, res) => {
			let locale = getLocale(req.acceptsLanguages(supportedLocales))
			let userResponse = await this.getUser(
				this.getRequestCookies(req)["accessToken"]
			)
			let csrfToken = this.addCsrfToken(CsrfTokenContext.LoginPage)

			if (userResponse.accessToken) {
				this.setAccessTokenCookie(res, userResponse.accessToken)
			}

			let appId = Number(req.query.appId)
			let apiKey = req.query.apiKey as string
			let redirectUrl = req.query.redirectUrl as string
			let redirect = req.query.redirect as string

			if (redirectUrl) redirectUrl = decodeURIComponent(redirectUrl).trim()
			if (redirect) redirect = decodeURIComponent(redirect).trim()

			let websiteLogin =
				isNaN(appId) && apiKey == null && redirectUrl == null

			if (websiteLogin && userResponse.user != null) {
				if (redirect != null) {
					res.redirect(redirect)
				} else {
					res.redirect("/")
				}

				return
			} else if (!websiteLogin) {
				// Check if appId, apiKey and redirectUrl are present and valid
				if (
					isNaN(appId) ||
					appId <= 0 ||
					apiKey == null ||
					apiKey.length < 2 ||
					redirectUrl == null ||
					redirectUrl.length < 2
				) {
					res.redirect("/?message=error")
					return
				}
			}

			res.render("login-page/login-page", {
				lang: locale.lang,
				locale: locale.loginPage,
				navbarLocale: locale.navbarComponent,
				sessionExpiredDialogLocale: locale.misc.expiredSessionDialog,
				user: userResponse.user,
				csrfToken,
				websiteLogin
			})
		})

		router.get("/signup", async (req, res) => {
			let locale = getLocale(req.acceptsLanguages(supportedLocales))
			let userResponse = await this.getUser(
				this.getRequestCookies(req)["accessToken"]
			)
			let csrfToken = this.addCsrfToken(CsrfTokenContext.SignupPage)

			if (userResponse.accessToken) {
				this.setAccessTokenCookie(res, userResponse.accessToken)
			}

			let appId = Number(req.query.appId)
			let apiKey = req.query.apiKey as string
			let redirectUrl = req.query.redirectUrl as string

			if (redirectUrl) redirectUrl = decodeURIComponent(redirectUrl).trim()

			let websiteSignup =
				isNaN(appId) && apiKey == null && redirectUrl == null

			if (websiteSignup && userResponse.user != null) {
				res.redirect("/")
				return
			} else if (!websiteSignup) {
				if (
					isNaN(appId) ||
					appId <= 0 ||
					apiKey == null ||
					apiKey.length < 2 ||
					redirectUrl == null ||
					redirectUrl.length < 2
				) {
					res.redirect("/?message=error")
					return
				}
			}

			res.render("signup-page/signup-page", {
				lang: locale.lang,
				locale: locale.signupPage,
				navbarLocale: locale.navbarComponent,
				sessionExpiredDialogLocale: locale.misc.expiredSessionDialog,
				user: userResponse.user,
				csrfToken,
				websiteSignup
			})
		})

		router.get("/logout", (req, res) => {
			// Remove the accessToken cookie and redirect to the start page
			res.clearCookie("accessToken").redirect("/")
		})

		router.get("/forgot-password", async (req, res) => {
			let locale = getLocale(req.acceptsLanguages(supportedLocales))
			let userResponse = await this.getUser(
				this.getRequestCookies(req)["accessToken"]
			)
			let csrfToken = this.addCsrfToken(CsrfTokenContext.ForgotPasswordPage)

			if (userResponse.accessToken) {
				this.setAccessTokenCookie(res, userResponse.accessToken)
			}

			res.render("forgot-password-page/forgot-password-page", {
				lang: locale.lang,
				locale: locale.forgotPasswordPage,
				navbarLocale: locale.navbarComponent,
				sessionExpiredDialogLocale: locale.misc.expiredSessionDialog,
				user: userResponse.user,
				csrfToken
			})
		})

		router.get("/reset-password", async (req, res) => {
			let locale = getLocale(req.acceptsLanguages(supportedLocales))
			let userResponse = await this.getUser(
				this.getRequestCookies(req)["accessToken"]
			)
			let csrfToken = this.addCsrfToken(CsrfTokenContext.PasswordResetPage)

			if (userResponse.accessToken) {
				this.setAccessTokenCookie(res, userResponse.accessToken)
			}

			let userId = Number(req.query.userId)
			let passwordConfirmationToken = req.query
				.passwordConfirmationToken as string

			if (
				isNaN(userId) ||
				userId <= 0 ||
				passwordConfirmationToken == null ||
				passwordConfirmationToken.length < 3
			) {
				res.redirect("/?message=error")
				return
			}

			res.render("password-reset-page/password-reset-page", {
				lang: locale.lang,
				locale: locale.passwordResetPage,
				navbarLocale: locale.navbarComponent,
				sessionExpiredDialogLocale: locale.misc.expiredSessionDialog,
				user: userResponse.user,
				csrfToken
			})
		})

		router.get("/email-link", async (req, res) => {
			let type = req.query.type

			if (type == null) {
				res.redirect("/?message=error")
				return
			}

			let userId = Number(req.query.userId)
			let passwordConfirmationToken = req.query
				.passwordConfirmationToken as string
			let emailConfirmationToken = req.query.emailConfirmationToken as string

			switch (type) {
				case "confirmUser":
					// Check if user id and email confirmation token are present
					if (
						!isNaN(userId) &&
						userId > 0 &&
						emailConfirmationToken != null &&
						emailConfirmationToken.length >= 2
					) {
						let response = await UsersController.confirmUser(`id`, {
							auth: this.auth,
							id: userId,
							emailConfirmationToken
						})

						if (!Array.isArray(response)) {
							res.redirect("/?message=confirmUser")
							return
						}
					}
					break
				case "changeEmail":
					// Check if user id and email confirmation token are present
					if (
						!isNaN(userId) &&
						userId > 0 &&
						emailConfirmationToken != null &&
						emailConfirmationToken.length >= 2
					) {
						let response = await UsersController.saveNewEmailOfUser(
							`id`,
							{
								auth: this.auth,
								id: userId,
								emailConfirmationToken
							}
						)

						if (!Array.isArray(response)) {
							res.redirect("/?message=changeEmail")
							return
						}
					}
					break
				case "changePassword":
					// Check if user id and password confirmation token are present
					if (
						!isNaN(userId) &&
						userId > 0 &&
						passwordConfirmationToken != null &&
						passwordConfirmationToken.length >= 2
					) {
						let response = await UsersController.saveNewPasswordOfUser(
							`id`,
							{
								auth: this.auth,
								id: userId,
								passwordConfirmationToken
							}
						)

						if (!Array.isArray(response)) {
							res.redirect("/?message=changePassword")
							return
						}
					}
					break
				case "resetEmail":
					// Check if user id and email confirmation token are present
					if (
						!isNaN(userId) &&
						userId > 0 &&
						emailConfirmationToken != null &&
						emailConfirmationToken.length >= 2
					) {
						let response = await UsersController.resetEmailOfUser(`id`, {
							auth: this.auth,
							id: userId,
							emailConfirmationToken
						})

						if (!Array.isArray(response)) {
							res.redirect("/?message=resetEmail")
							return
						}
					}
					break
			}

			res.redirect("/?message=error")
		})

		router.get("/apps", async (req, res) => {
			// Get the apps
			let response = await AppsController.listApps(
				`
					items {
						id
						name
						description
						webLink
						googlePlayLink
						microsoftStoreLink
						published
					}
				`,
				{
					published: true
				}
			)

			let locale = getLocale(req.acceptsLanguages(supportedLocales))
			let userResponse = await this.getUser(
				this.getRequestCookies(req)["accessToken"]
			)

			if (userResponse.accessToken) {
				this.setAccessTokenCookie(res, userResponse.accessToken)
			}

			res.render("apps-page/apps-page", {
				lang: locale.lang,
				locale: locale.appsPage,
				navbarLocale: locale.navbarComponent,
				user: userResponse.user,
				apps:
					response.length > 0 && typeof response[0] == "string"
						? []
						: response
			})
		})

		router.get("/contact", async (req, res) => {
			let locale = getLocale(req.acceptsLanguages(supportedLocales))
			let userResponse = await this.getUser(
				this.getRequestCookies(req)["accessToken"]
			)

			if (userResponse.accessToken) {
				this.setAccessTokenCookie(res, userResponse.accessToken)
			}

			res.render("contact-page/contact-page", {
				lang: locale.lang,
				locale: locale.contactPage,
				navbarLocale: locale.navbarComponent,
				footerLocale: locale.footerComponent,
				user: userResponse.user
			})
		})

		router.get("/privacy", async (req, res) => {
			let locale = getLocale(req.acceptsLanguages(supportedLocales))
			let userResponse = await this.getUser(
				this.getRequestCookies(req)["accessToken"]
			)

			if (userResponse.accessToken) {
				this.setAccessTokenCookie(res, userResponse.accessToken)
			}

			res.render("privacy-page/privacy-page", {
				lang: locale.lang,
				locale: locale.privacyPage,
				navbarLocale: locale.navbarComponent,
				footerLocale: locale.footerComponent,
				user: userResponse.user
			})
		})

		router.get("/pocketlib/terms", async (req, res) => {
			let locale = getLocale(req.acceptsLanguages(supportedLocales))
			let userResponse = await this.getUser(
				this.getRequestCookies(req)["accessToken"]
			)

			if (userResponse.accessToken) {
				this.setAccessTokenCookie(res, userResponse.accessToken)
			}

			res.render("pocketlib-terms-page/pocketlib-terms-page", {
				lang: locale.lang,
				locale: locale.pocketlibTermsPage,
				navbarLocale: locale.navbarComponent,
				footerLocale: locale.footerComponent,
				user: userResponse.user
			})
		})

		router.get("/pricing", async (req, res) => {
			let locale = getLocale(req.acceptsLanguages(supportedLocales))
			let userResponse = await this.getUser(
				this.getRequestCookies(req)["accessToken"]
			)

			if (userResponse.accessToken) {
				this.setAccessTokenCookie(res, userResponse.accessToken)
			}

			res.render("pricing-page/pricing-page", {
				lang: locale.lang,
				locale: locale.pricingPage,
				navbarLocale: locale.navbarComponent,
				footerLocale: locale.footerComponent,
				pricingLocale: locale.misc.pricing,
				user: userResponse.user,
				isMobile: req.headers["sec-ch-ua-mobile"] == "?1"
			})
		})

		router.get("/user", async (req, res) => {
			let locale = getLocale(req.acceptsLanguages(supportedLocales))
			let userResponse = await this.getUser(
				this.getRequestCookies(req)["accessToken"]
			)
			let csrfToken = this.addCsrfToken(CsrfTokenContext.UserPage)

			if (userResponse.accessToken) {
				this.setAccessTokenCookie(res, userResponse.accessToken)
			}

			let card = null
			let periodEndDate = null
			let showUpgradeSuccessMessage = false

			if (userResponse.user == null) {
				res.redirect("/login?redirect=user")
				return
			}

			let user = userResponse.user

			if (user.PeriodEnd != null) {
				periodEndDate = DateTime.fromJSDate(user.PeriodEnd)
					.setLocale(locale.lang)
					.toFormat("DDD")
			}

			if (req.query.plan == "1") {
				user.Plan = 1
				showUpgradeSuccessMessage = true
			} else if (req.query.plan == "2") {
				user.Plan = 2
				showUpgradeSuccessMessage = true
			}

			if (user.StripeCustomerId) {
				// Get the stripe customer and payment method
				let stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
					apiVersion: null
				})
				let paymentMethods = await stripe.customers.listPaymentMethods(
					user.StripeCustomerId,
					{ limit: 1, type: "card" }
				)

				if (paymentMethods.data.length > 0) {
					card = paymentMethods.data[0].card
				}
			}

			res.render("user-page/user-page", {
				lang: locale.lang,
				locale: locale.userPage,
				navbarLocale: locale.navbarComponent,
				pricingLocale: locale.misc.pricing,
				sessionExpiredDialogLocale: locale.misc.expiredSessionDialog,
				user,
				csrfToken,
				isMobile: req.headers["sec-ch-ua-mobile"] == "?1",
				card,
				periodEndDate,
				showUpgradeSuccessMessage
			})
		})

		router.get("/dev", async (req, res) => {
			let locale = getLocale(req.acceptsLanguages(supportedLocales))
			let accessToken = this.getRequestCookies(req)["accessToken"]
			let userResponse = await this.getUser(accessToken)
			let devResponse = await this.getDev(userResponse.accessToken)

			if (devResponse.accessToken) {
				this.setAccessTokenCookie(res, devResponse.accessToken)
			}

			if (userResponse.user == null) {
				res.redirect("/login?redirect=dev")
				return
			} else if (devResponse.dev == null) {
				res.redirect("/")
				return
			}

			res.render("dev-page/dev-page", {
				lang: locale.lang,
				locale: locale.devPage,
				navbarLocale: locale.navbarComponent,
				user: userResponse.user,
				dev: devResponse.dev
			})
		})

		router.get("/dev/statistics", async (req, res) => {
			let locale = getLocale(req.acceptsLanguages(supportedLocales))
			let accessToken = this.getRequestCookies(req)["accessToken"]
			let userResponse = await this.getUser(accessToken)
			let devResponse = await this.getDev(userResponse.accessToken)
			let csrfToken = this.addCsrfToken(CsrfTokenContext.DevPages)

			if (devResponse.accessToken) {
				this.setAccessTokenCookie(res, devResponse.accessToken)
			}

			if (userResponse.user == null) {
				res.redirect(
					`/login?redirect=${encodeURIComponent("dev/statistics")}`
				)
				return
			} else if (devResponse.dev == null) {
				res.redirect("/")
				return
			}

			res.render("statistics-page/statistics-page", {
				lang: locale.lang,
				locale: locale.statisticsPage,
				navbarLocale: locale.navbarComponent,
				csrfToken,
				user: userResponse.user
			})
		})

		router.get("/dev/:appId", async (req, res) => {
			let locale = getLocale(req.acceptsLanguages(supportedLocales))
			let accessToken = this.getRequestCookies(req)["accessToken"]
			let userResponse = await this.getUser(accessToken)
			let devResponse = await this.getDev(userResponse.accessToken)
			let csrfToken = this.addCsrfToken(CsrfTokenContext.DevPages)

			if (devResponse.accessToken) {
				this.setAccessTokenCookie(res, devResponse.accessToken)
			}

			if (userResponse.user == null) {
				res.redirect(
					`/login?redirect=${encodeURIComponent(
						`dev/${req.params.appId}`
					)}`
				)
				return
			} else if (devResponse.dev == null) {
				res.redirect("/")
				return
			}

			res.render("app-page/app-page", {
				lang: locale.lang,
				locale: locale.appPage,
				navbarLocale: locale.navbarComponent,
				csrfToken,
				user: userResponse.user
			})
		})

		router.get("/dev/:appId/statistics", async (req, res) => {
			let locale = getLocale(req.acceptsLanguages(supportedLocales))
			let accessToken = this.getRequestCookies(req)["accessToken"]
			let userResponse = await this.getUser(accessToken)
			let devResponse = await this.getDev(userResponse.accessToken)
			let csrfToken = this.addCsrfToken(CsrfTokenContext.DevPages)

			if (devResponse.accessToken) {
				this.setAccessTokenCookie(res, devResponse.accessToken)
			}

			if (userResponse.user == null) {
				res.redirect(
					`/login?redirect=${encodeURIComponent(
						`dev/${req.params.appId}/statistics`
					)}`
				)
				return
			} else if (devResponse.dev == null) {
				res.redirect("/")
				return
			}

			res.render("app-statistics-page/app-statistics-page", {
				lang: locale.lang,
				locale: locale.statisticsPage,
				navbarLocale: locale.navbarComponent,
				csrfToken,
				user: userResponse.user
			})
		})
		//#endregion

		//#region API endpoints
		router.get("/api/user_snapshots", async (req, res) => {
			if (
				!this.checkReferer(req, res) ||
				!this.checkCsrfToken(
					req.headers["x-csrf-token"] as string,
					CsrfTokenContext.DevPages
				)
			) {
				res.status(403).end()
				return
			}

			let accessToken = this.getRequestCookies(req)["accessToken"]
			let result = await this.getUserSnapshots(
				accessToken,
				req.query.months ? Number(req.query.months) : 1
			)

			if (result.accessToken) {
				this.setAccessTokenCookie(res, result.accessToken)
			}

			if (
				result.response.length > 0 &&
				typeof result.response[0] == "string"
			) {
				res.status(500).send({ errors: result.response })
			} else {
				res.send(result.response)
			}
		})

		router.get("/api/app/:id", async (req, res) => {
			if (
				!this.checkReferer(req, res) ||
				!this.checkCsrfToken(
					req.headers["x-csrf-token"] as string,
					CsrfTokenContext.DevPages
				)
			) {
				res.status(403).end()
				return
			}

			let accessToken = this.getRequestCookies(req)["accessToken"]
			let result = await this.getApp(accessToken, req)

			if (result.accessToken) {
				this.setAccessTokenCookie(res, result.accessToken)
			}

			if (Array.isArray(result.response)) {
				res.status(500).send({ errors: result.response })
			} else {
				res.send(result.response)
			}
		})

		router.get("/api/app/:id/user_snapshots", async (req, res) => {
			if (
				!this.checkReferer(req, res) ||
				!this.checkCsrfToken(
					req.headers["x-csrf-token"] as string,
					CsrfTokenContext.DevPages
				)
			) {
				res.status(403).end()
				return
			}

			let accessToken = this.getRequestCookies(req)["accessToken"]
			let result = await this.getAppUserSnapshots(
				accessToken,
				Number(req.params.id),
				req.query.months ? Number(req.query.months) : 1
			)

			if (result.accessToken) {
				this.setAccessTokenCookie(res, result.accessToken)
			}

			if (result.response.length > 0 && typeof result.response[0] == "string") {
				res.status(500).send({ errors: result.response })
			} else {
				res.send(result.response)
			}
		})

		router.post("/api/login", async (req, res) => {
			if (
				!this.checkReferer(req, res) ||
				!this.checkCsrfToken(
					req.headers["x-csrf-token"] as string,
					CsrfTokenContext.LoginPage
				)
			) {
				res.status(403).end()
				return
			}

			// Do the API request
			let response = await SessionsController.createSession(
				`
					accessToken
					websiteAccessToken
				`,
				{
					auth: this.auth,
					email: req.body.email,
					password: req.body.password,
					appId: Number(req.body.appId),
					apiKey: req.body.apiKey,
					deviceName: req.body.deviceName,
					deviceOs: req.body.deviceOs
				}
			)

			if (Array.isArray(response)) {
				res.status(500).send({ errors: response })
			} else {
				if (response.websiteAccessToken) {
					this.setAccessTokenCookie(res, response.websiteAccessToken)
				} else {
					this.setAccessTokenCookie(res, response.accessToken)
				}

				res.send(response)
			}
		})

		router.post("/api/create_session_from_access_token", async (req, res) => {
			if (
				!this.checkReferer(req, res) ||
				!this.checkCsrfToken(
					req.headers["x-csrf-token"] as string,
					CsrfTokenContext.LoginPage
				)
			) {
				res.status(403).end()
				return
			}

			// Do the API request
			let response = await SessionsController.createSessionFromAccessToken(
				`
					accessToken
					websiteAccessToken
				`,
				{
					auth: this.auth,
					accessToken: this.getRequestCookies(req)["accessToken"],
					appId: Number(req.body.appId),
					apiKey: req.body.apiKey,
					deviceName: req.body.deviceName,
					deviceOs: req.body.deviceOs
				}
			)

			if (Array.isArray(response)) {
				res.status(500).send({ errors: response })
			} else {
				res.send(response)
			}
		})

		router.post("/api/signup", async (req, res) => {
			if (
				!this.checkReferer(req, res) ||
				!this.checkCsrfToken(
					req.headers["x-csrf-token"] as string,
					CsrfTokenContext.SignupPage
				)
			) {
				res.status(403).end()
				return
			}

			// Do the API request
			let response = await UsersController.createUser(
				`
					accessToken
					websiteAccessToken
				`,
				{
					auth: this.auth,
					email: req.body.email,
					firstName: req.body.firstName,
					password: req.body.password,
					appId: Number(req.body.appId),
					apiKey: req.body.apiKey,
					deviceName: req.body.deviceName,
					deviceOs: req.body.deviceOs
				}
			)

			if (Array.isArray(response)) {
				res.status(500).send({ errors: response })
			} else {
				if (response.websiteAccessToken) {
					this.setAccessTokenCookie(res, response.websiteAccessToken)
				} else {
					this.setAccessTokenCookie(res, response.accessToken)
				}

				res.send(response)
			}
		})

		router.post("/api/send_confirmation_email", async (req, res) => {
			if (
				!this.checkReferer(req, res) ||
				!this.checkCsrfToken(
					req.headers["x-csrf-token"] as string,
					CsrfTokenContext.UserPage
				)
			) {
				res.status(403).end()
				return
			}

			// Get the current user
			let userResponse = await this.getUser(
				this.getRequestCookies(req)["accessToken"]
			)
			if (userResponse.accessToken)
				this.setAccessTokenCookie(res, userResponse.accessToken)

			if (userResponse.user == null) {
				res.status(404).end()
				return
			}

			let response = await UsersController.sendConfirmationEmailForUser(
				`id`,
				{
					auth: this.auth,
					id: userResponse.user.Id
				}
			)

			if (Array.isArray(response)) {
				res.status(500).send({ errors: response })
			} else {
				res.send(response)
			}
		})

		router.post("/api/send_password_reset_email", async (req, res) => {
			if (
				!this.checkReferer(req, res) ||
				!this.checkCsrfToken(
					req.headers["x-csrf-token"] as string,
					CsrfTokenContext.ForgotPasswordPage
				)
			) {
				res.status(403).end()
				return
			}

			let response = await UsersController.sendPasswordResetEmailForUser(
				`id`,
				{
					auth: this.auth,
					email: req.body.email
				}
			)

			if (Array.isArray(response)) {
				res.status(500).send({ errors: response })
			} else {
				res.send(response)
			}
		})

		router.post("/api/set_password", async (req, res) => {
			if (
				!this.checkReferer(req, res) ||
				!this.checkCsrfToken(
					req.headers["x-csrf-token"] as string,
					CsrfTokenContext.PasswordResetPage
				)
			) {
				res.status(403).end()
				return
			}

			let response = await UsersController.setPasswordOfUser(`id`, {
				auth: this.auth,
				id: req.body.id,
				password: req.body.password,
				passwordConfirmationToken: req.body.passwordConfirmationToken
			})

			if (Array.isArray(response)) {
				res.status(500).send({ errors: response })
			} else {
				res.send(response)
			}
		})

		router.put("/api/user", async (req, res) => {
			if (
				!this.checkReferer(req, res) ||
				!this.checkCsrfToken(
					req.headers["x-csrf-token"] as string,
					CsrfTokenContext.UserPage
				)
			) {
				res.status(403).end()
				return
			}

			let accessToken = this.getRequestCookies(req)["accessToken"]
			let result = await this.updateUser(accessToken, req)

			if (result.accessToken) {
				this.setAccessTokenCookie(res, result.accessToken)
			}

			if (Array.isArray(result.response)) {
				res.status(500).send({ errors: result.response })
			} else {
				res.send(result.response)
			}
		})

		router.put("/api/user/profile_image", async (req, res) => {
			if (
				!this.checkReferer(req, res) ||
				!this.checkCsrfToken(
					req.headers["x-csrf-token"] as string,
					CsrfTokenContext.UserPage
				)
			) {
				res.status(403).end()
				return
			}

			let accessToken = this.getRequestCookies(req)["accessToken"]
			let result = await this.setProfileImageOfUser(accessToken, req)

			if (result.accessToken) {
				this.setAccessTokenCookie(res, result.accessToken)
			}

			if (result.response == null || result.response.status == -1) {
				res.status(500).end()
			} else if (isSuccessStatusCode(result.response.status)) {
				let response = result.response as ApiResponse<{}>
				res.status(response.status).send(response.data)
			} else {
				let response = result.response as ApiErrorResponse2
				res.status(response.status).send({ error: response.error })
			}
		})

		router.post("/api/checkout_session", async (req, res) => {
			if (
				!this.checkReferer(req, res) ||
				!this.checkCsrfToken(
					req.headers["x-csrf-token"] as string,
					CsrfTokenContext.UserPage
				)
			) {
				res.status(403).end()
				return
			}

			let accessToken = this.getRequestCookies(req)["accessToken"]
			let result = await this.createCheckoutSession(accessToken, req)

			if (result.accessToken) {
				this.setAccessTokenCookie(res, result.accessToken)
			}

			if (result.response == null || result.response.status == -1) {
				res.status(500).end()
			} else if (isSuccessStatusCode(result.response.status)) {
				let response =
					result.response as ApiResponse<CreateCheckoutSessionResponseData>
				res.status(response.status).send(response.data)
			} else {
				let response = result.response as ApiErrorResponse
				res.status(response.status).send({ errors: response.errors })
			}
		})

		router.post("/api/customer_portal_session", async (req, res) => {
			if (
				!this.checkReferer(req, res) ||
				!this.checkCsrfToken(
					req.headers["x-csrf-token"] as string,
					CsrfTokenContext.UserPage
				)
			) {
				res.status(403).end()
				return
			}

			let accessToken = this.getRequestCookies(req)["accessToken"]
			let result = await this.createCustomerPortalSession(accessToken)

			if (result.accessToken) {
				this.setAccessTokenCookie(res, result.accessToken)
			}

			if (result.response == null || result.response.status == -1) {
				res.status(500).end()
			} else if (isSuccessStatusCode(result.response.status)) {
				let response =
					result.response as ApiResponse<CreateCustomerPortalSessionResponseData>
				res.status(response.status).send(response.data)
			} else {
				let response = result.response as ApiErrorResponse
				res.status(response.status).send({ errors: response.errors })
			}
		})

		router.put("/api/subscription", async (req, res) => {
			if (
				!this.checkReferer(req, res) ||
				!this.checkCsrfToken(
					req.headers["x-csrf-token"] as string,
					CsrfTokenContext.UserPage
				)
			) {
				res.status(403).end()
				return
			}

			let plan = req.body.plan

			if (plan != 0 && plan != 1 && plan != 2) {
				res.status(400).end()
				return
			}

			let accessToken = this.getRequestCookies(req)["accessToken"]
			let userResponse = await this.getUser(accessToken)
			let user = userResponse.user

			if (userResponse.accessToken) {
				this.setAccessTokenCookie(res, userResponse.accessToken)
			}

			if (user == null) {
				res.status(412).end()
				return
			}

			let stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
				apiVersion: null
			})
			let subscriptions = await stripe.subscriptions.list({
				customer: user.StripeCustomerId
			})

			if (subscriptions.data.length == 0) {
				if (plan == 0) {
					res.status(200).send({
						plan
					})
					return
				} else {
					// Create a new subscription
					await stripe.subscriptions.create({
						customer: user.StripeCustomerId,
						items: [
							{
								plan:
									plan == 1
										? process.env.STRIPE_DAV_PLUS_EUR_PLAN_ID
										: process.env.STRIPE_DAV_PRO_EUR_PLAN_ID
							}
						]
					})
				}
			} else {
				let subscription = subscriptions.data[0]

				if (plan == 0) {
					// Cancel the subscription
					await stripe.subscriptions.update(subscription.id, {
						cancel_at_period_end: true
					})
				} else {
					// Update the existing subscription
					await stripe.subscriptions.update(subscription.id, {
						items: [
							{
								id: subscription.items.data[0].id,
								plan:
									plan == 1
										? process.env.STRIPE_DAV_PLUS_EUR_PLAN_ID
										: process.env.STRIPE_DAV_PRO_EUR_PLAN_ID
							}
						],
						cancel_at_period_end: false
					})
				}
			}

			res.status(200).send({
				plan
			})
		})

		router.put("/api/subscription/cancel", async (req, res) => {
			if (
				!this.checkReferer(req, res) ||
				!this.checkCsrfToken(
					req.headers["x-csrf-token"] as string,
					CsrfTokenContext.UserPage
				)
			) {
				res.status(403).end()
				return
			}

			let accessToken = this.getRequestCookies(req)["accessToken"]
			let userResponse = await this.getUser(accessToken)
			let user = userResponse.user

			if (userResponse.accessToken) {
				this.setAccessTokenCookie(res, userResponse.accessToken)
			}

			if (user == null) {
				res.status(412).end()
				return
			}

			let stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
				apiVersion: null
			})
			let subscriptions = await stripe.subscriptions.list({
				customer: user.StripeCustomerId
			})

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

		router.put("/api/app/:id", async (req, res) => {
			if (
				!this.checkReferer(req, res) ||
				!this.checkCsrfToken(
					req.headers["x-csrf-token"] as string,
					CsrfTokenContext.DevPages
				)
			) {
				res.status(403).end()
				return
			}

			let accessToken = this.getRequestCookies(req)["accessToken"]
			let result = await this.updateApp(accessToken, req)

			if (result.accessToken) {
				this.setAccessTokenCookie(res, result.accessToken)
			}

			if (result.response == null || result.response.status == -1) {
				res.status(500).end()
			} else if (isSuccessStatusCode(result.response.status)) {
				let response = result.response as ApiResponse<DavApp>
				res.status(response.status).send(response.data)
			} else {
				let response = result.response as ApiErrorResponse
				res.status(response.status).send({ errors: response.errors })
			}
		})
		//#endregion

		this.express.use("/", router)
	}

	private checkReferer(req: any, res: any) {
		// Get the base urls from the environment variables
		const baseUrl = process.env.BASE_URL
		var baseUrls = []

		if (baseUrl != null) {
			baseUrls = baseUrl.split(",")
		}

		// Check if the request has the referer header
		let refererHeader = req.headers.referer

		// Check if the base urls contain the referer
		if (
			!refererHeader ||
			baseUrls.findIndex(baseUrl => refererHeader.startsWith(baseUrl)) == -1
		) {
			res.sendStatus(403)
			return false
		}

		return true
	}

	private init() {
		if (this.initialized) return
		this.initialized = true

		let environment = Environment.Development

		switch (process.env.ENV) {
			case "production":
				environment = Environment.Production
				break
			case "staging":
				environment = Environment.Staging
				break
		}

		new Dav({
			environment,
			server: true
		})

		this.auth = new Auth({
			apiKey: process.env.DAV_API_KEY,
			secretKey: process.env.DAV_SECRET_KEY,
			uuid: process.env.DAV_UUID
		})
	}

	private getRequestCookies(req: express.Request) {
		if (req.headers.cookie == null) return {}
		const rawCookies = req.headers.cookie.split("; ")
		const parsedCookies = {}

		rawCookies.forEach(rawCookie => {
			const parsedCookie = rawCookie.split("=")
			parsedCookies[parsedCookie[0]] = parsedCookie[1]
		})

		return parsedCookies
	}

	private async getUser(
		accessToken: string
	): Promise<{ accessToken: string; user: User }> {
		if (accessToken == null) {
			return {
				accessToken: null,
				user: null
			}
		}

		let retrieveUserResponse = await UsersController.retrieveUser(
			`
				id
				email
				firstName
				confirmed
				totalStorage
				usedStorage
				dev {
					id
				}
				provider {
					id
				}
				profileImage {
					url
					etag
				}
				apps {
					total
					items {
						id
						name
						description
						published
						webLink
						googlePlayLink
						microsoftStoreLink
					}
				}
			`,
			{
				accessToken
			}
		)

		if (Array.isArray(retrieveUserResponse)) {
			accessToken = await this.handleGraphQLApiError(
				accessToken,
				retrieveUserResponse
			)
			return await this.getUser(accessToken)
		}

		return {
			accessToken,
			user: retrieveUserResponse
		}
	}

	private async getDev(
		accessToken: string
	): Promise<{ accessToken: string; dev: Dev }> {
		if (accessToken == null) {
			return {
				accessToken: null,
				dev: null
			}
		}

		let getDevResponse = await DevsController.retrieveDev(
			`
				id
				apps {
					items {
						id
						name
						description
						webLink
						googlePlayLink
						microsoftStoreLink
						published
					}
				}
			`,
			{ accessToken }
		)

		if (Array.isArray(getDevResponse)) {
			accessToken = await this.handleGraphQLApiError(
				accessToken,
				getDevResponse
			)

			return await this.getDev(accessToken)
		}

		return {
			accessToken,
			dev: getDevResponse
		}
	}

	private async getUserSnapshots(
		accessToken: string,
		months: number
	): Promise<{
		accessToken: string
		response: UserSnapshotResource[] | ErrorCode[]
	}> {
		if (accessToken == null) {
			return {
				accessToken: null,
				response: null
			}
		}

		let response = await UserSnapshotsController.listUserSnapshots(
			`
				items {
					time
					dailyActive
					weeklyActive
					monthlyActive
					yearlyActive
					freePlan
					plusPlan
					proPlan
					emailConfirmed
					emailUnconfirmed
				}
			`,
			{
				accessToken,
				start: DateTime.now().startOf("day").minus({ months }).toSeconds()
			}
		)

		if (response.length > 0 && typeof response[0] == "number") {
			const errorCodes = response as ErrorCode[]

			let newAccessToken = await this.handleGraphQLApiError(
				accessToken,
				errorCodes
			)

			if (newAccessToken == null) {
				return {
					accessToken,
					response: errorCodes
				}
			} else {
				return await this.getUserSnapshots(newAccessToken, months)
			}
		}

		return {
			accessToken,
			response
		}
	}

	private async getApp(
		accessToken: string,
		req: any
	): Promise<{
		accessToken: string
		response: DavApp | ErrorCode[]
	}> {
		if (accessToken == null) {
			return {
				accessToken: null,
				response: null
			}
		}

		let response = await AppsController.retrieveApp(
			`
				id
    			name
    			description
    			webLink
    			googlePlayLink
    			microsoftStoreLink
    			published
				tables {
					items {
						id
						name
					}
				}
			`,
			{
				accessToken,
				id: Number(req.params.id)
			}
		)

		if (Array.isArray(response)) {
			const errorCodes = response as ErrorCode[]

			let newAccessToken = await this.handleGraphQLApiError(
				accessToken,
				errorCodes
			)

			if (newAccessToken == null) {
				return {
					accessToken,
					response: errorCodes
				}
			} else {
				return await this.getApp(newAccessToken, req)
			}
		}

		return {
			accessToken,
			response
		}
	}

	private async getAppUserSnapshots(
		accessToken: string,
		appId: number,
		months: number
	): Promise<{
		accessToken: string
		response: AppUserSnapshotResource[] | ErrorCode[]
	}> {
		if (accessToken == null) {
			return {
				accessToken: null,
				response: null
			}
		}

		let response = await AppUserSnapshotsController.listAppUserSnapshots(
			`
				items {
					time
					dailyActive
					weeklyActive
					monthlyActive
					yearlyActive
					freePlan
					plusPlan
					proPlan
					emailConfirmed
					emailUnconfirmed
				}
			`,
			{
				accessToken,
				appId: appId,
				start: DateTime.now().startOf("day").minus({ months }).toSeconds()
			}
		)

		if (response.length > 0 && typeof response[0] == "number") {
			const errorCodes = response as ErrorCode[]

			let newAccessToken = await this.handleGraphQLApiError(
				accessToken,
				errorCodes
			)

			if (newAccessToken == null) {
				return {
					accessToken,
					response: errorCodes
				}
			} else {
				return await this.getAppUserSnapshots(newAccessToken, appId, months)
			}
		}

		return {
			accessToken,
			response
		}
	}

	private async updateUser(
		accessToken: string,
		req: any
	): Promise<{
		accessToken: string
		response: User | ErrorCode[]
	}> {
		if (accessToken == null) {
			return {
				accessToken: null,
				response: null
			}
		}

		let response = await UsersController.updateUser(
			`
				id
				email
				firstName
				confirmed
				totalStorage
				usedStorage
				dev {
					id
				}
				provider {
					id
				}
				profileImage {
					url
					etag
				}
				apps {
					total
					items {
						id
						name
						description
						published
						webLink
						googlePlayLink
						microsoftStoreLink
					}
				}
			`,
			{
				accessToken,
				firstName: req.body.firstName,
				email: req.body.email,
				password: req.body.password
			}
		)

		if (Array.isArray(response)) {
			let newAccessToken = await this.handleGraphQLApiError(
				accessToken,
				response
			)

			if (newAccessToken == null) {
				return {
					accessToken,
					response
				}
			} else {
				return await this.updateUser(newAccessToken, req)
			}
		}

		return {
			accessToken,
			response
		}
	}

	private async setProfileImageOfUser(
		accessToken: string,
		req: any
	): Promise<{
		accessToken: string
		response: ApiResponse<{}> | ApiErrorResponse2
	}> {
		if (accessToken == null) {
			return {
				accessToken: null,
				response: null
			}
		}

		let response = await UsersController.uploadUserProfileImage({
			accessToken,
			contentType: req.headers["content-type"],
			data: req.body
		})

		if (!isSuccessStatusCode(response.status)) {
			let newAccessToken = await this.handleApiError2(
				accessToken,
				response as ApiErrorResponse2
			)

			if (newAccessToken == null) {
				return {
					accessToken,
					response
				}
			} else {
				return await this.setProfileImageOfUser(newAccessToken, req)
			}
		}

		return {
			accessToken,
			response: response as ApiResponse<User>
		}
	}

	private async createCheckoutSession(
		accessToken: string,
		req: any
	): Promise<{
		accessToken: string
		response:
			| ApiResponse<CreateCheckoutSessionResponseData>
			| ApiErrorResponse
	}> {
		if (accessToken == null) {
			return {
				accessToken: null,
				response: null
			}
		}

		let response = await CheckoutSessionsController.CreateCheckoutSession({
			accessToken,
			mode: req.body.mode,
			plan: req.body.plan,
			successUrl: req.body.successUrl,
			cancelUrl: req.body.cancelUrl
		})

		if (!isSuccessStatusCode(response.status)) {
			let newAccessToken = await this.handleApiError(
				accessToken,
				response as ApiErrorResponse
			)

			if (newAccessToken == null) {
				return {
					accessToken,
					response
				}
			} else {
				return await this.createCheckoutSession(newAccessToken, req)
			}
		}

		return {
			accessToken,
			response: response as ApiResponse<CreateCheckoutSessionResponseData>
		}
	}

	private async createCustomerPortalSession(accessToken: string): Promise<{
		accessToken: string
		response:
			| ApiResponse<CreateCustomerPortalSessionResponseData>
			| ApiErrorResponse
	}> {
		if (accessToken == null) {
			return {
				accessToken: null,
				response: null
			}
		}

		let response =
			await CustomerPortalSessionsController.CreateCustomerPortalSession({
				accessToken
			})

		if (!isSuccessStatusCode(response.status)) {
			let newAccessToken = await this.handleApiError(
				accessToken,
				response as ApiErrorResponse
			)

			if (newAccessToken == null) {
				return {
					accessToken,
					response
				}
			} else {
				return await this.createCustomerPortalSession(newAccessToken)
			}
		}

		return {
			accessToken,
			response:
				response as ApiResponse<CreateCustomerPortalSessionResponseData>
		}
	}

	private async updateApp(
		accessToken: string,
		req: any
	): Promise<{
		accessToken: string
		response: ApiResponse<DavApp> | ApiErrorResponse
	}> {
		if (accessToken == null) {
			return {
				accessToken: null,
				response: null
			}
		}

		let response = await AppsController.UpdateApp({
			accessToken,
			id: Number(req.params.id),
			name: req.body.name,
			description: req.body.description,
			webLink: req.body.webLink,
			googlePlayLink: req.body.googlePlayLink,
			microsoftStoreLink: req.body.microsoftStoreLink,
			published: req.body.published
		})

		if (!isSuccessStatusCode(response.status)) {
			let newAccessToken = await this.handleApiError(
				accessToken,
				response as ApiErrorResponse
			)

			if (newAccessToken == null) {
				return {
					accessToken,
					response
				}
			} else {
				return await this.updateApp(newAccessToken, req)
			}
		}

		return {
			accessToken,
			response: response as ApiResponse<DavApp>
		}
	}

	private async handleApiError(
		accessToken: string,
		errorResponse: ApiErrorResponse
	): Promise<string> {
		if (
			errorResponse.errors.length == 0 ||
			errorResponse.errors[0].code != ErrorCodes.AccessTokenMustBeRenewed
		) {
			return null
		}

		let renewSessionResult = await SessionsController.renewSession(
			`accessToken`,
			{ accessToken }
		)

		if (Array.isArray(renewSessionResult)) {
			return null
		}

		return renewSessionResult.accessToken
	}

	private async handleApiError2(
		accessToken: string,
		errorResponse: ApiErrorResponse2
	): Promise<string> {
		if (
			errorResponse.error != null ||
			errorResponse.error.code != "SESSION_ENDED"
		) {
			return null
		}

		let renewSessionResult = await SessionsController.renewSession(
			`accessToken`,
			{ accessToken }
		)

		if (Array.isArray(renewSessionResult)) {
			return null
		}

		return renewSessionResult.accessToken
	}

	private async handleGraphQLApiError(
		accessToken: string,
		errorCodes: ErrorCode[]
	) {
		if (!errorCodes.includes("SESSION_ENDED")) {
			return null
		}

		let renewSessionResponse = await SessionsController.renewSession(
			`accessToken`,
			{ accessToken }
		)

		if (Array.isArray(renewSessionResponse)) {
			return null
		} else {
			return renewSessionResponse.accessToken
		}
	}

	private setAccessTokenCookie(res: any, accessToken: string) {
		res.cookie(accessTokenCookieName, accessToken, {
			httpOnly: true,
			secure: true,
			maxAge: 1000 * 60 * 60 * 24 * 365
		})
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
