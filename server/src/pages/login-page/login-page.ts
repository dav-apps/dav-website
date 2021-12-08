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
})

passwordTextfield.addEventListener('change', (event: Event) => {
	password = (event as CustomEvent).detail.value
})

passwordTextfield.addEventListener('enter', login)
loginButton.addEventListener('click', login)

function login() {
	console.log(`Email: ${email}`)
	console.log(`Password: ${password}`)
}