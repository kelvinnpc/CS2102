var express = require('express');
var router = express.Router();

const { Pool } = require('pg')
const pool = new Pool({
	connectionString: process.env.DATABASE_URL
});


// GET
router.get('/', function(req, res, next) {
    var sql_selectAll = 'SELECT * FROM accessHelpDesk';
	pool.query(sql_selectAll, (err, data) => {
		res.render('adminHelpDesk', { title: 'Customers messages', data: data.rows,selected: '' });
	});
});

router.post('/', function(req, res, next) {
    /* SQL Query */
    var userID  = req.body.userID;
    var sort = req.body.sort;
    var sql_selectAll = 'SELECT * FROM accessHelpDesk';
    var selected = ["","","",""];
    selected[sort-1]="selected";
    
    /* if userID is not empty */
    if (userID)
        sql_selectAll = sql_selectAll + ' where userid =' + userID;
    
    if (sort == 1)
        sql_selectAll = sql_selectAll + ' order by date desc';
    if (sort == 2)
        sql_selectAll = sql_selectAll + ' order by date';
    if (sort == 3)
        sql_selectAll = sql_selectAll + ' order by userID';
    if (sort == 4)
        sql_selectAll = sql_selectAll + ' order by userID desc';
    
	pool.query(sql_selectAll, (err, data) => {
		res.render('adminHelpDesk', { title: 'Customers messages', data: data.rows, selected: selected });
	});
});


module.exports = router;
