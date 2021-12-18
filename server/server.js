import * as path from 'path'
import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import dotenv from 'dotenv'
dotenv.config()
import Stripe from 'stripe'
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
var stripe

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

app.post('/signup', async (req, res) => {
	if (!checkReferer(req, res)) return
	init()

	let response = await UsersController.Signup({
		auth,
		email: req.body.email,
		firstName: req.body.firstName,
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

app.post('/confirm_user', async (req, res) => {
	if (!checkReferer(req, res)) return
	init()

	let response = await UsersController.ConfirmUser({
		auth,
		id: req.body.id,
		emailConfirmationToken: req.body.emailConfirmationToken
	})

	if (response.status == 204) {
		res.status(response.status).send(response.data)
	} else {
		res.status(response.status).send(response.errors)
	}
})

app.post('/save_new_password', async (req, res) => {
	if (!checkReferer(req, res)) return
	init()

	let response = await UsersController.SaveNewPassword({
		auth,
		id: req.body.id,
		passwordConfirmationToken: req.body.passwordConfirmationToken
	})

	if (response.status == 204) {
		res.status(response.status).send(response.data)
	} else {
		res.status(response.status).send(response.errors)
	}
})

app.post('/save_new_email', async (req, res) => {
	if (!checkReferer(req, res)) return
	init()

	let response = await UsersController.SaveNewEmail({
		auth,
		id: req.body.id,
		emailConfirmationToken: req.body.emailConfirmationToken
	})

	if (response.status == 204) {
		res.status(response.status).send(response.data)
	} else {
		res.status(response.status).send(response.errors)
	}
})

app.post('/reset_email', async (req, res) => {
	if (!checkReferer(req, res)) return
	init()

	let response = await UsersController.ResetEmail({
		auth,
		id: req.body.id,
		emailConfirmationToken: req.body.emailConfirmationToken
	})

	if (response.status == 204) {
		res.status(response.status).send(response.data)
	} else {
		res.status(response.status).send(response.errors)
	}
})

app.post('/send_confirmation_email', async (req, res) => {
	if (!checkReferer(req, res)) return
	init()

	let response = await UsersController.SendConfirmationEmail({
		auth,
		id: req.body.id
	})

	if (response.status == 204) {
		res.status(response.status).send(response.data)
	} else {
		res.status(response.status).send(response.errors)
	}
})

app.post('/send_password_reset_email', async (req, res) => {
	if (!checkReferer(req, res)) return
	init()

	let response = await UsersController.SendPasswordResetEmail({
		auth,
		email: req.body.email
	})

	if (response.status == 204) {
		res.status(response.status).send(response.data)
	} else {
		res.status(response.status).send(response.errors)
	}
})

app.post('/set_password', async (req, res) => {
	if (!checkReferer(req, res)) return
	init()

	let response = await UsersController.SetPassword({
		auth,
		id: req.body.id,
		password: req.body.password,
		passwordConfirmationToken: req.body.passwordConfirmationToken
	})

	if (response.status == 204) {
		res.status(response.status).send(response.data)
	} else {
		res.status(response.status).send(response.errors)
	}
})

app.post('/get_stripe_payment_method', async (req, res) => {
	if (!checkReferer(req, res)) return
	initStripe()

	try {
		let result = await stripe.paymentMethods.list({
			customer: req.body.customerId,
			type: 'card'
		})

		let paymentMethod = null
		if (result.data.length > 0) {
			paymentMethod = result.data[0]
		}

		res.status(200).send(paymentMethod)
	} catch (error) {
		res.status(400).send(error.raw)
	}
})

app.post('/set_stripe_subscription', async (req, res) => {
	if (!checkReferer(req, res)) return
	initStripe()

	try {
		// Get the current subscription of the customer
		let subscriptions = await stripe.subscriptions.list({ customer: req.body.customerId })
		let result

		if (req.body.planId) {
			if (subscriptions.data.length == 0) {
				// Create a new subscription
				result = await stripe.subscriptions.create({
					customer: req.body.customerId,
					items: [{ plan: req.body.planId }]
				})
			} else {
				let subscriptionItem = subscriptions.data[0].items.data[0]

				// Update the subscription
				result = await stripe.subscriptions.update(subscriptions.data[0].id, {
					items: [{
						id: subscriptionItem.id,
						plan: req.body.planId
					}],
					cancel_at_period_end: false
				})
			}
		} else {
			// Cancel the subscription
			result = await stripe.subscriptions.update(subscriptions.data[0].id, {
				cancel_at_period_end: true
			})
		}

		res.status(200).send(result)
	} catch (error) {
		res.status(400).send(error.raw)
	}
})

app.post('/set_stripe_subscription_cancelled', async (req, res) => {
	if (!checkReferer(req, res)) return
	initStripe()

	try {
		// Get the current subscription of the customer
		let subscriptions = await stripe.subscriptions.list({ customer: req.body.customerId })
		let subscriptionId = ""

		if (subscriptions.data.length > 0) {
			subscriptionId = subscriptions.data[0].id
		}

		let result = await stripe.subscriptions.update(subscriptionId, {
			cancel_at_period_end: req.body.cancel
		})

		res.status(200).send(result)
	} catch (error) {
		res.status(400).send(error.raw)
	}
})

app.post('/retrieve_stripe_account', async (req, res) => {
	if (!checkReferer(req, res)) return
	initStripe()

	try {
		let account = await stripe.accounts.retrieve(req.body.id)

		res.status(200).send(account)
	} catch (error) {
		res.status(400).send(error.raw)
	}
})

app.post('/retrieve_stripe_balance', async (req, res) => {
	if (!checkReferer(req, res)) return
	initStripe()

	try {
		let balance = await stripe.balance.retrieve({ stripeAccount: req.body.account })

		res.status(200).send(balance)
	} catch (error) {
		res.status(400).send(error.raw)
	}
})

app.post('/create_stripe_account_link', async (req, res) => {
	if (!checkReferer(req, res)) return
	initStripe()

	try {
		let accountLink = await stripe.accountLinks.create({
			account: req.body.account,
			return_url: req.body.returnUrl,
			refresh_url: req.body.returnUrl,
			type: req.body.type
		})

		res.status(200).send(accountLink)
	} catch (error) {
		res.status(400).send(error.raw)
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

function initStripe() {
	if (stripe == null) {
		stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: null })
	}
}

http.listen(process.env.PORT || 3000)