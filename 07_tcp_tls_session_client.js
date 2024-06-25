const host = '127.0.0.1'
const tcpPort = 3002

const oneSecond = 1000
const wait = ms => new Promise(f => setTimeout(f, ms))

const fs = require('fs')
const usingCerts = n => { return {
	key: fs.readFileSync(`${n}_key.pem`), 
	cert: fs.readFileSync(`${n}_cert.pem`), 
}}
const options = usingCerts("client")

let session = Buffer.from('')
const sessionId = s => s.slice(0, 48).toString('hex')	//.substr(0, 48)

const tls = require('tls')
const connect = (p, h, o = {}) => {
	let socket = tls.connect(p, h, { ...o, session: session })
	.on('secureConnect', () => {
		console.log(`agreed TLS protocol ${socket.getProtocol()}`)
		if (socket.isSessionReused()) console.log(`reusing session ${sessionId(session)}`)

		if (socket.authorized) console.log("authorized by CA")
		else console.log(`not authorized: ${socket.authorizationError}`)

		console.log('connected to server')
		socket.write('hello server')
	})
	.once('session', s => session = s)
	.on('data', d => {
		console.log(`server says: ${d}`)
		socket.write('next')
	})
	.on('close', () => {
		console.log('connection interrupted')
		wait(oneSecond)
		.then(() => {
			console.log(`reconnecting session ${sessionId(session)}`)
			connect(p, h, o)
		})
	})
}
connect(tcpPort, host, options)