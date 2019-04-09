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
var info_query = 'SELECT * FROM Users where nric=$1';
var trips_query = `SELECT count(R.rid) q FROM History H join Rides R on H.rid=R.rid where H.userID=$1 and R.date > current_timestamp - interval '30 day'`;
var passenger_query = `SELECT ROUND(coalesce(avg(Rates.ratings),-1),2) q FROM Rates join Rides on Rates.rid = Rides.rid ` +
    `WHERE Rates.ratedid=$1 and Rides.date > current_timestamp - interval '30 day'`;
var passengerAll_query = `SELECT ROUND(coalesce(avg(Rates.ratings),-1),2) q FROM Rates join Rides on Rates.rid = Rides.rid ` +
    `WHERE Rates.ratedid=$1`;
var drivers_query = `SELECT ROUND(coalesce(avg(Rates.ratings),-1),2) q FROM Rates join Rides on Rates.rid = Rides.rid ` +
    `WHERE Rates.raterid=$1 and Rides.date > current_timestamp - interval '30 day'`;
var driversAll_query = `SELECT ROUND(coalesce(avg(Rates.ratings),-1),2) q FROM Rates join Rides on Rates.rid = Rides.rid ` +
    `WHERE Rates.raterid=$1`;
var isDriver_query = 'SELECT count(did) as count from Drivers where $1 in (select did from drivers)';

router.get('/', profile);

function profile(req, res, next) {
    pool.query(info_query, [req.user.nric], (err, data) => {
        pool.query(trips_query, [req.user.nric], (err1, data1) => {
            pool.query(passenger_query, [req.user.nric], (err2, data2) => {
                pool.query(passengerAll_query, [req.user.nric], (err3, data3) => {
                    pool.query(drivers_query, [req.user.nric], (err4, data4) => {
                        pool.query(driversAll_query, [req.user.nric], (err5, data5) => {
                            pool.query(isDriver_query, [req.user.nric], (err0, data0) => {
                                console.log(err);
                                if (data0.rows[0].count == 0)
                                    basic(req, res, 'profile', {
                                        title: 'Profile Page', driver: false, data: data.rows, count: data1.rows[0].q, passenger30: data2.rows[0].q,
                                        passengerall: data3.rows[0].q, driver30: data4.rows[0].q, driverall: data5.rows[0].q
                                    });
                                else
                                    basic(req, res, 'profile', {
                                        title: 'Profile Page', driver: true, data: data.rows, count: data1.rows[0].q, passenger30: data2.rows[0].q,
                                        passengerall: data3.rows[0].q, driver30: data4.rows[0].q, driverall: data5.rows[0].q
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
