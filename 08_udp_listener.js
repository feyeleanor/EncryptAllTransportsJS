const host = '127.0.0.1'
const udpPort = 3003

const oneSecond = 1000
const randomChoice = (yes, no) => Math.round(Math.random()) == 1 ? yes() : no()
const wait = ms => new Promise(f => setTimeout(f, ms))
const pong = Buffer.from('pong')

const socket = require('dgram').createSocket('udp4')
.on('message', (m, i) => {
	console.log(`${i.address}:${i.port} said '${m}' (${i.size} bytes)`)
	var r = randomChoice(
		() => pong,
		() => m.reverse())
	console.log(`responding with '${r}'`)
	wait(oneSecond).then(() => socket.send(r, i.port, i.address))
})
.on('close', () => {
	console.log(`Socket closed! BYE!!`)
	process.exit(0)
})
.on('error', e => e => {
	console.error(e)
	process.exit(1)
})

socket.bind(udpPort, host, () => console.log(`Listening at udp://${host}:${udpPort}/`))