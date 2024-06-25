const host = '127.0.0.1'
const httpPort = 3000
const wsPort = 3001

const clientAddress = s => `${s.remoteAddress}:${s.remotePort}`

const fs = require('fs')
const usingCerts = n => { return {
	key: fs.readFileSync(`${n}_key.pem`), 
	cert: fs.readFileSync(`${n}_cert.pem`), 
}}

const serverOptions = usingCerts("server")
const https = require('https')
https
.createServer(serverOptions, require('express')()
	.use((req, res) => res.sendFile('/04_wss_client.html', { root: __dirname }))
)
.listen(httpPort, host, () => console.log(`Server running at https://${host}:${httpPort}/`))

const { WebSocketServer } = require('ws')
const socketServer = https.createServer(serverOptions)
socketServer
.listen(wsPort, host, () => {
	console.log(`Socket Server running at https://${host}:${wsPort}/`)
	new WebSocketServer({ server: socketServer })
	.on('connection', (webSocket, request) => {
		const a = clientAddress(request.socket)
		console.log(`${a} connected`)
		webSocket
		.on('close', () => console.log(`${a} disconnected`))
		.on('message', m => webSocket.send(`${m.reverse()}`))
		.on('error', () => console.log('websocket error'))
		.send('hello')
	})
})