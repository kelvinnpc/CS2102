const sql_query = require('../sql');
const passport = require('passport');
const bcrypt = require('bcrypt')

// Postgre SQL Connection
const { Pool } = require('pg');
const pool = new Pool({
	connectionString: process.env.DATABASE_URL,
  //ssl: true
});

const round = 10;
const salt  = bcrypt.genSaltSync(round);

function initRouter(app) {
	/* GET */
	//app.get('/'      , index );
	//app.get('/search', search);
	
	/* PROTECTED GET */
	//app.get('/dashboard', passport.authMiddleware(), dashboard);
	//app.get('/games'    , passport.authMiddleware(), games    );
	//app.get('/plays'    , passport.authMiddleware(), plays    );
	
	//app.get('/register' , passport.antiMiddleware(), register );
	//app.get('/password' , passport.antiMiddleware(), retrieve );
	
	/* PROTECTED POST */
	//app.post('/update_info', passport.authMiddleware(), update_info);
	//app.post('/update_pass', passport.authMiddleware(), update_pass);
	//app.post('/add_game'   , passport.authMiddleware(), add_game   );
	//app.post('/add_play'   , passport.authMiddleware(), add_play   );
	
	//app.post('/reg_user'   , passport.antiMiddleware(), reg_user   );

	/* LOGIN */
	// app.post('/login', passport.authenticate('local', {
	// 	successRedirect: '/select',
    //     failureRedirect: '/',
	// }));
	
	/* LOGOUT */
	//app.get('/logout', passport.authMiddleware(), logout);
}
module.exports = initRouter;