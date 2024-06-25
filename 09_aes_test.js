const host = '127.0.0.1'
const udpPort = 3003

const secretKey = Buffer.from('!secretsecretsecretsecretsecret!')

const oneSecond = 1000
const randomChoice = (yes, no) => Math.round(Math.random()) == 1 ? yes() : no()
const wait = ms => new Promise(f => setTimeout(f, ms))
const ping = Buffer.from('PingPingPingPing!')
const pong = Buffer.from('PongPongPongPong!')

const crypto = require('crypto')
const encrypt = m => {
	let iv = crypto.randomFillSync(Buffer.alloc(16))
	let e = crypto.createCipheriv('aes-256-cbc', secretKey, iv)
	return	Buffer.concat([iv, e.update(Buffer.from(m)), e.final()])
}

const decrypt = m => {
	let iv = m.slice(0, 16)
	let d = crypto.createDecipheriv('aes-256-cbc', secretKey, iv)
	return Buffer.concat([d.update(m.slice(16)), d.final()])
}

const receiveMessage = (i, m) => {
	let d = decrypt(m)
	console.log(`${i.address}:${i.port} said '${m.toString('hex')}' (i: ${i.size} bytes)`)
	console.log(`${i.address}:${i.port} which decrypts to '${d}'`)
}

const sendMessage = (s, i, m) => {
	s.send(
		encrypt(
			randomChoice(
				() => m,
				() => m.reverse())),
		i.port,
		i.address)
}

const dgram = require('dgram')
const listener = dgram.createSocket('udp4')
.on('message', (m, i) => {
	receiveMessage(i, m)
	wait(oneSecond).then(() => sendMessage(listener, i, pong))
})
listener.bind(udpPort, host, () => console.log(`Listening at udp://${host}:${udpPort}/`))

const sender = dgram.createSocket('udp4')
.on('message', (m, i) => {
	receiveMessage(i, m)
	wait(oneSecond).then(() => sendMessage(sender, i, ping))
})
sender.send(encrypt('hello'), udpPort, host)