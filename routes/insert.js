var express = require('express');
var router = express.Router();

const { Pool } = require('pg')
// const pool = new Pool({
//   user: 'postgres',
//   host: 'localhost',
//   database: 'postgres',
//   password: '********',
//   port: 5432,
// })
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
	//var matric  = req.body.matric;
	//var name    = req.body.name;
	//var faculty = req.body.faculty;
	var name = req.body.name;
	var username = req.body.username;
	var password = req.body.password;
	var nric = req.body.nric;
	var phoneNumber = req.body.phoneNumber;
	
	// Construct Specific SQL Query
	var insert_query = sql_query + "('" 
						+ name + "','" 
						+ username + "','" 
						+ password + "','"
						+ nric + "','" 
						+ phoneNumber
						+ "'')";
	
	pool.query(insert_query, (err, data) => {
		res.redirect('/select')
	});
});

module.exports = router;
