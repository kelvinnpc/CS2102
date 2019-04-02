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
var sql_query = 'INSERT INTO Users VALUES ($1, $2, $3, $4, $5, $6)';
var insert_query = 'INSERT INTO Passengers VALUES ($1)';

// GET
router.get('/', function(req, res, next) {
	res.render('insert', { title: 'Modifying Database' });
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
	
	// Construct Specific SQL Query
	// var insert_query = sql_query + "('" 
	// 					+ name + "','" 
	// 					+ username + "','" 
	// 					+ password + "','"
	// 					+ nric + "','" 
	// 					+ phonenumber + "','"
	// 					+ address
	// 					+ "')";
	
	pool.query(sql_query, [name, username, password, nric, phonenumber, address], (err, data) => {
		pool.query(insert_query, [nric], (err, data) => {
			res.redirect('/')
		});
	});

	
});


// function reg_user(req, res, next) {
// 	var username  = req.body.username;
// 	var password  = bcrypt.hashSync(req.body.password, salt);
// 	var firstname = req.body.firstname;
// 	var lastname  = req.body.lastname;
// 	pool.query(sql_query.query.add_user, [username,password,firstname,lastname], (err, data) => {
// 		if(err) {
// 			console.error("Error in adding user", err);
// 			res.redirect('/register?reg=fail');
// 		} else {
// 			req.login({
// 				username    : username,
// 				passwordHash: password,
// 				firstname   : firstname,
// 				lastname    : lastname,
// 				status      : 'Bronze'
// 			}, function(err) {
// 				if(err) {
// 					return res.redirect('/register?reg=fail');
// 				} else {
// 					return res.redirect('/dashboard');
// 				}
// 			});
// 		}
// 	});
// }

module.exports = router;
