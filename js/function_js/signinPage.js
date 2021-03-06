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
		// Loading overlay start
		$.LoadingOverlay('show')
		firebase.auth().signInWithEmailAndPassword(email, password)
		.then(() => {
			// Loading overlay stop
			$.LoadingOverlay('hide')
			// Swall alert
			swal('Success', 'Thanks for signing in!', 'success')
			.then(() => {
				// Check if there is any redirect page needed
				let redirectPage = JSON.parse(localStorage.getItem('redirectPage'))
				if (redirectPage) {
					// Redirect page as requested
					window.top.location.replace(redirectPage.redirectPage)
				} else {
					// Redirect page to products
					window.top.location.replace('product-page.html')
				}
			})
		})
		.catch((err) => {
			// Loading overlay stop
			$.LoadingOverlay('hide')
			console.log('err', err)
			// Catch if error (username or password wrong)
			if (err.code === 'auth/invalid-email') {
				swal('Error', 'Wrong email', 'error')
			} else if (err.code === 'auth/wrong-password') {
				swal('Error', 'Wrong password', 'error')
			} else if (err.code === 'auth/user-not-found') {
				swal('Error', 'User not found', 'error')
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
				window.top.location.replace('index.html')
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
	checkLoginState()
	resetPassword()


	// On event button submit click
	$('#btnSubmit').click((e) => {
		console.log('apa')
		e.preventDefault()
		// Call the sign in function
		signInUser()
		// Loading overlay stop
		$.LoadingOverlay('hide')
	})

	// Loading overlay stop
	$.LoadingOverlay('hide')

})