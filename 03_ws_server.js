const host = '127.0.0.1'
const httpPort = 3000
const wsPort = 3001

const clientAddress = s => `${s.remoteAddress}:${s.remotePort}`

require('express')()
.use((req, res) => res.sendFile('/03_ws_client.html', { root: __dirname }))
.listen(httpPort, host, () => console.log(`Server running at http://${host}:${httpPort}/`))

const { WebSocketServer } = require('ws')
new WebSocketServer({ port: wsPort })
.on('connection', (webSocket, request) => {
	const a = clientAddress(request.socket)
	console.log(`${a} connected`)
	webSocket
	.on('message', m => webSocket.send(`${m.reverse()}`))
	.on('close', () => console.log(`${a} disconnected`))
	.on('error', () => console.log('websocket error'))
	.send('hello')
})