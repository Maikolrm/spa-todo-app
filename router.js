const express = require('express')
const router = express.Router()
const userController = require('./controllers/userController')
const tasksController = require('./controllers/tasksController')

// user related routs
router.get('/', userController.home)
router.post('/register', userController.register)
router.post('/validate-email', userController.duplicatedEmail)
router.post('/login', userController.login)
router.get('/logout', userController.logout)

// tasks related routs
router.post('/create-task', tasksController.create)
router.get('/get-tasks', tasksController.getUserTasks)
router.post('/delete-task', tasksController.delete)
router.post('/update-task', tasksController.update)

module.exports = router
