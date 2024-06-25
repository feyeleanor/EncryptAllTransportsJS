const host = '127.0.0.1'
const httpPort = 3000
const udpPort = 3003

const oneSecond = 1000
const clientAddress = s => `${s.remoteAddress}:${s.remotePort}`
const wait = ms => new Promise(f => setTimeout(f, ms))

const crypto = require('crypto')
const sha256oaep = k => ({
	key: k,
	padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
	oaepHash: "sha256"
})

const decrypt = (k, m) => crypto.privateDecrypt(sha256oaep(k), m)

const { publicKey, privateKey } = crypto.generateKeyPairSync(
	"rsa",
	{ modulusLength: 4096 }
)

const registerKey = (k, p, h) => {
	fetch(`http://${h}:${p}/publicKey`, {
		method: 'POST',
		body: k.export({ type: 'pkcs1', format: 'pem' })
	})
	.then(r => r.text())
	.then(t => console.log(t))
	.catch(e => console.error(`failed to store publicKey`, e))
}

const receiveMessage = (k, i, m) => {
	let d = decrypt(k, m)
	console.log(`${i.address}:${i.port} said '${m.toString('hex')}' (i: ${i.size} bytes)`)
	console.log(`${i.address}:${i.port} which decrypts to '${d}'`)
}

const sender = require('dgram').createSocket('udp4')
.on('message', (m, i) => {
	receiveMessage(privateKey, i, m)
	wait(oneSecond).then(() => sender.send('ping', i.port, i.address))
})

registerKey(publicKey, httpPort, host)
sender.send('hello', udpPort, host)