const host = '127.0.0.1'
const httpPort = 3000
const udpPort = 3003

const oneSecond = 1000
const clientAddress = s => `${s.remoteAddress}:${s.remotePort}`
const peerAddress = s => `${s.Address}:${s.Port}`
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

fetch(`https://${host}:${httpPort}/publicKey`, {
	method: 'POST',
	body: publicKey.export({ type: 'pkcs1', format: 'pem' })
})
.then(r => console.log(r.text()))
.catch(e => console.error(`failed to store publicKey`, e))

const sender = require('dgram').createSocket('udp4')
.on('message', (m, i) => {
	let d = decrypt(privateKey, m)
	console.log(`${peerAddress(i)} said '${m.toString('hex')}' (i: ${i.size} bytes)`)
	console.log(`${peerAddress(i)} which decrypts to '${d}'`)
	wait(oneSecond).then(() => sender.send('ping', i.port, i.address))
})

sender.send('hello', udpPort, host)