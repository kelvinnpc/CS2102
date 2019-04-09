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
var sql_query = 'SELECT H.rid, U.name, R.source, R.destination, R.date, H.points ' +
                'FROM History H join Rides R on H.rid=R.rid join Users U on U.nric=R.did where H.userID=$1 order by R.date desc';
var isDriver_query = 'SELECT count(did) as count from Drivers where $1 in (select did from drivers)';

router.get('/', findHistory);
//router.post('/', bid);

function findHistory(req,res,next){
  pool.query(sql_query, [req.user.nric], (err, data) => {
	pool.query(isDriver_query, [req.user.nric], (err3, data0) => {
		console.log(err);
		if (data0.rows[0].count == 0)
			basic(req,res,'passengerHistory', {title: 'Ride History', driver: false, data: data.rows});
		else
			basic(req,res,'passengerHistory', {title: 'Ride History', driver: true, data: data.rows});
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
