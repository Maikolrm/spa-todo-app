const validator = require('validator')
const tasksCollection = require('../db').db().collection('tasks')
const ObjectID = require('mongodb').ObjectID

let Task = function(data, userid) {
	this.data = data
	this.userid = userid // user _id
	this.errors = []
}

// clean data
Task.prototype.cleanData = function() {
	this.data = {
		_id: this.data._id,
		description: this.data.description.trim()
	}
}

// validate data
Task.prototype.validate = function() {

	if (/[^a-zA-Z0-9@#\s]/g.test(this.data.description)) {
		this.errors.push({
			field: 'description',
			class: "invalid",
			msg: 'only letters numbers @ y #'
		})
	}

	if (this.data.description == "") {
		this.errors.push({
			field: 'description',
			class: "invalid",
			msg: 'task description required'
		})
	}

	if (this.data.description.length) {

		if (this.data.description.length < 3) {
			this.errors.push({
				field: 'description',
				class: "invalid",
				msg: '3 characters minimun'
			})
		}

		if (this.data.description.length > 30) {
			this.errors.push({
				field: 'description',
				class: "invalid",
				msg: '30 characters maximun'
			})
		}

	}

}

// create task
Task.prototype.create = function() {
	return new Promise(async (resolve, reject) => {
		this.cleanData()
		this.validate()
		if (!this.errors.length) {
			try {
				let task = await tasksCollection.insertOne({ description: this.data.description, user: ObjectID(this.userid) })
				task = task.ops[0]
				delete task.user // remove user from response
				resolve({ tasks: [task], success: true, status: 'success', msg: 'task created' })
			} catch { reject() }
		} else {
			resolve({ form: 'create-task-form', errors: this.errors })
		}
	})
}

// get user tasks
Task.prototype.getUserTasks = function () {
	return new Promise(async (resolve, reject) => {
		try {
			let tasks = await tasksCollection.find({ user: new ObjectID(this.userid) }, { projection: { user: 0 } }).toArray()
			if (tasks.length) {
				resolve({ tasks: tasks })
			} else {
				resolve({ tasks: [] })
			}
		} catch { reject() }
	})
}

// update document
Task.prototype.updateDocument = function() {
	return new Promise(async (resolve, reject) => {
		try {
			let task = await tasksCollection.findOne({ _id: new ObjectID(this.data._id) })
			if (!ObjectID.isValid(this.data._id) || !task) {
				reject()
				return
			}
			let result = await tasksCollection.findOneAndUpdate(
				{ _id: new ObjectID(this.data._id) },
				{ $set: { description: this.data.description } }
			)
			resolve()
		} catch { reject() }
	})
}

// update task
Task.prototype.update = function() {
	return new Promise(async (resolve, reject) => {
		this.cleanData()
		this.validate()
		if (!this.errors.length) {
			try {
				await this.updateDocument()
				resolve({ success: true, status: 'success', msg: 'task update' })
			} catch { reject() }
		} else {
			resolve({
				task: this.data._id,
				status: 'failure',
				msg: this.errors[0].msg
			})
		}
	}) // promise end
}

Task.delete = function(taskid) {
	return new Promise(async (resolve, reject) => {
		try {
			await tasksCollection.deleteOne({ _id: new ObjectID(taskid) })
			resolve({ _id: taskid, success:true, status: 'success', msg: 'task deleted' })
		} catch {
			reject()
		}
	})
}

module.exports = Task
