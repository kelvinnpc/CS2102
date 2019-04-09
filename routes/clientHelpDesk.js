var express = require('express');
var router = express.Router();

const { Pool } = require('pg')
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'postgres',
  password: '********',
  port: 5432,
})

/* SQL Query */
var insert_query = 'INSERT INTO accessHelpDesk VALUES ($1,$2)';
var isDriver_query = 'SELECT count(did) as count from Drivers where $1 in (select did from drivers)';

// GET
router.get('/', function(req, res, next) {
	pool.query(isDriver_query, [req.user.nric], (err3, data0) => {
		if (data0.rows[0].count == 0)
			basic(req,res,'clientHelpDesk', {title: 'Help & Support',driver: false});
		else
			basic(req,res,'clientHelpDesk', {title: 'Help & Support',driver: true});
	});
});

// POST
router.post('/', function(req, res, next) {
	pool.query(insert_query, [req.user.nric,req.body.message],(err, data) => {
		if (err)
			res.redirect("/clientHelpDesk?add=fail")
		else
			res.redirect("/clientHelpDesk?add=success")
	});
});


function basic(req, res, page, other) {
	var info = {
		page: page,
		user: req.user.username,
		name: req.user.name,
		nric : req.user.nric,
		status   : req.user.phonenumber,
	};
	if(other) {
		for(var fld in other) {
			info[fld] = other[fld];
		}
	}
	res.render(page, info);
}


module.exports = router;
