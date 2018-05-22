$(document).ready(() => {

	// Loading overlay start
	$.LoadingOverlay('show')

	// Check if login state if true, then should be redirect to index page
	// (on load function)
	checkLoginState = () => {
		firebase.auth().onAuthStateChanged((user) => {
			if (user) {
				// Loading overlay stop
				$.LoadingOverlay('hide')
				swal('Alert', 'You have logged in', 'warning')
				.then(() => {
					window.location.replace('index.html')
				})
			}
		})
	}

	// Check form to be not null (called in signInUser function)
	checkFormNotNull = () => {
		let loginForm = $('#loginForm')[0]
		if (loginForm.checkValidity()) {
			return true
		} else {
			swal('Warning', 'Please fill all the fields!', 'warning')
			return false
		}
	}

	// Sign in with firebase (called in signInUser)
	firebaseSignIn = (email, password) => {
		firebase.auth().signInWithEmailAndPassword(email, password)
		.then(() => {
			// Swall alert
			swal('Success', 'Thanks for signing in!', 'success')
			.then(() => {
				// Redirect page to wherever
				window.location.replace('index.html')
			})
		})
		.catch((err) => {
			// Catch if error (username or password wrong)
			if (err.code === 'auth/invalid-email') {
				swal('Error', 'Wrong email or password', 'error')
			}
		})
	}

	// Sign in function (called in button submit on click)
	signInUser = () => {
		// Call not null validator
		if (checkFormNotNull()) {
			// If pass
			// Get user data
			let email = $('#emailInput').val()
			let password = $('#passwordInput').val()
			// Call sign in to firebase function
			firebaseSignIn(email, password)
		}
	}

	// Reset password from firebase (called in resetPassword function)
	firebaseResetPassword = (email) => {
		// Loading overlay start
		$.LoadingOverlay('show')
		firebase.auth().sendPasswordResetEmail(email)
		.then(() => {
			// Loading overlay stop
			$.LoadingOverlay('hide')
			swal('Success', 'Please check your inbox for password reset link', 'success')
			.then(() => {
				// Redirect to index page
				window.location.replace('index.html')
			})
		})
		.catch((err) => {
			// Loading overlay stop
			$.LoadingOverlay('hide')
			if (err.code === 'auth/invalid-email') {
				swal('Error', 'Your email does not exist!', 'error')
			}
		})
	}

	// Reset password function (called in on load function)
	resetPassword = () => {
		// Add event listener on click btn reset password
		$('#btnResetPassword').click((e) => {
			e.preventDefault()
			// Pop up swal
			swal({
				icon: 'info',
				title: 'Reset Password',
				text: 'Enter email address to send your password reset link.',
				content: 'input',
				button: {
					text: 'Send email',
					closeModal: true
				}
			})
			.then((email) => {
				if (email === '') {
					// If null validator
					return swal('Error', 'Please input your email', 'error')
				} else if (!email) {
					// If modal close
					return null
				} else {
					// Call firebase reset password function
					return firebaseResetPassword(email)
				}
			})
		})
	}

	// On load function
	// checkLoginState()
	resetPassword()


	// On event button submit click
	$('#btnSubmit').click((e) => {
		e.preventDefault()
		// Call the sign in function
		signInUser()
		// Loading overlay stop
		$.LoadingOverlay('hide')
	})

	// Loading overlay stop
	$.LoadingOverlay('hide')

})