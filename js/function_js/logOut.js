$(document).ready(() => {

	// When button log out pressed
	$('#btnLogOut').click( async (e) => {
		// Define localStorage user obj
		let applicantObj = JSON.parse(localStorage.getItem('dataUsers'))[0]
		await e.preventDefault()
		// Clear the local storage
		await localStorage.clear()
		// Define update login state url
		const urlRemoveLoginState = `https://server.mmsustainability.ac.id/loginState/remove/${applicantObj.email}`
		// Delete loginState
		axios.delete(urlRemoveLoginState).then(() => {
			window.location.replace('page-login.html')
		})
	})

})