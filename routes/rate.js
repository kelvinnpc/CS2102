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
var sql_query = 'SELECT R.ratedid, R.rid, U.name, Rides.source, Rides.destination, Rides.date from Rates R join users U on R.ratedid = U.nric ' +
                'join Rides on Rides.rid=R.rid where raterid=$1 and R.ratings=-1';
var post_query = `UPDATE Rates set ratings=$1 where ratedid=$2 and raterid=$3 and rid=$4`;
var isDriver_query = 'SELECT count(did) as count from Drivers where $1 in (select did from drivers)';

router.get('/', rate);
router.post('/', add);

function rate(req,res,next){
  pool.query(sql_query, [req.user.nric], (err, data) => {
  	pool.query(isDriver_query, [req.user.nric], (err1, data1) => {
		console.log(err);
		if (data1.rows[0].count == 0)
			basic(req,res,'rate', {title: 'Rate', driver: false, data: data.rows});
		else
			basic(req,res,'rate', {title: 'Rate', driver: true, data: data.rows});
 	});
  });
}

function add(req,res,next) {
  pool.query(post_query, [req.body.rating, req.body.rid.split('; ')[0], req.user.nric, req.body.rid.split('; ')[1]], (err, data) => {
	console.log(err);
	if (err)
		res.redirect('/rate?add=fail')
	else
		res.redirect('/rate?add=success')

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
