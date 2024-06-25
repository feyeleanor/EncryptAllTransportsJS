const host = '127.0.0.1'
const httpPort = 3000

const clientAddress = s => `${s.remoteAddress}:${s.remotePort}`

const fs = require('fs')
const usingCerts = n => { return {
	key: fs.readFileSync(`${n}_key.pem`), 
	cert: fs.readFileSync(`${n}_cert.pem`), 
}}

require('https')
.createServer(usingCerts("server"), require('express')()
	.get("/", (req, res) => {
		console.log(`${clientAddress(req.socket)} requested page`)
		res.sendFile('/02_https_client.html', { root: __dirname })
	})
	.get("/hello", (req, res) => {
		console.log(`${clientAddress(req.socket)} requested hello`)
		res.writeHead(200, { 'Content-Type': 'text/plain' })
		res.end('Hello World')
}))
.listen(httpPort, host, () => console.log(`Listening at https://${host}:${httpPort}/`))