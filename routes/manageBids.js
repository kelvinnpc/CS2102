var express = require('express');
var router = express.Router();
const { Pool } = require('pg')


const pool = new Pool({
	connectionString: process.env.DATABASE_URL
});


/* SQL Query */
var getBidInfo_query = 'With tempTable as ' +
	'(SELECT Rides.rid, Rides.did, source, destination, date, numSeats, coalesce(max(points),0) as maxpt ' +
	'FROM Rides left join Bids on Rides.rid = Bids.rid group by Rides.rid) ' +
	'Select T.rid, name, source, destination, date, numSeats, maxpt, status, Bids.points, ' +
	'ROUND((SELECT avg(ratings) FROM Rates R1 where R1.ratedID = T.did and ratings>-1),2) as ratings ' +
	'FROM tempTable T join Users on Users.nric = T.did join Bids on T.rid=Bids.rid ' +
	'WHERE Bids.pid = $1 order by status, date desc';
var insertBid_query = 'INSERT INTO Bids VALUES($1, $2, $3)';
var getWalletBalance_query = 'SELECT balance from Wallet where Wallet.wid = $1';
var getTotalBids_query = `SELECT sum(points) as totalBid from Bids where Bids.pid=$1 and Bids.status='pending'`;
var isDriver_query = 'SELECT count(did) as count from Drivers where $1 = did';


router.get('/', manageBids);
router.post('/', bid);

function manageBids(req, res, next) {
	pool.query(getBidInfo_query, [req.user.nric], (err, getBidInfo) => {
		pool.query(getWalletBalance_query, [req.user.nric], (err1, getWalletBalance) => {
			pool.query(getTotalBids_query, [req.user.nric], (err1, getTotalBids) => {
				pool.query(isDriver_query, [req.user.nric], (err3, driverCheck) => {
					if (driverCheck.rows[0].count == 0)
						basic(req, res, 'manageBids', { title: 'My bids', driver: false, getBidInfo: getBidInfo.rows, getWalletBalance: getWalletBalance.rows, getTotalBids: getTotalBids.rows});
					else
						basic(req, res, 'manageBids', { title: 'My bids', driver: true, getBidInfo: getBidInfo.rows, getWalletBalance: getWalletBalance.rows, getTotalBids: getTotalBids.rows});
				});
			});
		});
	});
}

function bid(req, res, next) {
	var getBidInfo_query = 'With tempTable as ' +
	'(SELECT Rides.rid, Rides.did, source, destination, date, numSeats, coalesce(max(points),0) as maxpt ' +
	'FROM Rides left join Bids on Rides.rid = Bids.rid group by Rides.rid) ' +
	'Select T.rid, name, source, destination, date, numSeats, maxpt, status, Bids.points, ' +
	'ROUND((SELECT avg(ratings) FROM Rates R1 where R1.ratedID = T.did and ratings>-1),2) as ratings ' +
	'FROM tempTable T join Users on Users.nric = T.did join Bids on T.rid=Bids.rid ' +
	'WHERE Bids.pid = $1 and lower(source) LIKE $2 and lower(destination) LIKE $3';
	if (req.query.search==='true') {
		var source= "%" + req.body.source.toLowerCase() + "%";
		var destination = "%" + req.body.destination.toLowerCase() + "%";
		pool.query(getBidInfo_query, [req.user.nric, source,destination], (err, getBidInfo) => {
			pool.query(getWalletBalance_query, [req.user.nric], (err1, getWalletBalance) => {
				pool.query(getTotalBids_query, [req.user.nric], (err1, getTotalBids) => {
					pool.query(isDriver_query, [req.user.nric], (err3, driverCheck) => {
						if (err)
							res.redirect('/manageBids?search=fail')
						else if (driverCheck.rows[0].count == 0)
							basic(req, res, 'manageBids', { title: 'My bids', driver: false, getBidInfo: getBidInfo.rows, getWalletBalance: getWalletBalance.rows, getTotalBids: getTotalBids.rows});
						else
							basic(req, res, 'manageBids', { title: 'My bids', driver: true, getBidInfo: getBidInfo.rows, getWalletBalance: getWalletBalance.rows, getTotalBids: getTotalBids.rows});
					});
				});
			});
		});
	} else {
		pool.query(insertBid_query, [req.user.nric, req.body.rid, req.body.bid], (err, data) => {
			console.log(err);
			if (err)
				res.redirect('/manageBids?update=fail')
			else
				res.redirect('/manageBids?update=success')

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
