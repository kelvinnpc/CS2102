var express = require('express');
var router = express.Router();
const { Pool } = require('pg');

const pool = new Pool({
	connectionString: process.env.DATABASE_URL
});


/* SQL Query */
var getBiddedRides_query = 'Select Bids.pid, Rides.rid, Rides.status, Users.name, Users.phonenumber, source, destination, date, numSeats, Bids.points, ' +
                'ROUND((SELECT avg(ratings) FROM Rates R1 where R1.ratedID = Bids.pid),2) as ratings, ' +
                `(SELECT count(pid) FROM Bids where Bids.status = 'Ride Confirmed' and Bids.rid = Rides.rid group by Rides.rid) as count ` +
								`FROM (Rides join Bids on Bids.rid = Rides.rid) join Users on Users.nric=Bids.pid ` +
								`WHERE Rides.did=$1 and Bids.status = 'Ride Confirmed' order by Rides.status desc`;
var getNotBiddedRides_query = 'Select * from Rides where Rides.rid not in (select rid from bids) and Rides.did=$1 order by Rides.status desc';
var passengerDeduction_query = `INSERT INTO Uses(pid,transaction) ` +
															`select pid, points*-1 from bids where status='Ride Confirmed' and rid = $1`;
var driverAddition_query =	`INSERT INTO Uses(pid,transaction,date) ` +
														`select $2, points, now() + concat(row_number () over (order by points), ' milliseconds')::interval ` +
														`from bids where status='Ride Confirmed' and rid = $1`;
var refundPoints_query = `UPDATE Bids set status = 'rejected', points=0 where rid=$1 and status='pending'`;
var updateRideStatus_query = `UPDATE Rides set status = 'close' where rid=$1`;

router.get('/', manageRide);
router.post('/', select);

function manageRide(req,res,next){
	pool.connect(function(err,client,done) {
		client.query(getBiddedRides_query,[req.user.nric], function(err,getBiddedRides) {
			client.query(getNotBiddedRides_query,[req.user.nric], function(err,getNotBiddedRides) {
				console.log(err);
				var passengersArrays = [];
				while (getBiddedRides.rows.length > 0) {
					passengersArrays.push(getBiddedRides.rows.splice(0, getBiddedRides.rows[0].count));
				}

				done();
				basic(req,res,'manageRide', {title: 'Manage rides', passenger: passengersArrays, getNotBiddedRides: getNotBiddedRides.rows});
			});
		});
	});
}

	  

function select(req,res,next) {
	pool.connect(function(err,client,done) {
		if (req.query.noPassenger==='true') {
			client.query(updateRideStatus_query, [req.body.noPassenger], function (err, res9) {
				if (err) {
					done();
					res.redirect('/manageRide?update=fail');
				}
				else {
					done();
					res.redirect('/manageRide?update=success');
				}
			});
		}
		else {
			function abort(err) {
				if (err) { client.query('ROLLBACK', function(err) { done(); });
							res.redirect('/manageRide?update=fail');
							return true;}

				return false;
			}
			client.query('BEGIN', function (err, res1) {
				if (abort(err)) { return; }
				client.query(passengerDeduction_query, [req.body.val], function (err, res4) {
					if (abort(err)) { return; }
					client.query(driverAddition_query, [req.body.val, req.user.nric], function (err, res6) {
						if (abort(err)) { return; }
						client.query(refundPoints_query, [req.body.val], function (err, res9) {
							if (abort(err)) { return; }
							client.query(updateRideStatus_query, [req.body.val], function (err, res9) {
								if (abort(err)) { return; }
								client.query('COMMIT', function (err, res10) {
									if (abort(err)) { return; }
									done();
									res.redirect('/manageRide?update=success');
								});
							});
						});
					});
				});
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