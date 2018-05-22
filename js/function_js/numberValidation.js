$(document).ready(() => {
	
	// QTY input -  product-detail.html
	//called when key is pressed in textbox
  $("#qtyInput").keypress(function (e) {
     //if the letter is not digit then display error and don't type anything
     if (e.which != 8 && e.which != 0 && (e.which < 48 || e.which > 57)) {
	      //display error message
	      $("#errMsgQtyInput").html("Digits Only").show().fadeOut("slow");
	       	return false;
   		}
   });
})