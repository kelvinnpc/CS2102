var express = require('express');
var router = express.Router();
const { Pool } = require('pg');

const pool = new Pool({
	connectionString: process.env.DATABASE_URL
});


/* SQL Query */
var insertHelpDesk_query = 'INSERT INTO accessHelpDesk VALUES ($1,$2)';
var isDriver_query = 'SELECT count(did) as count from Drivers where $1 = did';

// GET
router.get('/', function(req, res, next) {
	pool.query(isDriver_query, [req.user.nric], (err3, driverCheck) => {
		if (req.query.drivermode==='true')
			basic(req,res,'clientHelpDesk', {title: 'Help & Support',driver: false, drivermode: true});
		else if (driverCheck.rows[0].count == 0)
			basic(req,res,'clientHelpDesk', {title: 'Help & Support',driver: false, drivermode: false});
		else
			basic(req,res,'clientHelpDesk', {title: 'Help & Support',driver: true, drivermode: false});
	});
});

// POST
router.post('/', function(req, res, next) {
	pool.query(insertHelpDesk_query, [req.user.nric,req.body.message],(err, data) => {
		if (err) {
			if (req.query.drivermode==='true')
				res.redirect('/clientHelpDesk?add=fail&drivermode=true')
			else
				res.redirect('/clientHelpDesk?add=fail')
		}
		else {
			if (req.query.drivermode==='true')
				res.redirect('/clientHelpDesk?add=success&drivermode=true')
			else
				res.redirect('/clientHelpDesk?add=success')
		}

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
