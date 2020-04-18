$(document).ready(() => {
	let exp = /^(?:[a-z0-9!#$%&amp;'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&amp;'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])$/
	let registerForm = $('#register-form')
	let snackbar = $('.main__snackbar')
	let typingDelay

	/*
		close register form
		========================================================================= */
	$('.register-form__close-btn').on('click', function() {
		$(this).parent().fadeOut(20)
	})

	/*
		show snackbar
		========================================================================= */
	function showSnackbar(response, delay) {
		$(snackbar).attr('data-status', response.status)
		$(snackbar).text(response.msg)
		$(snackbar).fadeIn(100, function() {
			setTimeout(() => $(this).fadeOut(100), delay)
		})
	}

	/*
		toogle password visibility
		========================================================================= */
	$('.form__icon-toggle-pw').on('click', function() {
		if ($(this).prev().prev().attr('type') === "password") {
			$(this).prev().prev().attr('type', 'text')
		} else {
			$(this).prev().prev().attr('type', 'password')
		}
	})

	// tooltip methods
	function showTooltip(field) {
		$(field).prev().fadeIn(50)
	}

	function hideTooltip(field) {
		$(field).prev().fadeOut(50)
	}

	/*
		validate duplicated email
		========================================================================= */
	function validateDuplicatedEmail(field) {
		$.ajax({
			type: 'post',
			url: '/validate-email',
			data: {
				email: $(field).val().replace(/\s+/g, '').trim()
			},
			dataType: 'json',
			success: response => {
				// console.log(response)
				if (!response.duplicated) {
					$(field).removeClass('duplicated')
					hideTooltip(field)
				}
			},
			error: e => console.log(e)
		})
	}

	/*
		validate form fields
		========================================================================= */
	$('.form__field').on({
		keyup: function() {
			if ($(this).attr('class').search('invalid') > -1) {
				if ($(this).attr('name') === 'email') {
					if (exp.test($(this).val().toLowerCase())) {
						$(this).removeClass("invalid")
						hideTooltip(this)
					}
				} else {
					if ($(this).val().length >= 3) {
						$(this).removeClass('invalid')
						hideTooltip(this)
					}
				}
			}

			if ($(this).attr('class').search('duplicated') > -1) {
				clearInterval(typingDelay)
				typingDelay = setTimeout(() => {
					validateDuplicatedEmail(this)
				}, 650)
			}

		},
		focusin: function() {
			if ($(this).attr('class').search('invalid') > -1 || $(this).attr('class').search('duplicated') > -1) {
				showTooltip(this)
			}
		},
		focusout: function() {
			if ($(this).attr('class').search('invalid') > -1 || $(this).attr('class').search('duplicated') > -1) {
				hideTooltip(this)
			}
		}
	})

	/*
		show register form
		========================================================================= */
	$('.top-section__create-account-btn').on('click', function() {
		$(registerForm).fadeIn(20)
		setTimeout(() => {
			$(registerForm).find("input[name='name']").focus()
		}, 30)
	})

	/*
		validate server response
		========================================================================= */
	function validateServerResponse(response) {
		let form = $("#" + response.form + ""), errors = response.errors
		if (errors.length > 1) {
			errors.forEach(error => {
				let field = $(form).find("input[name='" + error.field + "']")
				$(field).addClass(error.class)
				$(field).prev().text(error.msg) // tooltip
			})
		} else {
			let error = errors[0]
			if (error.snackbar) { showSnackbar(error, 1000); return }
			let field = $(form).find("input[name='" + error.field + "']")
			$(field).addClass(error.class)
			$(field).prev().text(error.msg) // tooltip
			$(field).focus()
		}
	}

	/*
		register form event
		========================================================================= */
	$(registerForm).on('submit', function(e) {
		e.preventDefault()
		let obj = {
			form: $(this),
			field: $(this).find('input'),
			btn: $(this).find('button')
		}
		$.ajax({
			type: "post",
			url: "/register",
			data: $(this).serialize(),
			dataType: "json",
			beforeSend: () => {
				$(obj.field).removeClass(['invalid', 'duplicated'])
				$(obj.btn).html('<i class="btn__loader"></i>')
				$(obj.btn).attr('disabled', 'true')
			},
			success: response => manageRegisterResponse(response, obj),
			error: e => console.log(e)
		})
	})

	// manage register response
	function manageRegisterResponse(response, form) {
		if (response.success) {
			showSnackbar(response, 1000)
			$(form.btn).html('sign up')
			$(form.btn).removeAttr('disabled')
			setTimeout(() => $(form.form).fadeOut(100), 1050)
		}
		if (response.errors) {
			validateServerResponse(response)
			$(form.btn).html('sign up')
			$(form.btn).removeAttr('disabled')
		}
	}

	/*
		login form event
		========================================================================= */
	$("#login-form").on('submit', function(e) {
		e.preventDefault()
		let btn = $(this).find('button')
		$.ajax({
			type: "post",
			url: "/login",
			data: $(this).serialize(),
			dataType: "json",
			beforeSend: () => {
				$(btn).attr('disabled', 'true')
				$(btn).html('<i class="btn__loader"></i>')
			},
			success: response => manageLoginFormResponse(response, btn),
			error: e => console.log(e)
		})
	})

	// manage login form
	function manageLoginFormResponse(response, btn) {
		// console.log(response)
		if (response.errors) {
			validateServerResponse(response)
			$(btn).html('sign in')
			$(btn).removeAttr('disabled')
			return
		}
		if (response.success) { location.href = '/' }
	}

	/*
		dashboard
		========================================================================= */
	if ($('.dashboard__content').length) {

		$(document).find('title').html('To do - Dashboard') // update document title

		/*
			get user tasks
			======================================================================= */
		$.ajax({
			url: "/get-tasks",
			dataType: "json",
			success: response => appendUserTasks(response.tasks),
			error: e => console.log(e)
		})

		/*
			append user tasks
			======================================================================= */
		function appendUserTasks(tasks) {
			if (tasks.length) {
				tasks.map(task => {
					$('#user-tasks').append(
						`<div id="${ task._id }" class="user-tasks__task">
							<button data-task-action="edit" data-task-id="${ task._id }" class="task__icon fas fa-cog" title="Edit"></button>
							<input class="task__description" value="${ task.description }" readonly/>
							<button data-task-action="delete" data-task-id="${ task._id }" class="task__icon fas fa-trash-alt" title="Delete"></button>
						</div>`
					)
				})
				$('.modal__content--none-tasks').hide()
			} else {
				$('.modal__content--none-tasks').show()
			}
			setTimeout(() => $('.content__modal--loading-banner').fadeOut(300), 800)
		}

		/*
			dashboard footer
			======================================================================= */
		let footerTabs = $('.footer__tab')

		// dashboard footer tabs
		$(footerTabs).on('click', function() {
			if ($(this).attr('class').search('selected') > -1) {
				return
			}
			$(footerTabs).removeClass('selected')
			$(this).addClass('selected')
			$('.content__modal').fadeOut(20, () => {
				setTimeout(() => $("#" + $(this).attr('data-id') + "").fadeIn(20), 30)
			})
			if ($(this).attr('data-id').search('create-task') > -1) {
				setTimeout(() => $("#create-task").find('input').focus(), 50)
			}
		})

		/*
			create task event
			======================================================================= */
		$('#create-task-form').on('submit', function(e) {
			e.preventDefault()
			let form = {
				field: $(this).find('input'),
				btn: $(this).find('button')
			}
			$.ajax({
				type: 'post',
				url: '/create-task',
				data: $(this).serialize(),
				dataType: 'json',
				beforeSend: () => {
					$(form.btn).attr('disabled', 'true'),
						$(form.btn).html('<i class="btn__loader"></i>')
				},
				success: response => manageCreateTaskResponse(response, form),
				error: (e) => console.log(e)
			})
		})

		// manage create task response
		function manageCreateTaskResponse(response, form) {
			if (response.errors) {
				validateServerResponse(response)
				$(form.btn).html('create')
				$(form.btn).removeAttr('disabled')
				return
			}
			if (response.success) {
				appendUserTasks(response.tasks)
				showSnackbar(response, 1000)
				$(form.btn).html('create')
				$(form.btn).removeAttr('disabled')
				$(form.field).val('')
				$(form.field).focus()
			}
		}

		/*
			update task request
			========================================================================= */
		function updateTaskRequest(task, btn) {
			$.ajax({
				type: 'post',
				url: '/update-task',
				data: task,
				dataType: 'json',
				beforeSend: () => {
					$(btn).addClass('transparent')
					$(btn).attr('disabled', 'true')
					$(btn).prev().removeClass('invalid')
					$(btn).html('<i class="btn__loader"></i>')
				},
				success: response => manageUpdateTaskResponse(response, btn),
				error: e => console.log(e)
			})
		}

		// manage update task response
		function manageUpdateTaskResponse(response, btn) {
			// console.log(response)
			if (response.attack) {
				location.href = '/404'
				return
			}
			if (response.success) {
				$(btn).html('')
				$(btn).removeClass('transparent')
				$(btn).removeAttr('disabled')
				showSnackbar(response, 1000)
				disableTaskEditMode($(btn).prev().prev())
			} else {
				let task = $("#" + response.task + ""), field = $(task).find('input')
				$(btn).html('')
				$(btn).removeClass('transparent')
				$(btn).removeAttr('disabled')
				$(field).addClass('invalid') // add field invalid class
				$(field).focus() // focus on field
				showSnackbar(response, 1500)
			}
			if (response.errors) { validateServerResponse(response) }
		}

		/*
			delete task request
			========================================================================= */
		function deleteTaskRequest(taskid, btn) {
			$.ajax({
				type: 'post',
				url: '/delete-task',
				data: { _id: taskid },
				dataType: 'json',
				beforeSend: () => {
					$(btn).addClass('transparent')
					$(btn).attr('disabled', 'true')
					$(btn).html('<i class="btn__loader"></i>')
				},
				success: response => removeTaskFromDOM(response),
				error: e => console.log(e)
			})
		}

		// remove task from DOM
		function removeTaskFromDOM(response) {
			if (response.success) {
				let tasks = $('#user-tasks .user-tasks__task').length - 1
				$("#" + response._id + "").fadeOut(200, function() {
					$(this).remove()
					showSnackbar(response, 1000)
					if (!tasks) {
						$('.modal__content--none-tasks').fadeIn(10)
					}
				})
			}
		}

		/*
			enabel task edit mode
			========================================================================= */
		function enableTaskEditMode(btn) {
			$(btn).parent().parent().addClass('edit-mode') // tasks container
			$('.user-tasks__task').removeClass('edit')
			$(btn).parent().addClass('edit')
			$(btn).attr({
				title: 'Cancel',
				'data-task-action': 'cancel'
			})
			$(btn).attr('class', $(btn).attr('class').replace('fa-cog', 'fa-times-circle'))
			$(btn).next().next().attr('class', $(btn).next().next().attr('class').replace('fa-trash-alt', 'fa-save'))
			$(btn).next().next().attr({
				title: 'Save changes',
				'data-task-action': 'save-changes'
			})
			$(btn).next().removeAttr('readonly')
			$(btn).next().focus()
		}


		/*
			disable task edit mode
			========================================================================= */
		function disableTaskEditMode(btn) {
			$(btn).parent().parent().removeClass('edit-mode') // tasks container
			$('.user-tasks__task').removeClass('edit')
			$(btn).attr({
				title: 'Edit',
				'data-task-action': 'edit'
			})
			$(btn).attr('class', $(btn).attr('class').replace('fa-times-circle', 'fa-cog'))
			$(btn).next().next().attr('class', $(btn).next().next().attr('class').replace('fa-save', 'fa-trash-alt'))
			$(btn).next().next().attr({
				title: 'Delete',
				'data-task-action': 'delete'
			})
			$(btn).next().removeClass('invalid')
			$(btn).next().val($(btn).next().val().replace(/[^a-zA-Z0-9@#\s]/g, ''))
			$(btn).next().attr('readonly', 'true')
		}

		/*
			tasks container - related events
			========================================================================= */
		$('#user-tasks').on('click', function(e) {
			if (e.target.nodeName === "BUTTON") {
				let btn = e.target
				if ($(btn).attr('data-task-action') === "delete") {
					let removeTask = confirm("Delete task : " + $(btn).prev().val())
					if (removeTask) {
						deleteTaskRequest($(btn).attr('data-task-id'), btn)
					}
				} else if ($(btn).attr('data-task-action') === "edit") {
					enableTaskEditMode(btn)
				} else if ($(btn).attr('data-task-action') === "cancel") {
					disableTaskEditMode(btn)
				} else {
					updateTaskRequest({
						_id: $(btn).attr('data-task-id'),
						description: $(btn).prev().val()
					}, btn)
				}
			}

		})

	} // end dashboard related if

})
