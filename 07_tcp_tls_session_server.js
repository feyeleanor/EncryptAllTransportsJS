const host = '127.0.0.1'
const tcpPort = 3002

const oneSecond = 1000
const clientAddress = s => `${s.remoteAddress}:${s.remotePort}`
const randomChoice = (yes, no) => Math.round(Math.random()) == 1 ? yes() : no()
const wait = ms => new Promise(f => setTimeout(f, ms))

const fs = require('fs')
const usingCerts = n => {
	return {
		key: fs.readFileSync(`${n}_key.pem`), 
		cert: fs.readFileSync(`${n}_cert.pem`)
}}
const options = usingCerts("server")

const crypto = require('crypto')
const usingSessions = (id, t = 300) => {
	return {
		...options,
		sessionTimeout: t,
		sessionIdContext: id,
		ticketKeys: crypto.randomBytes(48)
}}

const sessionId = s => s.getSession().toString('binary').substr(0, 48)

const server = require('tls')
.createServer(usingSessions("encrypt all transports"), socket => {
	const a = clientAddress(socket)
	console.log(`${a} connected`)
	socket
	.on('data', d => {
		console.log(`${a} said '${d}'`)
		randomChoice(
			() => {},
			() => socket.write(d.reverse()))
		wait(oneSecond).then(() => socket.destroy())
	})
	.on('close', () => console.log(`${a} disconnected`))
})
.on('secureConnection', s => {
	const a = clientAddress(s)
	console.log(`${a} ${s.getProtocol()} session ID: ${sessionId(s)}`)
})
.on('error', e => {
	console.error(e)
	server.destroy()
})
.listen(tcpPort, host, () => console.log(`Server running at tcp://${host}:${tcpPort}/`))