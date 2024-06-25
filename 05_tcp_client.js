const host = '127.0.0.1'
const tcpPort = 3002

const socket = new require('net')
.Socket()
.connect(tcpPort, host, () => {
	console.log('connected to server')
	socket.write('hello world')
})
.on('data', d => {
	console.log(`Message from server: ${d}`)
	socket.write('next')
})
.on('close', () => console.log('connection closed'))