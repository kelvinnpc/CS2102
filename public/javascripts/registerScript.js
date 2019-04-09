function check(event) {
	// Get Values
	// var matric  = document.getElementById('matric' ).value;
	// var name    = document.getElementById('name'   ).value;
	// var faculty = document.getElementById('faculty').value;
	var name  = document.getElementById('name' ).value;
	var username  = document.getElementById('username' ).value;
	var password  = document.getElementById('password' ).value;
	var nric  = document.getElementById('nric' ).value;
	var phonenumber  = document.getElementById('phonenumber').value;
	var address = document.getElementById('address').value;

	// Simple Check
	if(name.length == 0) {
		alert("Invalid name");
		event.preventDefault();
		event.stopPropagation();
		return false;
	}
	if(username.length == 0) {
		alert("Invalid username");
		event.preventDefault();
		event.stopPropagation();
		return false;
	}
	if(password.length == 0) {
		alert("Invalid faculty code");
		event.preventDefault();
		event.stopPropagation();
		return false;
	}
	if(nric.length != 9) {
		alert("Invalid nric number");
		event.preventDefault();
		event.stopPropagation();
		return false;
	}
	if(phonenumber.length != 8) {
		alert("Invalid phone number");
		event.preventDefault();
		event.stopPropagation();
		return false;
	}
	if (address.length == 0) {
		alert("Invalid address");
		event.preventDefault();
		event.stopPropagation();
		return false;
	}
}