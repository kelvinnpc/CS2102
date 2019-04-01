/* --- Global Variables --- */
var rideID = 0;

var express = require('express');
var router = express.Router();

const { Pool } = require('pg')

const pool = new Pool({
	connectionString: process.env.DATABASE_URL
});


/* SQL Query */
var sql_query = 'INSERT INTO Rides VALUES';

router.get('/', function(req, res, next) {
	console.log(rideID);
	res.render('driver', { title: 'Adding Ride' });
});

// POST
router.post('/', function(req, res, next) {
	// Retrieve Information
	var source = req.body.source;
	var destination = req.body.destination;
	var date = req.body.date;
	var time = req.body.time;
	var status = "INCOMPLETE";
	

	// Construct Specific SQL Query
	var insert_query = sql_query + "('" 
						+ rideID + "','" 
						+ "S0000006F" + "','" 
						+ source + "','"
						+ destination + "','" 
						+ date + "','"
						+ time + "','"
						+ status
						+ "')";
	console.log(insert_query);
	
	pool.query(insert_query, (err, data) => {
		res.redirect('/driverhistory')
	});
});

module.exports = router;