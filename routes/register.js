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
var checkValidUserName_query = 'SELECT count(nric) as count from Users where username=$1';
var checkValidNric_query = 'SELECT count(nric) as count from Users where nric=$1'
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
		if (err) {
			pool.query(checkValidUserName_query, [username], (err,checkValidUserName) => {
				if (checkValidUserName.rows[0].count==1)
					res.redirect('/register?register=fail/username_taken')
				else {
					pool.query(checkValidNric_query, [nric], (err,checkValidNric) => {
						if (checkValidNric.rows[0].count==1)
							res.redirect('/register?register=fail/NRIC_is_already_registered')
						else
							res.redirect('/register?register=fail')
					});
				}
			});
		}
		else
			res.redirect('/login?register=success');
	});

	
});


module.exports = router;
