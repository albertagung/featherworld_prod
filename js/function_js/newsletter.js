$(document).ready(() => {

	// Get data subscriber from client
	getDataSubscriber = () => {
		// Define mailchimp object
		let mailchimpObj = {
			email_address: $('#newsletterEmail').val(),
			status: 'subscribed'
		}
		// return the object
		return mailchimpObj
	}

	// Send data to mailchimp
	sendDataToMailchimp = () => {
		// Loading overlay start
		$.LoadingOverlay('show')
		return new Promise ((resolve, reject) => {
			// Define url mailchimp
			const urlMailchimpNewSubscribe = 'https://featherworld.cloudxier.com/mailchimp/subscribe'
			// Send with axios
			axios({
				method: 'post',
				url: urlMailchimpNewSubscribe,
				data: getDataSubscriber()
			})
			.then((response) => {
				// Loading overlay stop
				$.LoadingOverlay('hide')
				resolve(response.data)
			})
			.catch((err) => {
				// Loading overlay stop
				$.LoadingOverlay('hide')
				reject(err.response)
			})
		})
	}

	// Send email new subscriber with nodemailer (to admin and subscriber)
	sendEmailNewSubscriber = () => {
		// Loading overlay start
		$.LoadingOverlay('show')
		return new Promise ((resolve, reject) => {
			// Define url email new subscriber to admin
			const urlEmailSubscriberAdmin = 'https://featherworld.cloudxier.com/email/adminNewSubscriber'
			// Define url email new subscriber to customer
			const urlEmailSubscriberCustomer = 'https://featherworld.cloudxier.com/email/newNewsletter'
			// Axios send to admin
			axios({
				method: 'post',
				url: urlEmailSubscriberAdmin,
				data: {
					emailSenderName: 'Feather World Team',
					emailText: 'New subscriber',
					subscriberEmail: getDataSubscriber().email_address,
					subscriberFirstName: 'Customer', // Hardcoded because there are no name fields
					subscriberLastName: 'Featherworld' // Hardcoded because there are no name fields
				}
			})
			.then((responseAdmin) => {
				// Axios send to customer
				axios({
					method: 'post',
					url: urlEmailSubscriberCustomer,
					data: {
						emailSenderName: 'Feather World Team',
						subscriberEmail: getDataSubscriber().email_address,
						subscriberFirstName: 'Customer', // Hardcoded because there are no name fields
						subscriberLastName: 'Featherworld', // Hardcoded because there are no name fields
						emailPicture: 'https://storage.googleapis.com/image_props_featherworld/cloudxier-featherworld-mainbanner.png', // Hardcode, change when needed
						emailText: 'Thanks for subscribing us!',
						shopNowButtonLink: 'https://featherworld-dev.clouxier.com/product-page.html' // Hardcode, change when needed
					}
				})
				.then((responseCustomer) => {
					// Loading overlay stop
					$.LoadingOverlay('hide')
					// Resolve data
					resolve(responseCustomer)
				})
				.catch((errCustomer) => {
					// Loading overlay stop
					$.LoadingOverlay('hide')
					console.log(errCustomer)
					reject(errCustomer)
				})
			})
			.catch((errAdmin) => {
				// Loading overlay stop
				$.LoadingOverlay('hide')
				console.log(errAdmin)
				reject(errAdmin)
			})
		})
	}

	// On click button submit subscribe
	$('#btnNewsletterSubscribe').click((e) => {
		e.preventDefault()
		// Check validity
		if ($('#newsletterForm')[0].checkValidity()) {
			// Send data to mailchimp function
			sendDataToMailchimp().then(() => {
				// Send new subscriber confirmation email function
				sendEmailNewSubscriber().then((responseEmail) => {
					console.log(responseEmail)
					// Swal success confirmation
					swal('Success', 'Thank you for subscribing us!', 'success')
					.then(() => {
						// Reload page
						window.location.replace('')
					})
				})
				.catch((errNodemailer) => {
					console.log(errNodemailer, 'errNodemailer')
				})
			})
			.catch((errMailchimp) => {
				// Swal error mailchimp based on status
				swal('Error', errMailchimp.data, 'error')
			})
		} else {
			// Swal empty fields confirmation
			swal('Alert', 'Please fill all the fields!', 'warning')
		}
	})

})