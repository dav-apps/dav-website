var websocket = require('../websocket');

const loginKey = "login";
exports.loginKey = loginKey;

exports.login = async function(message){
	console.log(message)
	websocket.emit(loginKey, "Hello back!");
}