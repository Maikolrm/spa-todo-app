const mongo = require('mongodb')
const dotenv = require('dotenv').config()

mongo.connect(
	process.env.CONNECTIONSTRING,
	{ useUnifiedTopology: true },
	(err, client) => {
		module.exports = client
		const app = require('./app')
		app.listen(process.env.PORT)
})
