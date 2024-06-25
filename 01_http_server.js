const host = '127.0.0.1'
const httpPort = 3000

const clientAddress = s => `${s.remoteAddress}:${s.remotePort}`

require('http')
.createServer(require('express')()
	.get("/", (req, res) => {
		console.log(`${clientAddress(req.socket)} requested page`)
		res.sendFile('/01_http_client.html', { root: __dirname })
	})
	.get("/hello", (req, res) => {
		console.log(`${clientAddress(req.socket)} requested hello`)
		res.writeHead(200, { 'Content-Type': 'text/plain' })
		res.end('Hello World')
}))
.listen(httpPort, host, () => console.log(`Listening at http://${host}:${httpPort}/`))