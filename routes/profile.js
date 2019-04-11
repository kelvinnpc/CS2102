var express = require('express');
var router = express.Router();
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});


/* SQL Query */
var getUserInfo_query = 'SELECT * FROM Users where nric=$1';
var getNumTrips_query = `SELECT count(R.rid) q FROM History H join Rides R on H.rid=R.rid where H.userID=$1 and R.date > current_timestamp - interval '30 day'`;
var getReceivedRating30days_query = `SELECT ROUND(coalesce(avg(Rates.ratings),-1),2) q FROM Rates join Rides on Rates.rid = Rides.rid ` +
                                    `WHERE Rates.ratedid=$1 and ratings>-1 and Rides.date > current_timestamp - interval '30 day'`;
var getReceivedRatingAll_query = `SELECT ROUND(coalesce(avg(Rates.ratings),-1),2) q FROM Rates join Rides on Rates.rid = Rides.rid ` +
                                 `WHERE Rates.ratedid=$1 and ratings>-1`;
var getGivenRating30days_query = `SELECT ROUND(coalesce(avg(Rates.ratings),-1),2) q FROM Rates join Rides on Rates.rid = Rides.rid ` +
                                 `WHERE Rates.raterid=$1 and Rides.date > current_timestamp - interval '30 day' and ratings>-1`;
var getGivenRatingAll_query = `SELECT ROUND(coalesce(avg(Rates.ratings),-1),2) q FROM Rates join Rides on Rates.rid = Rides.rid ` +
                              `WHERE Rates.raterid=$1 and ratings>-1`;
var isDriver_query = 'SELECT count(did) as count from Drivers where $1 = did';

router.get('/', profile);

function profile(req, res, next) {
    pool.query(getUserInfo_query, [req.user.nric], (err, data) => {
        pool.query(getNumTrips_query, [req.user.nric], (err1, getNumTrips) => {
            pool.query(getReceivedRating30days_query, [req.user.nric], (err2, getReceivedRating30days) => {
                pool.query(getReceivedRatingAll_query, [req.user.nric], (err3, getReceivedRatingAll) => {
                    pool.query(getGivenRating30days_query, [req.user.nric], (err4, getGivenRating30days) => {
                        pool.query(getGivenRatingAll_query, [req.user.nric], (err5, getGivenRatingAll) => {
                            pool.query(isDriver_query, [req.user.nric], (err3, driverCheck) => {
                                if (req.query.drivermode === 'true')
                                    basic(req, res, 'profile', {
                                        title: 'Profile Page', driver: false, drivermode: true, data: data.rows, getNumTrips: getNumTrips.rows[0].q, getReceivedRating30days: getReceivedRating30days.rows[0].q,
                                        getReceivedRatingAll: getReceivedRatingAll.rows[0].q, getGivenRating30days: getGivenRating30days.rows[0].q, getGivenRatingAll: getGivenRatingAll.rows[0].q
                                    });
                                else if (driverCheck.rows[0].count == 0)
                                    basic(req, res, 'profile', {
                                        title: 'Profile Page', driver: false, drivermode: false, data: data.rows, getNumTrips: getNumTrips.rows[0].q, getReceivedRating30days: getReceivedRating30days.rows[0].q,
                                        getReceivedRatingAll: getReceivedRatingAll.rows[0].q, getGivenRating30days: getGivenRating30days.rows[0].q, getGivenRatingAll: getGivenRatingAll.rows[0].q
                                    });
                                else
                                    basic(req, res, 'profile', {
                                        title: 'Profile Page', driver: true, drivermode: false, data: data.rows, getNumTrips: getNumTrips.rows[0].q, getReceivedRating30days: getReceivedRating30days.rows[0].q,
                                        getReceivedRatingAll: getReceivedRatingAll.rows[0].q, getGivenRating30days: getGivenRating30days.rows[0].q, getGivenRatingAll: getGivenRatingAll.rows[0].q
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
