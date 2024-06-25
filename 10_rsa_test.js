const host = '127.0.0.1'
const udpPort = 3003

const oneSecond = 1000
const randomChoice = (yes, no) => Math.round(Math.random()) == 1 ? yes() : no()
const wait = ms => new Promise(f => setTimeout(f, ms))
const ping = Buffer.from('PingPingPingPing!')

const crypto = require('crypto')
const { publicKey, privateKey } = crypto.generateKeyPairSync(
	"rsa",
	{ modulusLength: 4096 }
)

const encrypt = (k, m) => {
	return crypto.publicEncrypt(
		{	key: k,
			padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
			oaepHash: "sha256" },
		Buffer.from(m)
	)
}

const decrypt = (k, m) => {
	return crypto.privateDecrypt(
		{	key: k,
			padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
			oaepHash: "sha256" },
		m
	)
}

const receiveMessage = (k, i, m) => {
	let d = decrypt(k, m)
	console.log(`${i.address}:${i.port} said '${m.toString('hex')}' (i: ${i.size} bytes)`)
	console.log(`${i.address}:${i.port} which decrypts to '${d}'`)
}

const sendMessage = (s, k, i, m) => {
	s.send(
		encrypt(k, randomChoice(
			() => m,
			() => m.reverse())),
		i.port,
		i.address)
}

const dgram = require('dgram')
const listener = dgram.createSocket('udp4')
.on('message', (m, i) => {
	receiveMessage(privateKey, i, m)
	wait(oneSecond).then(() => sendMessage(listener, publicKey, i, pong))
})
listener.bind(udpPort, host, () => console.log(`Listening at udp://${host}:${udpPort}/`))

const sender = dgram.createSocket('udp4')
.on('message', (m, i) => {
	receiveMessage(privateKey, i, m)
	wait(oneSecond).then(() => sendMessage(sender, publicKey, i, ping))
})
sender.send(encrypt(publicKey, 'hello'), udpPort, host)