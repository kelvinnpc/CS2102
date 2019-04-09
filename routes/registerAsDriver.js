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
var driver_query = 'INSERT INTO Drivers(did) VALUES ($1)';
var car_query = 'INSERT INTO Cars(did,platenumber,model,numSeats) VALUES ($1,$2,$3,$4)';

// GET
router.get('/', function(req, res, next) {
    basic(req,res,'registerAsDriver');
});

router.post('/', register);

function register(req,res,next) {
  console.log(req.body.bid);
  pool.query(driver_query, [req.user.nric], (err, data) => {
    pool.query(car_query, [req.user.nric, req.body.plateNumber, req.body.model, req.body.numSeats], (err1, data1) => {
        console.log(err);
        if (err)
            res.redirect('/registerAsDriver?reg=fail')
        else
            res.redirect('/advertiseRide')
    });
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