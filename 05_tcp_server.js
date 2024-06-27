const host = '127.0.0.1'
const tcpPort = 3002

const oneSecond = 1000
const clientAddress = s => `${s.remoteAddress}:${s.remotePort}`
const announceLaunch = (p, h, s = 'http') => console.log(`Listening at ${s}://${h}:${p}/`)
const randomChoice = (yes, no) => Math.round(Math.random()) == 1 ? yes() : no()
const wait = ms => new Promise(f => setTimeout(f, ms))

const net = require('net')
.createServer(socket => {
	const a = clientAddress(socket)
	console.log(`${a} connected`)
	socket
	.on('data', d => {
		console.log(`${a} said '${d}'`)
		randomChoice(
			() => wait(oneSecond).then(() => socket.destroy()),
			() => socket.write(d.reverse()))
	})
	.on('close', () => console.log(`${a} disconnected`))
})
.on('error', e => {
	console.error(e)
	net.destroy()
})
.listen(tcpPort, host, () => announceLaunch(tcpPort, host, 'tcp'))