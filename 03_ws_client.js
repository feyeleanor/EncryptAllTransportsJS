const host = '127.0.0.1'
const wsPort = 3001

const WebSocket = require('ws')
const socket = new WebSocket(`ws://${host}:${wsPort}`)
.on('open', () => {
	socket.send('hello world')
	socket.close()
})
.on('message', m => console.log(`Message from server: ${m}`))
.on('close', () => console.log('Connection closed'))