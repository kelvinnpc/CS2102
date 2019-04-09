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
var select_query = 'With tempTable as ' +
				'(SELECT Rides.rid, Rides.did, source, destination, date, numSeats, coalesce(max(points),0) as maxpt ' +
				'FROM Rides left join Bids on Rides.rid = Bids.rid group by Rides.rid) ' +
				'Select Bids.pid, tempTable.rid, Users.name, source, destination, date, numSeats, Bids.points, maxpt, ' +
				'ROUND((SELECT avg(ratings) FROM Rates R1 where R1.ratedID = Bids.pid),2) as ratings ' +
				`FROM (tempTable join Bids on Bids.rid = tempTable.rid) join Users on Users.nric=Bids.pid ` +
				`WHERE tempTable.rid in (SELECT R.rid FROM Rides R where R.did=$1) and Bids.status = 'pending' ` +
				'and now()<date and numSeats<>0';
var update_query = `update Bids set status='Ride Confirmed' where pid=$1 and rid=$2`;
var insert1_query = 'UPDATE Rides set numSeats = numSeats - 1 where rid=$1';
var insert2_query = 'INSERT INTO Uses(pid,transaction) VALUES ($1,$2)';
var insert3_query =	'SELECT did FROM Rides WHERE rid=$1';
var insert4_query =	'INSERT INTO Uses(pid,transaction) VALUES ((SELECT did FROM Rides WHERE rid=$1),$2)';
var insert5_query =	'INSERT INTO Rates(raterid,ratedid,ratings,rid) VALUES ((SELECT did FROM Rides WHERE rid=$1),$2,-1,$1)';
var insert6_query = 'INSERT INTO Rates(raterid,ratedid,ratings,rid) VALUES ($2,(SELECT did FROM Rides WHERE rid=$1),-1,$1)';
var insert7_query = 'INSERT INTO History(userID,rid,points) VALUES ($1,$2,$3)';

router.get('/', selectPassenger);
router.post('/', select);

function selectPassenger(req,res,next){
	pool.connect(function(err,client,done) {
		client.query(select_query,[req.user.nric], function(err,res2) {
			done();
			basic(req,res,'selectPassenger', {title: 'Select passenger', data: res2.rows});
		});
	});
}

	  

function select(req,res,next) {
	pool.connect(function(err,client,done) {
		function abort(err) {
			if (err) { client.query('ROLLBACK', function(err) { done(); });
			res.redirect('/selectPassenger?add=fail');
						return true;}

			return false;
		}
		client.query('BEGIN',function(err,res1) {
			if (abort(err)) {	return;}
			client.query(update_query,[req.body.val.split('; ')[7],req.body.val.split('; ')[0]], function(err,res2) {
				if (abort(err)) {	return;}
				client.query(insert1_query,[req.body.val.split('; ')[0]],function(err,res3) {
					if (abort(err)) {	return;}
					client.query(insert2_query,[req.body.val.split('; ')[7], req.body.val.split('; ')[6]*(-1)], function(err,res4) {
						if (abort(err)) {	return;}
						client.query(insert3_query,[req.body.val.split('; ')[0]],function(err,res5) {
							if (abort(err)) {	return;}
							client.query(insert4_query,[req.body.val.split('; ')[0], req.body.val.split('; ')[6]],function(err,res6) {
								if (abort(err)) {	return;}
								client.query(insert5_query,[req.body.val.split('; ')[0], req.body.val.split('; ')[7]],function(err,res7) {
									if (abort(err)) {	return;}
									client.query(insert6_query,[req.body.val.split('; ')[0], req.body.val.split('; ')[7]],function(err,res8) {
										if (abort(err)) {	return; }
										client.query(insert7_query,[req.body.val.split('; ')[7], req.body.val.split('; ')[0],req.body.val.split('; ')[6]],function(err,res9) {
											if (abort(err)) {	return;}
											client.query('COMMIT',function(err,res10) {
												if (abort(err)) {	return; }
												done();
												res.redirect('/selectPassenger?add=success');
											});
										});
									});
								});
							});
						});
					});
				});
			});
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