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
				'(SELECT Rides.rid, Rides.did, source, destination, dates, timing, status, coalesce(max(points),0) as maxpt ' +
				'FROM Rides left join Bids on Rides.rid = Bids.rid group by Rides.rid) ' +
				'Select rid, name, source, destination, dates, timing, status, maxpt ' +
				'FROM tempTable join Users on Users.nric = tempTable.did';
var post_query = 'INSERT INTO Bids VALUES($1, $2, $3)';
var wallet_query = 'SELECT balance from Wallet where Wallet.wid = $1';

// router.get('/', function(req, res, next) {
// 	pool.query(sql_query, (err, data) => {
// 		res.render('passenger', { title: 'Available rides', data: data.rows });
// 	});
// });
router.get('/', passenger);
router.post('/', bid);

function passenger(req,res,next){
  pool.query(sql_query, (err, data) => {
  	pool.query(wallet_query, [req.user.nric], (err1, data1) => {
  		console.log(err);
  		basic(req,res,'passenger', {title: 'Available rides', data: data.rows, data1:data1.rows});
  	});
  });
}

function bid(req,res,next) {
  console.log(req.body.bid);
  pool.query(post_query, [req.user.nric, req.body.rid, req.body.bid], (err, data) => {
  	console.log(err);
  	res.redirect('/passenger')
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
