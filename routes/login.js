var express = require('express');
var router = express.Router();
const passport = require('passport');
// Postgre SQL Connection
const { Pool } = require('pg');
const pool = new Pool({
	connectionString: process.env.DATABASE_URL,
});

/* GET*/
router.get('/', function(req, res, next) {
  res.render('login', { title: 'Log In Page' });
});

router.post('/', passport.authenticate('local', {
  successRedirect: '/about',
  failureRedirect: '/'
}));


module.exports = router;
