function check(event) {
	// Get Values
	// var matric  = document.getElementById('matric' ).value;
	// var name    = document.getElementById('name'   ).value;
	// var faculty = document.getElementById('faculty').value;
	var name  = document.getElementById('name' ).value;
	var username  = document.getElementById('username' ).value;
	var password  = document.getElementById('password' ).value;
	var nric  = document.getElementById('nric' ).value;
	var phoneNumber  = document.getElementById('phoneNumber').value;

	// Simple Check
	if(matric.length != 9) {
		alert("Invalid matric number");
		event.preventDefault();
		event.stopPropagation();
		return false;
	}
	if(name.length == 0) {
		alert("Invalid name");
		event.preventDefault();
		event.stopPropagation();
		return false;
	}
	if(faculty.length != 3) {
		alert("Invalid faculty code");
		event.preventDefault();
		event.stopPropagation();
		return false;
	}
}