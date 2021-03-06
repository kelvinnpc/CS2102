var express = require('express');
var router = express.Router();
const { Pool } = require('pg');

const pool = new Pool({
	connectionString: process.env.DATABASE_URL
});


/* SQL Query */
var getRideInfo_query = 'With tempTable as ' +
	'(SELECT Rides.rid, Rides.status, Rides.did, source, destination, date, numSeats, coalesce(max(points),0) as maxpt ' +
	'FROM Rides left join Bids on Rides.rid = Bids.rid group by Rides.rid) ' +
	'Select rid, name, source, destination, date, numSeats, maxpt, ' +
	'ROUND((SELECT avg(ratings) FROM Rates R1 where R1.ratedID = tempTable.did and ratings>-1),2) as ratings ' +
	'FROM tempTable join Users on Users.nric = tempTable.did ' +
	`WHERE tempTable.rid NOT IN (SELECT B.rid FROM Bids B where B.pid=$1) and ` +
	`tempTable.did<>$1 and now()<date and numSeats<>0 and status='open'`;
var insertBid_query = 'INSERT INTO Bids VALUES($1, $2, $3)';
var getWalletBalance_query = 'SELECT balance from Wallet where Wallet.wid = $1';
var getTotalBids_query = `SELECT sum(points) as totalBid from Bids where Bids.pid=$1 and Bids.status='pending'`;
var isDriver_query = 'SELECT count(did) as count from Drivers where $1 = did';

router.get('/', findRide);
router.post('/', bid);

function findRide(req, res, next) {
	var checked = ["","","",""];
	pool.query(getRideInfo_query, [req.user.nric], (err, getRideInfo) => {
		pool.query(getWalletBalance_query, [req.user.nric], (err1, getWalletBalance) => {
			pool.query(getTotalBids_query, [req.user.nric], (err2, getTotalBids) => {
				pool.query(isDriver_query, [req.user.nric], (err3, driverCheck) => {
					if (driverCheck.rows[0].count == 0)
						basic(req, res, 'findRide', { title: 'Available rides', checked: checked, driver: false, getRideInfo: getRideInfo.rows, 
							getWalletBalance: getWalletBalance.rows, getTotalBids: getTotalBids.rows });
					else
						basic(req, res, 'findRide', { title: 'Available rides', checked: checked, driver: true, getRideInfo: getRideInfo.rows, getWalletBalance: getWalletBalance.rows, getTotalBids: getTotalBids.rows });
				});

			});
		});
	});
}

function bid(req, res, next) {
	var getRideInfo_query = 'With tempTable as ' +
	'(SELECT Rides.rid, Rides.status, Rides.did, source, destination, date, numSeats, coalesce(max(points),0) as maxpt ' +
	'FROM Rides left join Bids on Rides.rid = Bids.rid group by Rides.rid) ' +
	'Select rid, name, source, destination, date, numSeats, maxpt, ' +
	'ROUND((SELECT avg(ratings) FROM Rates R1 where R1.ratedID = tempTable.did and ratings>-1),2) as ratings ' +
	'FROM tempTable join Users on Users.nric = tempTable.did ' +
	`WHERE tempTable.rid NOT IN (SELECT B.rid FROM Bids B where B.pid=$1) and ` +
	`tempTable.did<>$1 and now()<date and numSeats<>0 and status='open' and lower(source) LIKE $2 and ` +
	`lower(destination) LIKE $3`;
	var checked = ["","","",""];
	if (req.query.search==='true') {
		var source= "%" + req.body.source.toLowerCase() + "%";
		var destination = "%" + req.body.destination.toLowerCase() + "%";
		/* if (req.body.time is undefine) */
		if (!req.body.time) {}
		else {
			checked[req.body.time.split('; ')[0]] = "checked";
			getRideInfo_query = getRideInfo_query + ' order by ' + req.body.time.split('; ')[1];
		}
		if (!req.body.bids) {}
		else if (!req.body.time) {
			checked[req.body.bids.split('; ')[0]] = "checked";
			getRideInfo_query = getRideInfo_query + ' order by ' + req.body.bids.split('; ')[1];
		}
		else {
			checked[req.body.bids.split('; ')[0]] = "checked";
			getRideInfo_query = getRideInfo_query + ',' + req.body.bids.split('; ')[1];
		}
		pool.query(getRideInfo_query, [req.user.nric,source,destination], (err, getRideInfo) => {
			pool.query(getWalletBalance_query, [req.user.nric], (err1, getWalletBalance) => {
				pool.query(getTotalBids_query, [req.user.nric], (err2, getTotalBids) => {
					pool.query(isDriver_query, [req.user.nric], (err3, driverCheck) => {
						if (err)
							res.redirect('/findRide?search=fail')
						else if (driverCheck.rows[0].count == 0)
							basic(req, res, 'findRide', { title: 'Available rides', checked: checked, driver: false, getRideInfo: getRideInfo.rows, 
								getWalletBalance: getWalletBalance.rows, getTotalBids: getTotalBids.rows });
						else
							basic(req, res, 'findRide', { title: 'Available rides', checked: checked, driver: true, getRideInfo: getRideInfo.rows, getWalletBalance: getWalletBalance.rows, getTotalBids: getTotalBids.rows });
					});
				});
			});
		});
	} else {
		console.log(req.body.bid);
		pool.query(insertBid_query, [req.user.nric, req.body.rid, req.body.bid], (err, data) => {
			if (err) 
				res.redirect('/findRide?bid=fail')
			else
				res.redirect('/findRide?bid=success')
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
