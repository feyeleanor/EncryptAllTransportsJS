const host = '127.0.0.1'
const httpPort = 3000
const wsPort = 3001

const clientAddress = s => `${s.remoteAddress}:${s.remotePort}`
const announceLaunch = (p, h, s = 'http') => console.log(`Listening at ${s}://${h}:${p}/`)

const fs = require('fs')
const usingCerts = n => {
	return {
		key: fs.readFileSync(`${n}_key.pem`),
		cert: fs.readFileSync(`${n}_cert.pem`),
//		ca: [readFileSync(`${__dirname}/path/to/cert/ca.crt`)]
}}

const serverOptions = usingCerts("server")
const https = require('https')

https
.createServer(serverOptions, require('express')()
	.use((req, res) => res.sendFile('/04_wss_client.html', { root: __dirname }))
)
.listen(httpPort, host, () => announceLaunch(httpPort, host, 'https'))

const { WebSocketServer } = require('ws')
const socketServer = https.createServer(serverOptions)
socketServer
.listen(wsPort, host, () => {
	announceLaunch(wsPort, host, 'wss')
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