const host = '127.0.0.1'
const udpPort = 3003

const oneSecond = 1000
const peerAddress = s => `${s.Address}:${s.Port}`
const randomChoice = (yes, no) => Math.round(Math.random()) == 1 ? yes() : no()
const wait = ms => new Promise(f => setTimeout(f, ms))
const ping = Buffer.from('PingPingPingPing!')

const secretKey = Buffer.from('!secretsecretsecretsecretsecret!')

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

const sender = require('dgram').createSocket('udp4')
.on('message', (m, i) => {
	console.log(`${peerAddress(i)} said ${decrypt(m)}`)
	wait(oneSecond).then(() => sender.send(
		encrypt(
			randomChoice(
				() => ping,
				() => ping.reverse())),
		i.port,
		i.address))
})
sender.send(encrypt('hello'), udpPort, host)