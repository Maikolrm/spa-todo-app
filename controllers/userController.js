const User = require('../models/User.js')

// duplicated email
exports.duplicatedEmail = (req, res) => {
	let user = new User(req.body)
	user.userSelected().then(result => {
		if (result) { res.json({ duplicated: true }) } else res.json({ duplicated: false })
	}).catch(e => res.json(e))
}
// register
exports.register = (req, res) => {
	let user = new User(req.body)
	user.register().then(result => {
		setTimeout(() => res.json(result), 650)
	}).catch(e => res.json(e) )
}

// logout
exports.logout = (req, res) => {
	req.session.destroy(() => res.redirect('/'))
}

// login
exports.login = (req, res) => {
	let user = new User(req.body)
	user.login().then(response => {
		if (response.errors) {
			setTimeout(() => res.json(response), 650)
			return
		}
		req.session.user = { _id: response._id, name: response.name, avatar: response.avatar }
		setTimeout(() => res.json(response), 650)
	}).catch(e => res.json(e))
}

// home
exports.home = (req, res) => {
	if (!req.session.user) {
		res.render('home-guess')
	} else {
		res.render('home-dashboard')
	}
}

// 404
exports.render_404 = function(req, res) {
	res.render('404')
}
