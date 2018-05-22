$(document).ready(() => {

	// Set last visited page to redirectPage localStorage
	localStorage.setItem('redirectPage', JSON.stringify({redirectPage: window.location.href}))

	// Login status in navbar
	loginStatusChange = () => {
		// Loading overlay start
		$.LoadingOverlay('show')
		// Empty previous data to avoid duplicate
		$('#loginStatus').empty()
		// Define localStorage for dataUser
		let dataUser = JSON.parse(localStorage.getItem('dataUser'))
		// Check if any user login
		if (dataUser) {
			// Append user first name
			$('#loginStatus').addClass('has-dropdown').append(`
				<i class="ti-user" style="max-height: 2px">&nbsp;</i>
        <a>Hello, ${dataUser.firstName}</a>
        <ul class="mega-menu">
					<li><a id="navBtnSignout" href="#" >LOG OUT</a></li><br>
					<li><a id="navBtnCheckTransaction" href="#">MY TRANSACTIONS</a></li>
        </ul>
			`)
			// Loading overlay stop
			$.LoadingOverlay('hide')
		} else {
			// Append login button
			$('#loginStatus').append(`
				<a id="navBtnLogin" type="button" class="btn btn-sm" href="page-login.html">
          LOGIN
        </a>
			`)
			// Loading overlay stop
			$.LoadingOverlay('hide')
		}
	}

	// Request transaction by transaction id on database (promise)
	requestTransactionById = (transactionId) => {
		return new Promise ((resolve, reject) => {
			// Define url get transaction by transaction id
			let urlGetTransactionByTransactionId = `https://featherworld.cloudxier.com/transactions/order_id/${transactionId}`
			// Get transaction from database
			axios({
				method: 'get',
				url: urlGetTransactionByTransactionId
			})
			.then((response) => {
				// Check if response.data.length > 0)
				if (response.data.length > 0) {
					// Define transaction object
					let transactionDetails = response.data[0]
					// Resolve result
					resolve(transactionDetails)
				} else {
					reject(err)
				}
			})
			.catch((err) => {
				// Reject error
				reject(err)
			})
		})
	}

	// Check transactions status
	checkTransactionsStatus = () => {
		// Add event listener on navBtnCheckTransaction
		$('#navBtnCheckTransaction').click((e) => {
			e.preventDefault()
			// Open swal to insert order id
			swal('Input Your Order ID', 'You can find your order ID on your mail box', 'info', {
				content: 'input',
				button: {
					text: 'Check',
					closeModal: false
				}
			})
			.then((value) => {
				if (value) {
					// Make sure value is uppercase
					let upperCaseValue = value.toUpperCase()
					// Request transaction details to database
					requestTransactionById(upperCaseValue)
					.then((transactionDetails) => {
						console.log(transactionDetails)
						// Set transactionHistory on localStorage
						localStorage.setItem('transactionHistory', JSON.stringify(transactionDetails))
						// Swal confirmation transaction id has been found
						swal('Success', 'Transaction ID found, wait while we redirect you', 'success')
						.then(() => {
							// Refresh the page (only for transaction histories page)
							window.location.replace('transaction-histories.html')
						})
					})
					.catch((err) => {
						// Handle error if transaction id not found
						swal('Error', 'Transaction ID not found', 'warning')
					})
				} else {
					swal.close()
				}
			})
		})
	}

	// Log out user
	firebaseSignOutUser = () => {
		// Add event listener on button sign out
		$('#navBtnSignout').click((e) => {
			console.log('masuk')
			e.preventDefault()
			// Sign out using firebase
			firebase.auth().signOut()
			.then(() => {
				// Clear data user from localStorage
				localStorage.removeItem('dataUser')
				// Signed out confirmation
				swal('Signed Out', 'You have been signed out', 'warning')
				.then(() => {
					// Refresh the page to refresh the state
					window.location.replace('')
				})
			})
		})
	}

	// Get data user by email from database (promise)
	findUserByEmail = (email) => {
		return new Promise  ((resolve, reject) => {
			const urlGetUserByEmail = `https://featherworld.cloudxier.com/users/email/${email}`
			// Get user by email from database
			axios({
				method: 'get',
				url: urlGetUserByEmail
			})
			.then((response) => {
				let dataUser = response.data[0]
				console.log(dataUser)
				// Resolve dataUser
				resolve(dataUser)
			})
		})
	}

	// Check login state
	checkIsLogin = () => {
		firebase.auth().onAuthStateChanged((user) => {
		  if (user) {
		  	console.log('masuk')
		  	// Define user
		  	let user = firebase.auth().currentUser
	    	// Get user by email request to database
	    	findUserByEmail(user.email)
	    	.then((dataUser) => {
	    		// Set dataUser to localStorage
	    		localStorage.setItem('dataUser', JSON.stringify(dataUser))
	    		// Re-call login status change
	    		loginStatusChange()
	    		// Re-call check transaction
	    		checkTransactionsStatus()
	    		firebaseSignOutUser()
	    	})
		  } else {
		  	loginStatusChange()
		  }
		})
	}

	// On load
	checkIsLogin()
})