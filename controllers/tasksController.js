const Task = require('../models/Tasks')

// get user tasks
exports.getUserTasks = function(req, res) {
	let tasks = new Task({}, req.session.user._id)
	tasks.getUserTasks().then(userTasks => {
		res.json(userTasks)
	}).catch(e => res.json(e))
}

// create task
exports.create = function(req, res) {
	let task = new Task(req.body, req.session.user._id)
	task.create().then(result => {
		setTimeout(() => res.json(result), 650)
	}).catch(e => console.log(e))
}

// update task
exports.update = function(req, res) {
	let task = new Task(req.body)
	task.update().then(response => {
		setTimeout(() => res.json(response), 650)
	}).catch(e => res.json({ attack: true }))
}

// delete user tasks
exports.delete = function(req, res) {
	let task = new Task()
	Task.delete(req.body._id).then(deleted => {
		setTimeout(() => res.json(deleted), 650)
	}).catch(e => console.log(e))
}
