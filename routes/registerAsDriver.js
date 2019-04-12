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
var insertDriver_query = 'INSERT INTO Drivers(did) VALUES ($1)';
var insertCar_query = 'INSERT INTO Cars(did,platenumber,model,numSeats) VALUES ($1,$2,$3,$4)';
var checkValidPlateNum_query = 'SELECT count(platenumber) as count FROM Cars where platenumber=$1';

// GET
router.get('/', function(req, res, next) {
    basic(req,res,'registerAsDriver');
});

router.post('/', register);

function register(req,res,next) {
	console.log(req.body.bid);
	pool.query(checkValidPlateNum_query, [req.body.plateNumber], (err,checkValidPlateNum) => {
		if (checkValidPlateNum.rows[0].count==1)
			res.redirect('/registerAsDriver?register=fail/PlateNumber_is_registered')
		else {
			pool.query(insertDriver_query, [req.user.nric], (err, data) => {
				if (err)
					res.redirect('/registerAsDriver?register=fail')
				else {
					pool.query(insertCar_query, [req.user.nric, req.body.plateNumber, req.body.model, req.body.numSeats], (err1, data1) => {
						if (err)
							res.redirect('/registerAsDriver?register=fail')
						else
							res.redirect('/advertiseRide?register=success')
					});
				}
				});
		}
	});
}

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
