const bcrypt = require('bcryptjs')
const validator = require('validator')
const md5 = require('md5')
const nodemailer = require('nodemailer')
const dotenv = require('dotenv').config()
const usersCollection = require('../db').db().collection('users')

let User = function(data) {
	this.data = data
	this.errors = []
}

/*
	clean data
	========================================================================= */
User.prototype.cleanData = function() {
	if (this.data.name) { this.data.name = this.data.name.trim().toLowerCase() }
	this.data = {
		form: this.data.form,
		name: this.data.name,
		email: this.data.email.trim().toLowerCase(),
		password: this.data.password.trim(),
		terms_services: this.data.terms_services
	}
} // end clean data

/*
	validate data
	========================================================================= */
User.prototype.validate = function() {

	// register form != undefined
	if (this.data.form == 'register-form') {

		if (this.data.name == '') {
			this.errors.push({
				field: 'name',
				class: "invalid",
				msg: 'name is required'
			})
		}

		// name length > 0
		if (this.data.name.length) {

			if (this.data.name.length < 3) {
				this.errors.push({
					field: 'name',
					class: "invalid",
					msg: '3 caracters minimun'
				})
			}

			if (this.data.name.length > 15) {
				this.errors.push({
					field: 'name',
					class: "invalid",
					msg: '15 caracters minimun'
				})
			}

			if (!validator.isAlpha(this.data.name)) {
				this.errors.push({
					field: 'name',
					class: "invalid",
					msg: 'only letters'
				})
			}

		}

		if (this.data.form == 'register-form' && !this.data.terms_services) {
			this.errors.push({ snackbar: true, status: "failure", msg: 'accept our terms and services'})
		}

	}

	if (!validator.isEmail(this.data.email)) {
		this.errors.push({
			field: 'email',
			class: "invalid",
			msg: 'valid email is required'
		})
	}

	if (this.data.password == '') {
		this.errors.push({
			field: 'password',
			class: "invalid",
			msg: 'password is required'
		})
	}

	// password length > 0
	if (this.data.password.length) {

		if (!validator.isAlphanumeric(this.data.password)) {
			this.errors.push({
				field: 'password',
				class: "invalid",
				msg: 'only letters and numbers'
			})
		}

		if (this.data.password.length < 12) {
			this.errors.push({
				field: 'password',
				class: "invalid",
				msg: '12 caracters minimun'
			})
		}

		if (this.data.password.length >= 30) {
			this.errors.push({
				field: 'password',
				class: "invalid",
				msg: '30 caracters maximun'
			})
		}

	}

} // end validate data

/*
	check for user on db
	========================================================================= */
User.prototype.userSelected = function() {
	return new Promise(async (resolve, reject) => {
		try {
			let user = await usersCollection.findOne({ email: this.data.email })
			resolve(user)
		} catch { reject() }
	})
} // end user selected

/*
	sen user email
	========================================================================= */

User.prototype.sendUserEmail = function() {
	return new Promise(async (resolve, reject) => {
		try {
			let transporter = nodemailer.createTransport({
				service: 'gmail',
				port: 587,
				secure: true,
				auth: {
					user: process.env.APPLICATIONEMAIL,
					pass: process.env.APPLICATIONPW
				}
			})

			let mailOptions = {
				from: 'todoapp@info.com',
				to: this.data.email,
				subject: 'Thanks for register',
				html: `
					<p><strong>Email : <strong>${ this.data.email }</p>
					<p><strong>Password : <strong>${ this.userpw }</p>
				`
			}

			transporter.sendMail(mailOptions, function(err, info) {
				if (err) {
					reject()
				} else {
					resolve()
				}
			})

		} catch { reject() }
	})

}
/*
	register
	========================================================================= */
User.prototype.register = function() {
	return new Promise(async (resolve, reject) => {
		this.cleanData()
		this.validate()
		if (!this.errors.length) {
			try {
				let duplicated = await this.userSelected() // check for email on db
				if (duplicated) {
					this.errors.push({ field: 'email', class: "duplicated", msg: 'email already taken' })
					resolve({ form: this.data.form, errors: this.errors })
					return
				}
				delete this.data.form // remove form property from data
				this.userpw = this.data.password // original user password
				this.data.password = bcrypt.hashSync(this.data.password, bcrypt.genSaltSync(10)) // hashed user password
				await Promise.all([usersCollection.insertOne(this.data), this.sendUserEmail()])
				resolve({ success: true, status: 'success', msg: 'success register' })
			} catch { reject() }
		} else {
			resolve({ form: this.data.form, errors: this.errors })
		}
	})
} // end register

/*
	login
	========================================================================= */
User.prototype.login = function() {
	return new Promise(async (resolve, reject) => {
		this.cleanData()
		this.validate()
		if (!this.errors.length) {
			try {
				let user = await this.userSelected() // check for email on db
				if (!user) {
					this.errors.push({ field: 'email', class: 'invalid', msg: "email doesn't exist" })
					resolve({ form: this.data.form, errors: this.errors })
					return
				}
				if (user && bcrypt.compareSync(this.data.password, user.password)) {
					this.getAvatar()
					resolve({ success: true, _id: user._id, name: user.name, avatar: this.avatar })
				} else {
					this.errors.push({ field: 'password', class: 'invalid', msg: 'incorect password' })
					resolve({ form: this.data.form, errors: this.errors })
				}
			} catch { reject() }
		} else {
			resolve({ form: this.data.form, errors: this.errors })
		}
	})
} // end login

User.prototype.getAvatar = function() {
	this.avatar = `https://www.gravatar.com/avatar/${ md5(this.data.email) }?s=120`
}
module.exports = User
