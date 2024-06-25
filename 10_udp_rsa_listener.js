const host = '127.0.0.1'
const httpPort = 3000
const udpPort = 3003

const oneSecond = 1000
const clientAddress = s => `${s.remoteAddress}:${s.remotePort}`
const wait = ms => new Promise(f => setTimeout(f, ms))
const keys = new Map()

const crypto = require('crypto')
const sha256oaep = k => ({
	key: k,
	padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
	oaepHash: "sha256"
})

const encrypt = (k, m) => crypto.publicEncrypt(sha256oaep(k), Buffer.from(m))

require('http')
.createServer(require('express')()
	.post("/publicKey", (req, res) => {
		console.log(`${clientAddress(req.socket)} registering publicKey`)
		var body = []
		req
		.on('data', c => body.push(c))
		.on('end', () => {
			keys.set(
				req.socket.remoteAddress,
				crypto.createPublicKey(Buffer.concat(body)))
			res.writeHead(200, { 'Content-Type': 'text/plain' })
			res.end("Public Key Registered")
	    })
}))
.listen(httpPort, host, () => console.log(`Listening at http://${host}:${httpPort}/`))

const sendMessage = (s, i, m) => {
	if (k = keys.get(i.address)) s.send(
		encrypt(k, m),
		i.port,
		i.address)
	else console.log(`no public key is registered for ${i.address}`)
}

const dgram = require('dgram')
const listener = dgram.createSocket('udp4')
.on('message', (m, i) => {
	console.log(`${i.address}:${i.port} said '${m.toString()}' (i: ${i.size} bytes)`)
	wait(oneSecond).then(() => sendMessage(listener, i, 'pong'))
})
listener.bind(udpPort, host, () => console.log(`Listening at udp://${host}:${udpPort}/`))
