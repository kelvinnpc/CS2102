var express = require('express');
var router = express.Router();

const { Pool } = require('pg')

const pool = new Pool({
	connectionString: process.env.DATABASE_URL
});

/* SQL Query */
var sql_query = 'INSERT INTO Users VALUES';

// GET
router.get('/', function(req, res, next) {
	res.render('insert', { title: 'Modifying Database' });
});

// POST
router.post('/', function(req, res, next) {
	// Retrieve Information
	var name = req.body.name;
	var username = req.body.username;
	var password = req.body.password;
	var nric = req.body.nric;
	var phonenumber = req.body.phonenumber;
	var address = req.body.address;
	
	// Construct Specific SQL Query
	var insert_query = sql_query + "('" 
						+ name + "','" 
						+ username + "','" 
						+ password + "','"
						+ nric + "','" 
						+ phonenumber + "','"
						+ address
						+ "')";
	
	pool.query(insert_query, (err, data) => {
		res.redirect('/select')
	});
});

module.exports = router;
