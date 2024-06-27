const host = '127.0.0.1'
const tcpPort = 3002

const fs = require('fs')
const usingCerts = n => { return {
	key: fs.readFileSync(`${n}_key.pem`), 
	cert: fs.readFileSync(`${n}_cert.pem`), 
}}

const tls = require('tls')
.connect(tcpPort, host, usingCerts("client"), () => {
	console.log('connected to server')
	console.log(tls.authorized ? 'authorized' : tls.authorizationError)
	tls.write('hello server')
})
.on('data', d => {
	console.log(`Message from server: '${d}'`)
	tls.write('next')
})
.on('close', () => console.log('connection closed'))
.on('error', e => {
	console.error(e)
	tls.destroy()
})