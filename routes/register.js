var express = require('express');
var router = express.Router();
const bcrypt = require('bcrypt');

const { Pool } = require('pg')
const pool = new Pool({
	connectionString: process.env.DATABASE_URL
});

const round = 10;
const salt  = bcrypt.genSaltSync(round);

/* SQL Query */
var insertUser_query = 'INSERT INTO Users VALUES ($1, $2, $3, $4, $5, $6)';

// GET
router.get('/', function(req, res, next) {
	res.render('register', { title: 'Modifying Database' });
});

// POST
router.post('/', function(req, res, next) {
	// Retrieve Information
	var name = req.body.name;
	var username = req.body.username;
	var password  = bcrypt.hashSync(req.body.password, salt);
	var nric = req.body.nric;
	var phonenumber = req.body.phonenumber;
	var address = req.body.address;

	
	pool.query(insertUser_query, [name, username, password, nric, phonenumber, address], (err, data) => {
		if (err)
			res.redirect('/register?add=fail');
		else
			res.redirect('/login');
	});

	
});


module.exports = router;
