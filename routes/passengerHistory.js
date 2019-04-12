var express = require('express');
var router = express.Router();
const { Pool } = require('pg');

const pool = new Pool({
	connectionString: process.env.DATABASE_URL
});


/* SQL Query */
var getRides_query = 'SELECT H.rid, U.name, R.source, R.destination, R.date, H.points ' +
	'FROM History H join Rides R on H.rid=R.rid join Users U on U.nric=R.did where H.userID=$1 order by R.date desc';
var isDriver_query = 'SELECT count(did) as count from Drivers where $1 = did';

router.get('/', findHistory);
router.post('/',search)

function findHistory(req, res, next) {
	pool.query(getRides_query, [req.user.nric], (err, data) => {
		pool.query(isDriver_query, [req.user.nric], (err3, driverCheck) => {
			console.log(err);
			if (driverCheck.rows[0].count == 0)
				basic(req, res, 'passengerHistory', { title: 'Ride History', driver: false, data: data.rows });
			else
				basic(req, res, 'passengerHistory', { title: 'Ride History', driver: true, data: data.rows });
		});
	});
}


function search(req, res, next) {
	var getRides_query = 'SELECT H.rid, U.name, R.source, R.destination, R.date, H.points ' +
	'FROM History H join Rides R on H.rid=R.rid join Users U on U.nric=R.did where H.userID=$1 ' +
	`and lower(source) LIKE $2 and lower(destination) LIKE $3 and lower(name) LIKE $4`;
	var source= "%" + req.body.source.toLowerCase() + "%";
	var destination = "%" + req.body.destination.toLowerCase() + "%";
	var name = "%" + req.body.name.toLowerCase() + "%";
	if (!req.body.rid) {
		pool.query(getRides_query, [req.user.nric,source,destination,name], (err, data) => {
			pool.query(isDriver_query, [req.user.nric], (err3, driverCheck) => {
				console.log(err);
				if (driverCheck.rows[0].count == 0)
					basic(req, res, 'passengerHistory', { title: 'Ride History', driver: false, data: data.rows });
				else
					basic(req, res, 'passengerHistory', { title: 'Ride History', driver: true, data: data.rows });
			});
		});
	}
	else {
		getRides_query = getRides_query + " and H.rid=$5";
		pool.query(getRides_query, [req.user.nric,source,destination,name,req.body.rid], (err, data) => {
			pool.query(isDriver_query, [req.user.nric], (err3, driverCheck) => {
				console.log(err);
				if (driverCheck.rows[0].count == 0)
					basic(req, res, 'passengerHistory', { title: 'Ride History', driver: false, data: data.rows });
				else
					basic(req, res, 'passengerHistory', { title: 'Ride History', driver: true, data: data.rows });
			});
		});
	}
}


function basic(req, res, page, other) {
	var info = {
		page: page,
		user: req.user.username,
		name: req.user.name,
		nric: req.user.nric,
		status: req.user.phonenumber,
	};
	if (other) {
		for (var fld in other) {
			info[fld] = other[fld];
		}
	}
	res.render(page, info);
}


module.exports = router;
