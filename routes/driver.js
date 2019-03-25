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
var sql_query = 'SELECT rid, source, destination, dates, timing, status FROM Rides';

router.get('/', function(req, res, next) {
	pool.query(sql_query, (err, data) => {
		res.render('driver', { title: 'Database Connect', data: data.rows });
	});
});

module.exports = router;
