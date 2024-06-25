const host = '127.0.0.1'
const httpPort = 3000

const onConnection = method => {
	return response => {
		if (response.statusCode = 200) {
			var message = ''
			response
			.on('data', d => message += d)
			.on('close', () => console.log(`${method} returns ${message}`))
		} else {
			console.error(`${method} failed`, e)
		}
	}
}

const hello = `https://${host}:${httpPort}/hello`

const https = require('https')
https
.get(hello, onConnection('GET'))
.on('error', e => console.error('GET failed', e))

https
.request(hello, { method: 'GET' }, onConnection('REQUEST'))
.on('error', e => console.error('REQUEST failed', e))
.end()