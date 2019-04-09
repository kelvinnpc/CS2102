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
	'Select rid, name, source, destination, date, numSeats, maxpt ' +
	'FROM tempTable join Users on Users.nric = tempTable.did ' +
	'WHERE tempTable.rid NOT IN (SELECT B.rid FROM Bids B where B.pid=$1)';
var uses_query = 'INSERT INTO Uses VALUES($1, $2)';
var wallet_query = 'SELECT balance from Wallet where Wallet.wid = $1';
var totalBids_query = 'SELECT sum(points) as totalBid from Bids where Bids.pid=$1';
var isDriver_query = 'SELECT count(did) as count from Drivers where $1 = did';
var transaction_query = `select coalesce(sum(case when transaction >= 0 then transaction end),0) as topUp, ` +
	`coalesce(sum(case when transaction < 0 then transaction end),0) as deducted, ` +
	`to_char(date, 'YYYY-MM') as year_month from uses where $1 = uses.pid group by year_month order by year_month desc`;
router.get('/', wallet);
router.post('/', topUp);

function wallet(req, res, next) {
	pool.query(sql_query, [req.user.nric], (err, data) => {
		pool.query(wallet_query, [req.user.nric], (err1, data1) => {
			pool.query(totalBids_query, [req.user.nric], (err1, data2) => {
				pool.query(isDriver_query, [req.user.nric], (err3, driverCheck) => {
					pool.query(transaction_query, [req.user.nric], (err3, data3) => {
						console.log(err);
						if (driverCheck.rows[0].count == 0)
							basic(req, res, 'wallet', { title: 'Wallet', driver: false, data: data.rows, data1: data1.rows, data2: data2.rows, data3: data3.rows });
						else
							basic(req, res, 'wallet', { title: 'Wallet', driver: true, data: data.rows, data1: data1.rows, data2: data2.rows, data3: data3.rows });
					});
				});
			});
		});
	});
}

function topUp(req, res, next) {
	console.log(req.body.bid);
	pool.query(uses_query, [req.user.nric, req.body.amount], (err, data) => {
		console.log(err);
		if (err)
			res.redirect('/wallet?topUp=fail')
		else
			res.redirect('/wallet?topUp=success')

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
