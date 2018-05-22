$(document).ready(() => {

	// Loading overlay start
	$.LoadingOverlay('show')

	// Define url get shipping methods
	const urlGetShippingMethods = 'http://localhost:3000/shippingMethod'

	// Define url get province data
	const urlGetProvince = 'http://localhost:3000/shipping/province'

	// Define url get countries data
	const urlGetCountries = 'https://restcountries.eu/rest/v2/all?fields=name'

	// Define data user
	const dataUser = JSON.parse(localStorage.getItem('dataUser'))

	// Empty the localStorage for shipping courier
	localStorage.removeItem('shippingCourier')

	// Empty the localStorage for shipping servive
	localStorage.removeItem('shippingService')	

	// Populate data user to form input
	populateDataUser = () => {
		// Populate first name
		$('#firstNameInput').val(dataUser.firstName)
		// Populate middle name
		$('#middleNameInput').val(dataUser.middleName)
		// Populate last name
		$('#lastNameInput').val(dataUser.lastName)
		// Populate email
		$('#emailInput').val(dataUser.email)
		// Populate phone number
		$('#phoneNumberInput').val(dataUser.phoneNumber)
	}

	// Get random ID
	randomId = () => {
	  let text = "";
	  let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
	  for (var i = 0; i < 21; i++)
	    text += possible.charAt(Math.floor(Math.random() * possible.length));
	  return text;
	}

	// Populate countries
	populateCountries = () => {
		// Loading overlay start
		$.LoadingOverlay('show')
		axios({
			method: 'get',
			url: urlGetCountries
		})
		.then((response) => {
			let countries = response.data
			countries.forEach((dataCountries) => {
				// Append to countries options
				$('#countryInput').append(`
					<option value="${dataCountries.name}">${dataCountries.name}</option>
				`)
			})
			// Loading overlay stop
			$.LoadingOverlay('hide')
		})
	}

	// Populate provinces
	populateProvinces = () => {
		// Add event listener countries selection on change
		$('#countryInput').change(() => {
			// Loading overlay start
			$.LoadingOverlay('show')
			// Check if selected country === Indonesia
			if ($('#countryInput').val() === "Indonesia") {
				axios({
					method: 'get',
					url: urlGetProvince
				})
				.then((response) => {
					let provinces = response.data.rajaongkir.results
					// Append null selection first
					$('#provinceInput').append(`
						<option value="" selected>Select province</option>
					`)
					provinces.forEach((dataProvinces) => {
						// Append to province selection
						$('#provinceInput').append(`
							<option value="${dataProvinces.province_id}">${dataProvinces.province}</option>
						`)
					})
					// Loading overlay stop
					$.LoadingOverlay('hide')
				})
			} else {
				swal('Not available', 'Sorry our service only available in Indonesia for now', 'warning')
				.then(() => {
					// Append to province selection
					$('#countryInput').val('Indonesia')
					// Then populate the province
					axios({
						method: 'get',
						url: urlGetProvince
					})
					.then((response) => {
						let provinces = response.data.rajaongkir.results
						// Append null selection first
						$('#provinceInput').append(`
							<option value="" selected>Select province</option>
						`)
						provinces.forEach((dataProvinces) => {
							// Append to province selection
							$('#provinceInput').append(`
								<option value="${dataProvinces.province_id}">${dataProvinces.province}</option>
							`)
						})
						// Loading overlay stop
						$.LoadingOverlay('hide')
					})
				})
			}
		})
	}

	// Populate cities
	populateCities = () => {
		// Add event listener on province selection change
		$('#provinceInput').change(() => {
			// Loading overlay start
			$.LoadingOverlay('show')
			// Empty the previous data
			$('#cityInput').empty()
			// Define provinceId
			let provinceId = $('#provinceInput').val()
			// Define url get cities
			let urlGetCities = `http://localhost:3000/shipping/city/${provinceId}`
			axios({
				method: 'get',
				url: urlGetCities
			})
			.then((response) => {
				// Define cities
				let cities = response.data.rajaongkir.results
				// Append null selection first
				$('#cityInput').append(`
					<option value="" selected>Select city</option>
				`)
				cities.forEach((dataCities) => {
					// Append to cities selection
					$('#cityInput').append(`
						<option value="${dataCities.city_id}">${dataCities.city_name}</option>
					`)
				})
				// Loading overlay stop
				$.LoadingOverlay('hide')
			})
		})
	}

	// Populate subdsitrict
	populateSubdistrict =  () => {
		// Add event listener on city selection change
		$('#cityInput').change(() => {
			// Loading overlay start
			$.LoadingOverlay('show')
			// Empty the previous data
			$('#subdistrictInput').empty()
			// Define cityId
			let cityId = $('#cityInput').val()
			// Define url get subdistrict
			let urlGetSubdistrict = `http://localhost:3000/shipping/subdistrict/${cityId}`
			axios({
				method: 'get',
				url: urlGetSubdistrict
			})
			.then((response) => {
				// Define subdsitrict
				let subdistricts = response.data.rajaongkir.results
				// Append null selection first
				$('#subdistrictInput').append(`
					<option value="" selected>Select subdistrict</option>
				`)
				subdistricts.forEach((dataSubdistricts) => {
					// Append to subdistrict selection
					$('#subdistrictInput').append(`
						<option value="${dataSubdistricts.subdistrict_id}">${dataSubdistricts.subdistrict_name}</option>
					`)
				})
				// Loading overlay stop
				$.LoadingOverlay('hide')
			})
		})
	}

	// Populate shipping methods availability
	populateShippingMethods = () => {
		// Loading overlay start
		$.LoadingOverlay('show')
		// Empty previous data
		$('#shippingMethodInput').empty()
		// Define url get shipping methods (from global settings object)
		const urlGetGlobalSettings = 'http://localhost:3000/globalSetting'
		axios({
			method: 'get',
			url: urlGetGlobalSettings
		})
		.then((response) => {
			// Define shippingMethods 
			let shippingMethods = response.data[0].shippingMethods
			// Give default options
			$('#shippingMethodInput').append(`
				<option value="">Select shipping method</option>
			`)
			shippingMethods.forEach((availableShipping) => {
				// Append to shipping method input
				$('#shippingMethodInput').append(`
					<option value="${availableShipping.shippingCode}">${availableShipping.shippingName}</option>
				`)
			})
			// Loading overlay stop
			$.LoadingOverlay('hide')
		})
	}

	// Populate cart items
	populateCartItems = (cartArray, shippingCost) => {
		// Loading overlay start
		$.LoadingOverlay('show')
		// Make subtotal zero
		let subtotal = 0
		// Define orderTotal
		let orderTotal = 0
		// Iterate through cartArray
		cartArray.forEach((cartItems) => {
			subtotal += cartItems.cartProductPrice
		})
		// Populate cart subtotal
		$('#cartSubtotal').text('IDR' + ' ' + subtotal.toFixed(2).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,"))
		// Populate order total
		orderTotal = subtotal + shippingCost
		$('#cartOrderTotal').text('IDR' + ' ' + orderTotal.toFixed(2).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,"))
		// Set total cart price into localStorage
		localStorage.setItem('orderTotal', JSON.stringify(orderTotal))
		// Loading overlay stop
		$.LoadingOverlay('hide')
	}

	// Get product weight from localStorage (promise called in getShippingCost)
	getTotalProductWeight = () => {
		return new Promise ((resolve, reject) => {
			// Get cart array from localStorage
			let cartArray = JSON.parse(localStorage.getItem('cartArray'))
			// Define totalCartWeight
			let totalCartWeight = 0
			// Iterate cartArray
			cartArray.forEach((cartItems) => {
				// Calculate all product weight
				totalCartWeight += cartItems.cartProductWeight
				// Resolve the result
				console.log(totalCartWeight)
				resolve(totalCartWeight)
			})
		})
	}

	// Get shipping cost
	getShippingCost = () => {
		// Check if subdistrict / courier selection has been made
		// because if one of them is not been made, then the API
		// will return error
		let subdistrict = $('#subdistrictInput').val()
		let shippingMethodInput = $('#shippingMethodInput').val()
		if (subdistrict && shippingMethodInput) {
			// Loading overlay start
			$.LoadingOverlay('show')
			// Define url calculate cost
			const urlGetShippingCost = 'http://localhost:3000/shipping/cost'
			// Define url get shipping methods (from global settings object)
			const urlGetGlobalSettings = 'http://localhost:3000/globalSetting'
			// Get total product weight
			getTotalProductWeight().then((productWeight) => {
				// Get shipping origin from global settings
				axios({
					method: 'get',
					url: urlGetGlobalSettings
				})
				.then((response) => {
					// Define shipping origin
					let subdistrictOrigin = response.data[0].shippingOrigin.subdistrict
					// Send extra req.body
					let dataForShippingCalculation = {
						origin: subdistrictOrigin,
						originType: 'subdistrict',
						destination: $('#subdistrictInput').val(),
						destinationType: 'subdistrict',
						weight: productWeight,
						courier: $('#shippingMethodInput').val()
					}
					// Get shipping cost from database
					axios({
						method: 'post',
						url: urlGetShippingCost,
						data: dataForShippingCalculation
					})
					.then((response) => {
						// Define shipping name
						let shippingName = response.data.rajaongkir.results[0].name
						// Define shipping code
						let shippingCode = response.data.rajaongkir.results[0].code
						// Define shipping cost array
						let shippingCostArray = response.data.rajaongkir.results[0].costs
						// Empty previous shipping selection
						$('#cartShippingCost').empty()
						// Make a select html option
						$('#cartShippingCost').html(`
							<select id="costSelection" required></select>
						`)
						// Check if shipping method available
						if (shippingCostArray.length < 1) {
							// Handle empty response
							$('#costSelection').append(`
								<option 
									value="">
									Not Available - Please choose other shipping method
								</option>
							`)
							// Loading overlay stop
							$.LoadingOverlay('hide')
						} else {
							// Set initial empty value selection
							$('#costSelection').append(`
								<option value="">Select Courier Service</option>
							`)
							// Iterate through shipping cost array
							shippingCostArray.forEach((shippingCosts) => {
								// Change the cart shipping cost client side
								$('#costSelection').append(`
									<option 
										value="${shippingCosts.cost[0].value}">
											${shippingCosts.description} - <strong>${'IDR' + ' ' + shippingCosts.cost[0].value.toFixed(2).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,")}</strong>
									</option>
								`)
							})
							// Get shipping service value
							getShippingSeviceValue()
							// Loading overlay stop
							$.LoadingOverlay('hide')
						}
					})
				})
			})
		} else {
			// Empty previous shipping selection
			$('#cartShippingCost').empty()
			// Make a select html option
			$('#cartShippingCost').html(`
				<select id="costSelection" required></select>
			`)
			// If not then empty shipping calculation
			$('#costSelection').html(`
				<option value="">No shipping data</option>
			`)
			// Empty the localStorage for shipping courier
			localStorage.removeItem('shippingCourier')
			// Empty the localStorage for shipping servive
			localStorage.removeItem('shippingService')
			// Get shipping service value
			getShippingSeviceValue()
			// Loading overlay stop
			$.LoadingOverlay('hide')
		}
	}

	// Get shipping courier value
	getShippingCourierValue = () => {
		// Define shipping courier
		let shippingCourier = ''
		// Add event listener on shipping method input
		$('#shippingMethodInput').change((e) => {
			// Set shipping courier value
			shippingCourier = e.target.value.toUpperCase()
			// Set shipping courier to localStorage
			localStorage.setItem('shippingCourier', JSON.stringify(shippingCourier))
		})
	}

	// Get shipping service value
	getShippingSeviceValue = () => {
		// Define shipping service
		let shippingService = ''
		// Add event listener on cost selection input
		$('#costSelection').change((e) => {
			// Set shipping service value (raw data with /t/t spaces)
			let shippingServiceRaw = $('#costSelection').find(":selected").text()
			// Remove the spaces (/t/t)
			shippingService = shippingServiceRaw.replace(/[\n\t\r]/g,"")
			// Define shipping cost (make sure the value is integer)
			let shippingCost = parseInt(e.target.value)
			// Recall populate cart items array
			populateCartItems(cartArray, shippingCost)
			// Set shipping service to localStorage
			localStorage.setItem('shippingService', JSON.stringify(shippingService))
		})
	}

	// On change subdistrict OR shipping method value
	onChangeShippingValue = () => {
		$('#cityInput').change(() => {
			// Recalled populate shipping method to reset it's value
			populateShippingMethods()
			// Change shipping method input to be disabled
			$('#shippingMethodInput').attr('disabled', true)
			// Calculate shipping cost
			getShippingCost()
		})
		$('#countryInput').change(() => {
			// Recalled populate shipping method to reset it's value
			populateShippingMethods()
			// Change shipping method input to be disabled
			$('#shippingMethodInput').attr('disabled', true)
			// Calculate shipping cost
			getShippingCost()
		})
		$('#provinceInput').change(() => {
			// Recalled populate shipping method to reset it's value
			populateShippingMethods()
			// Change shipping method input to be disabled
			$('#shippingMethodInput').attr('disabled', true)
			// Calculate shipping cost
			getShippingCost()
		})
		$('#shippingMethodInput').change(() => {
			// Calculate shipping cost
			getShippingCost()
			// Get shipping cost value init
			getShippingCourierValue()
		})
		$('#subdistrictInput').change(() => {
			// Recalled populate shipping method to reset it's value
			populateShippingMethods()
			// Change shipping method input to be clickable
			$('#shippingMethodInput').attr('disabled', false)
			// Calculate shipping cost
			getShippingCost()
			// Get shipping cost value init
			getShippingCourierValue()
		})
	}

	// Get user form value (promise)
	getUserValue = (transactionId) => {
		return new Promise ((resolve, reject) => {
			// Define user delivery address object
			let newUserDeliveryAddress = {
				deliveryAddress: {
					street: $('#addressDetailsInput').val(),
					zipCode: $('#zipcodeInput').val(),
					city: $('#cityInput').val(),
					subdistrict: $('#subdistrictInput').val(),
					province: $('#provinceInput').val(),
					country: $('#countryInput').val()
				}
			}
			// Define user transaction histories object
			let newUserTransactionHistories = {
				transactionHistories: transactionId
			}
			// Send the data
			resolve(newUserDeliveryAddress, newUserTransactionHistories)
		})
	}

	// Calculate cart items (promise)
	calculateCartItems = () => {
		return new Promise ((resolve, reject) => {
			// Define cartArray
			let cartArray = JSON.parse(localStorage.getItem('cartArray'))
			// Define productsArray
			let productsArray = []
			// Iterate through cart array
			cartArray.forEach((cartItems) => {
				// Define object for each cart items
				let objCartItems = {
					productId: cartItems.cartProductId,
					buyingQty: cartItems.cartProductQty,
					variantOptions: cartItems.cartProductVariantOptions
				}
				// Push objCartItems to product array
				productsArray.push(objCartItems)
			})
			// Resolve promise
			resolve(productsArray)
		})
	}

	// Get transaction form value (promise)
	getTransactionValue = () => {
		return new Promise ((resolve, reject) => {
			// Calculate cart items value
			calculateCartItems().then((productsArray) => {
				// Get total cart ammount (make sure the value is integer)
				let totalAmmount = parseInt(JSON.parse(localStorage.getItem('orderTotal')))
				// Get shipping courier
				let shippingCourier = JSON.parse(localStorage.getItem('shippingCourier'))
				// Get shipping service
				let shippingService = JSON.parse(localStorage.getItem('shippingService'))
				// Define shippingData
				let shippingData = `${shippingCourier} - ${shippingService}`
				// Define transaction object
				let transaction = {
					transactionId: `FW${randomId()}`, // Generate manual transaction ID
					products: productsArray,
					customer: dataUser._id,
					createdAt: new Date(),
					updatedAt: new Date(),
					totalAmmount: totalAmmount,
					shippingMethod: shippingData,
					deliveryAddress: {
						street: $('#addressDetailsInput').val(),
						zipCode: $('#zipcodeInput').val(),
						city: $('#cityInput').val(),
						subdistrict: $('#subdistrictInput').val(),
						province: $('#provinceInput').val(),
						country: $('#countryInput').val()
					},
					shippingCost: parseInt($('#costSelection').val()),
					status: 'Waiting for payment'
				}
				// Resolve transaction
				resolve(transaction)
			})
		})
	}

	// Send transaction and user data to database (promise)
	sendTransactionToDatabase = () => {
		// Loading overlay start
		$.LoadingOverlay('show')
		return new Promise ((resolve, reject) => {
			// Define update user transaction histories by id url
			let urlUpdateUserTransactionHistories = `http://localhost:3000/users/edit/transaction/${dataUser._id}`
			// Insert new transaction (first order)
			let urlUpdateUserDeliveryAddress = `http://localhost:3000/users/edit/deliveryAddress/${dataUser._id}`
			// Define insert new transaction
			let urlPostNewTransaction = 'http://localhost:3000/transactions'
			// Define update user delivery address by id url
			getTransactionValue().then((dataTransaction) => {
				// Send data transaction into database
				axios({
					method: 'post',
					url: urlPostNewTransaction,
					data: dataTransaction
				})
				.then((responseTransaction) => {
					// Define transaction id
					let transactionId = responseTransaction.data._id
					// Define transaction delivery address
					let deliveryAddress = responseTransaction.data.deliveryAddress
					console.log(deliveryAddress)
					// Send data new user delivery address to database
					axios({
						method: 'post',
						url: urlUpdateUserDeliveryAddress,
						data: deliveryAddress
					})
					.then((responseDeliveryAddress) => {
						console.log('masuk')
						// Loading overlay stop
						$.LoadingOverlay('hide')
						// Resolve the transaction id to be used in payment processing page
						resolve(transactionId)
					})
					.catch((err) => {
						console.log(err)
					})
				})
				.catch((err) => {
					console.log(errß)
				})
			})
			.catch((err) => {
				console.log(err)
			})
		})
	}

	// Get array product qty from database (check qty value purpose)
	getArrayProductQty = (cartArray) => {
		return new Promise ((resolve, reject) => {
			// Define url get product by id
			let urlGetProductById = `http://localhost:3000/products`
			// Get product from database
			axios({
				method: 'get',
				url: urlGetProductById
			})
			.then((response) => {
				// Define arrProductQtyFromDatabase
				let arrProductQtyFromDatabase = []
				// Define dataProducts
				let dataProducts = response.data.data
				dataProducts.forEach((eachProducts) => {
					cartArray.forEach((eachCartItems) => {
						if (eachProducts._id === eachCartItems.cartProductId) {
							arrProductQtyFromDatabase.push({
								productQtyFromDb: eachProducts.productQty,
								productNameFromDb: eachProducts.productName,
								productIdFromDb: eachProducts._id
							})
						}
					})
				})
				resolve(arrProductQtyFromDatabase)
			})
			.catch((err) => {
				console.log(err)
			})
		})
	}

	// Check product stock before proceeding (check qty value purpose)
	compareProductStockFromDatabase = (cartArray) => {
		return new Promise ((resolve, reject) => {
			getArrayProductQty(cartArray).then((arrObjetCheckFromDb) => {
				// Define array check qty
				let arrCheckQty = []
				// Iterate through cartArray qty
				cartArray.forEach((cartItems) => {
					arrObjetCheckFromDb.forEach((dbItems) => {
						// Check only the same id
						if (cartItems.cartProductId === dbItems.productIdFromDb) {
							// Compare the qty value
							if (cartItems.cartProductQty <= dbItems.productQtyFromDb) {
								arrCheckQty.push({
									checkedId: dbItems.productIdFromDb,
									checkedName: dbItems.productNameFromDb,
									qtyFromDb: dbItems.productQtyFromDb,
									qtyFromCart: cartItems.cartProductQty,
									checkedValue: true
								})
							} else {
								arrCheckQty.push({
									checkedId: dbItems.productIdFromDb,
									checkedName: dbItems.productNameFromDb,
									qtyFromDb: dbItems.productQtyFromDb,
									qtyFromCart: cartItems.cartProductQty,
									checkedValue: false
								})
							}
						}
					})
				})
				resolve(arrCheckQty)
			})
		})
	}

	// Get 'false' value from qty checker
	getQtyCheckerResult = (cartArray) => {
		// Loading overlay start
		$.LoadingOverlay('show')
		return new Promise ((resolve, reject) => {
			compareProductStockFromDatabase(cartArray)
			.then((checkedArray) => {
				let arrCheckedResults = []
				checkedArray.forEach((checkedObj) => {
					if (!checkedObj.checkedValue) {
						arrCheckedResults.push({
							resultName: checkedObj.checkedName,
							resultAskingQty: checkedObj.qtyFromCart,
							resultSupplyQty: checkedObj.qtyFromDb
						})
					}
				})
				// Loading overlay stop
				$.LoadingOverlay('hide')
				resolve(arrCheckedResults)
			})
		})
	}

	// Serialize the object into query string
	serializeObjectIntoQuery = (obj) => {
		let str = [];
		for (let p in obj)
		  if (obj.hasOwnProperty(p)) {
		    str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
		  }
		return str.join("&");
	}

	// Send data with query params (promise)
	sendDataQuery = (cartArray, transactionId) => {
		// Loading overlay start
		$.LoadingOverlay('show')
		return new Promise ((resolve, reject) => {
			// Define data user
			let dataUser = JSON.parse(localStorage.getItem('dataUser'))
			// Define cart total
			let orderTotal = JSON.parse(localStorage.getItem('orderTotal'))
			// Make the object
			let queryObject = {
				userId: dataUser._id,
				firstName: `${dataUser.firstName} ${dataUser.middleName}`,
				lastName: dataUser.lastName,
				phoneNumber: dataUser.phoneNumber,
				email: dataUser.email,
				orderTotal: orderTotal,
				transactionId: transactionId,
				previousUrl: `http://${window.location.hostname}`
			}
			// Make the query
			let queryString = serializeObjectIntoQuery(queryObject)
			// Loading overlay stop
			$.LoadingOverlay('hide')
			// Resolve the query string
			resolve(queryString)
		})
	}

	// Empty cartArray, orderTotal, shippingCourier, shippingService
	emptyLocalStorage = () => {
		localStorage.removeItem('cartArray')
		localStorage.removeItem('orderTotal')
		localStorage.removeItem('shippingCourier')
		localStorage.removeItem('shippingService')
	} 

	// On load
	// Define cartArray from localStorage
	let cartArray = JSON.parse(localStorage.getItem('cartArray'))
	// Populate data user to form input
	populateDataUser()
	// Populate countries
	populateCountries()
	// Populate provinces
	populateProvinces()
	// Populate cities
	populateCities()
	// Populate subdistrict
	populateSubdistrict()
	// Populate shipping methods
	populateShippingMethods()
	// Get shipping cost data
	onChangeShippingValue()
	// Populate cart items (send 0 for init)
	populateCartItems(cartArray, 0)
	// Loading overlay stop
	$.LoadingOverlay('hide')

	// On click button proceed to payment
	$('#btnProceedToPayment').click((e) => {
		e.preventDefault()
		// Check form vallidity
		if ($('#formShippingDetais')[0].checkValidity()) {
			// Check stock from db
			getQtyCheckerResult(cartArray).then((outOfStock) => {
				if (outOfStock.length > 0) {
					outOfStock.forEach((checkingResults) => {
						swal('Out of Stock', 
							`This product: ${checkingResults.resultName} is out of stock, you requested: ${checkingResults.resultAskingQty} pcs , available QTY: ${checkingResults.resultSupplyQty} pcs, please reduce QTY or delete it from cart`, 
							'warning')
					})
				} else {
					// Send transaction to database
					sendTransactionToDatabase()
					.then((transactionId) => {
						// Send query string and then redirect page
						sendDataQuery(cartArray, transactionId)
						.then((queryString) => {
							// Empty localStorage function
							emptyLocalStorage()
							// Redirect page with new query string
							window.location.replace(`http://127.0.0.1:55445/?${queryString}`)
						})
					})
				}
			})
		} else {
			swal('Alert', 'Please fill all the fields', 'warning')
		}
	})

})