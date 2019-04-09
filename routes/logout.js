var express = require('express');
var router = express.Router();
const { Pool } = require('pg')

const pool = new Pool({
	connectionString: process.env.DATABASE_URL
});


router.get('/', logout);

function logout(req, res, next) {
	req.session.destroy()
	req.logout()
	res.redirect('/')
}



module.exports = router;
