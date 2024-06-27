const host = '127.0.0.1'
const httpPort = 3000

const hello = `https://${host}:${httpPort}/hello`

fetch(hello)
.then(r => {
	console.log(`response status code ${r.status}`)
	return r.text()
})
.then(t => console.log(`fetch returns ${t}`))
.catch(e => console.error(`fetch failed`, e))