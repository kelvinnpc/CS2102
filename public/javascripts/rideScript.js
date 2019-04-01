function check(event) {
	// Get Values
	var source  = document.getElementById('source' ).value;
	var destination  = document.getElementById('destination' ).value;
	var date  = document.getElementById('date' ).value;
	var time  = document.getElementById('time' ).value;

	// Simple Check
	if(source.length == 0) {
		alert("Invalid source");
		event.preventDefault();
		event.stopPropagation();
		return false;
	}
	if(destination.length == 0) {
		alert("Invalid destination");
		event.preventDefault();
		event.stopPropagation();
		return false;
	}
	if(date.length == 0) {
		alert("Invalid date");
		event.preventDefault();
		event.stopPropagation();
		return false;
	}
	if(time.length == 0) {
		alert("Invalid time");
		event.preventDefault();
		event.stopPropagation();
		return false;
	}
}