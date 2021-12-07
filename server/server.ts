import { App } from './App.js'

const port = process.env.PORT || 3000
const app: App = new App()

app.express.listen(port, (err) => {
	if (err) {
		return console.log(err)
	}

	return console.log(`server is listening on ${port}`)
})