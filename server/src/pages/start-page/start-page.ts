import 'dav-ui-components'
import { Button } from 'dav-ui-components/src/button/button'

var loginButton = document.getElementById('login-button') as Button
loginButton.addEventListener("click", () => {
	console.log("Clicked")
})