const host = '127.0.0.1'
const udpPort = 3003

const secretKey = Buffer.from('!secretsecretsecretsecretsecret!')

const oneSecond = 1000
const randomChoice = (yes, no) => Math.round(Math.random()) == 1 ? yes() : no()
const wait = ms => new Promise(f => setTimeout(f, ms))
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

const dgram = require('dgram')
const listener = dgram.createSocket('udp4')
.on('message', (m, i) => {
	console.log(`${i.address}:${i.port} said ${decrypt(m)}`)
	wait(oneSecond).then(() => listener.send(
		encrypt(
			randomChoice(
				() => pong,
				() => pong.reverse())),
		i.port,
		i.address))
})
listener.bind(udpPort, host, () => console.log(`Listening at udp://${host}:${udpPort}/`))