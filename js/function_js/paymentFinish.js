$(document).ready(() => {

	// Get value from query
	getQueryValue = () => {
    let arrQuery = [], hash;
    let hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
    for(let i = 0; i < hashes.length; i++)
    {
      hash = hashes[i].split('=');
      arrQuery.push(hash[0]);
      arrQuery[hash[0]] = hash[1];
    }
    // Return object query, but have to called per key. ex: getQueryValue().name
    return arrQuery;
	}

	// Populate transaction details
	populateTransactionDetails = () => {
		// Populate order id
		$('#orderId').html(`<b>${decodeURIComponent(getQueryValue().order_id)}</b>`)
		// Populate transaction status
		$('#transactionStatus').html(`<b>${decodeURIComponent(getQueryValue().transaction_status).toUpperCase()}</b>`)
	}


	// On load
	populateTransactionDetails()

})