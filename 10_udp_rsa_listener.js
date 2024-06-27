const host = '127.0.0.1'
const httpPort = 3000
const udpPort = 3003

const oneSecond = 1000
const clientAddress = s => `${s.remoteAddress}:${s.remotePort}`
const peerAddress = s => `${s.Address}:${s.Port}`
const announceLaunch = (p, h, s = 'http') => console.log(`Listening at ${s}://${h}:${p}/`)
const wait = ms => new Promise(f => setTimeout(f, ms))

const crypto = require('crypto')
const sha256oaep = k => ({
	key: k,
	padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
	oaepHash: "sha256"
})

const encrypt = (k, m) => crypto.publicEncrypt(sha256oaep(k), Buffer.from(m))

const keys = new Map()
require('https')
.createServer(require('express')()
	.post("/publicKey", (req, res) => {
		console.log(`${clientAddress(req.socket)} registering publicKey`)
		var body = []
		req
		.on('data', d => body.push(d))
		.on('end', () => {
			keys.set(req.socket.remoteAddress, crypto.createPublicKey(Buffer.concat(body)))
			res.writeHead(200, { 'Content-Type': 'text/plain' })
			res.end("Public Key Registered")
	    })
}))
.listen(httpPort, host, () => announceLaunch(httpPort, host))

const socket = require('dgram').createSocket('udp4')
.on('message', (m, i) => {
	console.log(`${peerAddress(i)} said '${m}'`)
	wait(oneSecond).then(() => {
		if (k = keys.get(i.address)) socket.send(encrypt(k, 'pong'), i.port, i.address)
		else console.log(`no public key is registered for ${i.address}`)
	})
})
socket.bind(udpPort, host, () => announceLaunch(udpPort, host, 'udp'))
