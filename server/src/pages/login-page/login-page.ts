import axios from 'axios'
import { Dav } from 'dav-js'
import 'dav-ui-components'
import { Button, Textfield, MessageBar } from 'dav-ui-components'

let errorMessageBar = document.getElementById('error-message-bar') as MessageBar
let emailTextfield = document.getElementById('email-textfield') as Textfield
let passwordTextfield = document.getElementById('password-textfield') as Textfield
let loginButton = document.getElementById('login-button') as Button

let email: string = ""
let password: string = ""

emailTextfield.addEventListener('change', (event: Event) => {
	email = (event as CustomEvent).detail.value
	hideError()
})

passwordTextfield.addEventListener('change', (event: Event) => {
	password = (event as CustomEvent).detail.value
	hideError()
})

passwordTextfield.addEventListener('enter', login)
loginButton.addEventListener('click', login)

async function login() {
	hideError()
	let response

	try {
		response = await axios({
			method: 'post',
			url: '/login',
			data: {
				email,
				password
			}
		})
	} catch (error) {
		showError(error.response.data[0].message)
		return
	}

	await Dav.Login(response.data.accessToken)
	window.location.href = "/"
}

function showError(message: string) {
	errorMessageBar.innerText = message
	errorMessageBar.style.display = "block"
}

function hideError() {
	errorMessageBar.style.display = "none"
}