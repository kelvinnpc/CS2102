var express = require('express');
var router = express.Router();

const { Pool } = require('pg');

const pool = new Pool({
	connectionString: process.env.DATABASE_URL
});


/* SQL Query */
var insertRide_query = 'INSERT INTO Rides (did,source, destination, numSeats, date) VALUES ($1, $2, $3, $4,$5)';

router.get('/', advertiseRide);
router.post('/', postRide);

function advertiseRide(req,res,next){
	basic(req,res,'advertiseRide', {title: 'Create rides'});  
}

function postRide(req,res,next) {
	console.log(req.body.bid);
	pool.query(insertRide_query, [req.user.nric, req.body.source, req.body.destination, req.body.numSeats, req.body.date], (err, data) => {
	  console.log(err);
	  if (err)
		res.redirect('/advertiseRide?post=fail')
	  else
		res.redirect('/advertiseRide?post=success')
  
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