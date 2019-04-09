var express = require('express');
var router = express.Router();
const { Pool } = require('pg')
/* --- V7: Using Dot Env ---
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'postgres',
  password: '********',
  port: 5432,
})
*/
const pool = new Pool({
	connectionString: process.env.DATABASE_URL
});


/* SQL Query */
var sql_query = 'With tempTable as ' +
	'(SELECT Rides.rid, Rides.did, source, destination, date, numSeats, coalesce(max(points),0) as maxpt ' +
	'FROM Rides left join Bids on Rides.rid = Bids.rid group by Rides.rid) ' +
	'Select T.rid, name, source, destination, date, numSeats, maxpt, status, ' +
	'ROUND((SELECT avg(ratings) FROM Rates R1 where R1.ratedID = T.did and ratings>-1),2) as ratings ' +
	'FROM tempTable T join Users on Users.nric = T.did join Bids on T.rid=Bids.rid ' +
	'WHERE Bids.pid = $1 order by T.rid';
var post_query = 'INSERT INTO Bids VALUES($1, $2, $3)';
var wallet_query = 'SELECT balance from Wallet where Wallet.wid = $1';
var totalBids_query = 'SELECT sum(points) as totalBid from Bids where Bids.pid=$1';
var point_query = 'SELECT points from Bids where Bids.pid=$1 order by rid';
var isDriver_query = 'SELECT count(did) as count from Drivers where $1 = did';


router.get('/', manageBids);
router.post('/', bid);

function manageBids(req, res, next) {
	pool.query(sql_query, [req.user.nric], (err, data) => {
		pool.query(wallet_query, [req.user.nric], (err1, data1) => {
			pool.query(totalBids_query, [req.user.nric], (err1, data2) => {
				pool.query(point_query, [req.user.nric], (err1, data3) => {
					pool.query(isDriver_query, [req.user.nric], (err3, driverCheck) => {
						if (driverCheck.rows[0].count == 0)
							basic(req, res, 'manageBids', { title: 'My bids', driver: false, data: data.rows, data1: data1.rows, data2: data2.rows, data3: data3.rows });
						else
							basic(req, res, 'manageBids', { title: 'My bids', driver: true, data: data.rows, data1: data1.rows, data2: data2.rows, data3: data3.rows });
					});
				});
			});
		});
	});
}

function bid(req, res, next) {
	console.log(req.body.bid);
	pool.query(post_query, [req.user.nric, req.body.rid, req.body.bid], (err, data) => {
		console.log(err);
		if (err)
			res.redirect('/manageBids?update=fail')
		else
			res.redirect('/manageBids?update=success')

	});
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
