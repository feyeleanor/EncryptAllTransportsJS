const host = '127.0.0.1'
const httpPort = 3000

fetch(`http://${host}:${httpPort}/hello`)
.then(r => {
	console.log(`response status code ${r.status}`)
	return r.text()
})
.then(t => console.log(`fetch returns ${t}`))
.catch(e => console.error(`fetch failed`, e))