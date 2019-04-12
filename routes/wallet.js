var express = require('express');
var router = express.Router();
const { Pool } = require('pg');

const pool = new Pool({
	connectionString: process.env.DATABASE_URL
});


/* SQL Query */
var usesWallet_query = 'INSERT INTO Uses VALUES($1, $2)';
var getWalletBalance_query = 'SELECT balance from Wallet where Wallet.wid = $1';
var getTotalBids_query = `SELECT sum(points) as totalBid from Bids where Bids.pid=$1 and Bids.status='pending'`;
var isDriver_query = 'SELECT count(did) as count from Drivers where $1 = did';
var getTransactionSummary_query = `select coalesce(sum(case when transaction >= 0 then transaction end),0) as topUp, ` +
	`coalesce(sum(case when transaction < 0 then transaction end),0) as deducted, ` +
	`to_char(date, 'YYYY-MM') as year_month from uses where $1 = uses.pid group by year_month order by year_month desc`;
router.get('/', wallet);
router.post('/', topUp);

function wallet(req, res, next) {
	pool.query(getWalletBalance_query, [req.user.nric], (err1, getWalletBalance) => {
		pool.query(getTotalBids_query, [req.user.nric], (err1, getTotalBids) => {
			pool.query(isDriver_query, [req.user.nric], (err3, driverCheck) => {
				pool.query(getTransactionSummary_query, [req.user.nric], (err3, getTransactionSummary) => {
					if (req.query.drivermode === 'true')
						basic(req, res, 'wallet', { title: 'Wallet', driver: false, drivermode: true, getWalletBalance: getWalletBalance.rows, getTotalBids: getTotalBids.rows, getTransactionSummary: getTransactionSummary.rows });

					else if (driverCheck.rows[0].count == 0)
						basic(req, res, 'wallet', { title: 'Wallet', driver: false, drivermode: false, getWalletBalance: getWalletBalance.rows, getTotalBids: getTotalBids.rows, getTransactionSummary: getTransactionSummary.rows });
					else
						basic(req, res, 'wallet', { title: 'Wallet', driver: true, drivermode: false, getWalletBalance: getWalletBalance.rows, getTotalBids: getTotalBids.rows, getTransactionSummary: getTransactionSummary.rows });
				});
			});
		});
	});
}

function topUp(req, res, next) {
	var getTransactionSummary_query = `select coalesce(sum(case when transaction >= 0 then transaction end),0) as topUp, ` +
	`coalesce(sum(case when transaction < 0 then transaction end),0) as deducted, ` +
	`to_char(date, 'YYYY-MM') as year_month from uses where $1 = uses.pid `;
	if (req.query.search==='true') {
		if (!req.body.date) {
			getTransactionSummary_query = getTransactionSummary_query + ` group by year_month`;
		}
		else {
			getTransactionSummary_query = getTransactionSummary_query + ` and to_char(date, 'YYYY-MM') = '` + req.body.date + `' group by year_month`;
		}
		pool.query(getWalletBalance_query, [req.user.nric], (err1, getWalletBalance) => {
			pool.query(getTotalBids_query, [req.user.nric], (err1, getTotalBids) => {
				pool.query(isDriver_query, [req.user.nric], (err3, driverCheck) => {
					pool.query(getTransactionSummary_query, [req.user.nric], (err3, getTransactionSummary) => {
						if (req.query.drivermode === 'true')
							basic(req, res, 'wallet', { title: 'Wallet', driver: false, drivermode: true, getWalletBalance: getWalletBalance.rows, getTotalBids: getTotalBids.rows, getTransactionSummary: getTransactionSummary.rows });
	
						else if (driverCheck.rows[0].count == 0)
							basic(req, res, 'wallet', { title: 'Wallet', driver: false, drivermode: false, getWalletBalance: getWalletBalance.rows, getTotalBids: getTotalBids.rows, getTransactionSummary: getTransactionSummary.rows });
						else
							basic(req, res, 'wallet', { title: 'Wallet', driver: true, drivermode: false, getWalletBalance: getWalletBalance.rows, getTotalBids: getTotalBids.rows, getTransactionSummary: getTransactionSummary.rows });
					});
				});
			});
		});
	} else {
		pool.query(usesWallet_query, [req.user.nric, req.body.amount], (err, data) => {
			console.log(err);
			if (err) {
				if (req.query.drivermode==='true')
					res.redirect('/wallet?topUp=fail&drivermode=true')
				else
					res.redirect('/wallet?topUp=fail')
			}
			else {
				if (req.query.drivermode==='true')
					res.redirect('/wallet?topUp=success&drivermode=true')
				else
					res.redirect('/wallet?topUp=success')
			}
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
