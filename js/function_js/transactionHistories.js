$(document).ready(() => {

	// Define transaction histories based on localHost
	let transactionHistory = JSON.parse(localStorage.getItem('transactionHistory'))

	// Parse address code id into string format (rajaongkir API format)
	parseAddressCode = (provinceId, cityId, subdistrictId) => {
		// Loading overlay start
		$.LoadingOverlay('show')
		return new Promise ((resolve, reject) => {
			// Define parsedProvinceId
			let parsedProvinceId = ''
			// Define parsedCityId
			let parsedCityId = ''
			// Define parsedSubdistrictId
			let parsedSubdistrictId = ''
			// Define url get province
			let urlGetProvince = 'https://featherworld.cloudxier.com/shipping/province'
			// Get province
			axios({
				method: 'get',
				url: urlGetProvince
			})
			.then((responseProvinceRequest) => {
				// Define province
				let province = responseProvinceRequest.data.rajaongkir.results
				// Iterate province data
				province.forEach((dataProvince) => {
					// Check with provinceId, if found then put it into parsedProvinceId
					if (dataProvince.provinece_id === provinceId) {
						// Assign province name into parsed variable
						parsedProvinceId = dataProvince.province
					}
				})
				// Define url get city by province id
				let urlGetCityByProvinceId = `https://featherworld.cloudxier.com/shipping/city/${provinceId}`
				// Get city
				axios({
					method: 'get',
					url: urlGetCityByProvinceId
				})
				.then((responseCityRequest) => {
					// Define cities
					let cities = responseCityRequest.data.rajaongkir.results
					// Iterate cities data
					cities.forEach((dataCities) => {
						// Check with cityId, if found then put it into parsedCityId
						if (dataCities.city_id === cityId) {
							// Assign city name into parsed variable
							parsedCityId = dataCities.city_name
						}
					})
					// Define url get subdistrict by city id
					let urlGetSubdistrictByCityId = `https://featherworld.cloudxier.com/shipping/subdistrict/${cityId}`
					// Get subdistricts
					axios({
						method: 'get',
						url: urlGetSubdistrictByCityId
					})
					.then((responseSubdistrictRequest) => {
						// Define subdistricts
						let subdistricts = responseSubdistrictRequest.data.rajaongkir.results
						// Iterate subdistricts data
						subdistricts.forEach((dataSubdistricts) => {
							// Check with subdistrictId, if found then put it into parsedSubdistrictId
							if (dataSubdistricts.subdistrict_id === subdistrictId) {
								// Assign subdistrict name into parsed variable
								parsedSubdistrictId = dataSubdistricts.subdistrict_name
							}
						})
						// Loading overlay stop
						$.LoadingOverlay('hide')
						// Resolve all results
						resolve({
							provinceName: parsedProvinceId,
							cityName: parsedCityId,
							subdistrictName: parsedSubdistrictId
						})
					})
				})
			})
		})
	}

	// Populate transaction details
	populateTransactionHistory = () => {
		// Loading overlay start
		$.LoadingOverlay('show')
		// Define province id
		let province = transactionHistory.deliveryAddress.province
		// Define city id
		let city = transactionHistory.deliveryAddress.city
		// Define subdistricy id
		let subdistrict = transactionHistory.deliveryAddress.subdistrict
		// Parse address code into string function
		parseAddressCode(province, city, subdistrict)
		.then((parsedAddressObject) => {
			// Define parsed province
			let parsedProvinceId = parsedAddressObject.provinceName
			// Define parsed city
			let parsedCityId = parsedAddressObject.cityName
			// Define parsed subdistrict
			let parsedSubdistrictId = parsedAddressObject.subdistrictName
			console.log(transactionHistory)
			// Populate transaction ID content
			$('#transactionIdContent').append(`
				<p>
					Your Transaction ID: <b>${transactionHistory.transactionId}</b>
				</p>
			`)
			// Populate transaction status content
			$('#transactionStatusContent').append(`
				<p>
					Your Transaction Status: <b>${transactionHistory.status}</b>
				</p>
			`)
			// Populate transaction address details
			$('#transactionAddressContent').append(`
				<p style="margin-top: 0; margin-bottom: 0; padding-top: 0; padding-bottom: 0"><b>Receiver Name: <span>${transactionHistory.customer.firstName} ${transactionHistory.customer.middleName} ${transactionHistory.customer.lastName}</span></b></p>
				<p style="margin-top: 0; margin-bottom: 0; padding-top: 0; padding-bottom: 0"><b>Receiver Phone Number: <span>${transactionHistory.customer.phoneNumber}</span></b></p>
				<p style="margin-top: 0; margin-bottom: 0; padding-top: 0; padding-bottom: 0"><b>City: <span>${parsedCityId.toUpperCase()}</span></b></p>
				<p style="margin-top: 0; margin-bottom: 0; padding-top: 0; padding-bottom: 0"><b>Subdistrict: <span>${parsedSubdistrictId.toUpperCase()}</span></b></p>
				<p style="margin-top: 0; margin-bottom: 0; padding-top: 0; padding-bottom: 0"><b>Street / Apt / Suites: <span>${transactionHistory.deliveryAddress.street.toUpperCase()}</span></b></p>
				<p style="margin-top: 0; margin-bottom: 0; padding-top: 0; padding-bottom: 0"><b>Transaction Date: <span>${new Date(transactionHistory.createdAt)}</span></b></p>
			`)
			// Populate transaction overview content
			transactionHistory.products.forEach((dataProducts) => {
				// Define product discount price, if not available then define product original price
				let productPrice = dataProducts.productId.productDiscountPrice || dataProducts.productId.productPrice
				// Populate the table
				$('#productTable').append(`
					<tr>
				    <td>
				      <span>${dataProducts.productId.productName}</span>
				    </td>
				    <td>
				      <span>${dataProducts.buyingQty}</span>
				    </td>
				    <td>
				      <span>${'IDR' + ' ' + productPrice.toFixed(2).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,")}</span>
				    </td>
					</tr>
				`)
				// Populate total transaction amount
				$('#totalTransactionAmount').text('IDR' + ' ' + transactionHistory.totalAmmount.toFixed(2).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,"))
			})
			// Loading overlay stop
			$.LoadingOverlay('hide')
		})
	}

	// Request transaction by transaction id on database (promise)
	requestTransactionByIdHistoriesPage = (transactionId) => {
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
	checkTransactionsStatusHistoriesPage = () => {
		// Add event listener on navBtnCheckTransaction
		$('#btnCheckOtherTransaction').click((e) => {
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
					// Make sure value is all uppercase
					let upperCaseValue = value.toUpperCase()
					// Request transaction details to database
					requestTransactionByIdHistoriesPage(upperCaseValue)
					.then((transactionDetails) => {
						// Set transactionHistory on localStorage
						localStorage.setItem('transactionHistory', JSON.stringify(transactionDetails))
						// Swal confirmation transaction id has been found
						swal('Success', 'Transaction ID found, wait while we redirect you', 'success')
						.then(() => {
							// Refresh the page (only for transaction histories page)
							window.location.replace('')
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

	// On load
	populateTransactionHistory()
	checkTransactionsStatusHistoriesPage()
})