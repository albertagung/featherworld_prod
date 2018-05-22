$(document).ready(() => {

	// Define auth url
	const authUrl = 'https://featherworld.cloudxier.com/auth'

	// Get email and pass for login
	getCredentials = () => {
		let email = $('#emailField').val()
		let password = $('#passwordField').val()
		let credentials = {
			email: email,
			password: password
		}
		return credentials
	}

	// Log in
	$('#btnLogin').click((e) => {
		// Loading overlay start
		$('body').loading('start')
		e.preventDefault()
		// Send login data to server for auth
		axios.post(authUrl, getCredentials())
		.then((response) => {
			console.log(response.data)
			// If user === admin
			if (response.data === 'admin@admin.com') { // Will be changed with original admin email
				// Set user email to localStorage
				localStorage.setItem('userEmail', JSON.stringify({userEmail: response.data}))
				pageInitialCheck().then(() => {
					// Loading overlay stop
					$('body').loading('stop')
					window.location.replace('')
				})
			} else {
				// If user !== admin
				// Set user email to localStorage
				localStorage.setItem('userEmail', JSON.stringify({userEmail: response.data}))
				pageInitialCheck().then(() => {
					// Loading overlay stop
					$('body').loading('stop')
					window.location.replace('')
				})
			}
		})
		.catch((err) => {
			// Loading overlay stop
			$('body').loading('stop')
			$('.main-container .container').prepend(`
				<div 
					class="alert alert-danger" 
					role="alert" 
					style="background-color: red; color: white">
				  Incorrect Username or Password !
				</div>
			`)
		})
	})

	// Page check function to insert new login state
	pageInitialCheck = () => {
		return new Promise ((resolve, reject) => {
			// Get user email from localStorage
			const objUserEmail = JSON.parse(localStorage.getItem('userEmail'))
			console.log(objUserEmail)
			// Check if user has logged in or not
			if (objUserEmail) {
				// Check credentials
				let checkCredentialsUrl = 'https://featherworld.cloudxier.com/auth/check'
				axios.post(checkCredentialsUrl, objUserEmail)
				.then((response) => {
					console.log(response.data)
					// Set data user in local storage
					resolve(localStorage.setItem('dataUsers', JSON.stringify(response.data)))
				})
				.catch((err) => {
					reject(err)
				})
			}
		})
	}

})