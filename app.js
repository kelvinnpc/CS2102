var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

const exphbs = require('express-handlebars')
const session = require('express-session')
const passport = require('passport')
const bcrypt = require('bcrypt')


/* --- V7: Using dotenv     --- */
require('dotenv').config();

/* --- For before login pages -----*/
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var registerRouter = require('./routes/register');
var loginRouter = require('./routes/login');
/* ------------------------------- */

/* --- For passenger page --- */
var findRideRouter = require('./routes/findRide');
var manageBidsRouter = require('./routes/manageBids');
var regDriverRouter = require('./routes/registerAsDriver');
var passengerHistoryRouter = require('./routes/passengerHistory');
/* -------------------------- */


/* --- For driver page --- */
var advertiseRideRouter = require('./routes/advertiseRide');
var selectPassengerRouter = require('./routes/selectPassenger');
var manageRideRouter = require('./routes/manageRide');
/* -------------------------- */


/* --- For both passenger and driver page --- */
var clientHelpRouter = require('./routes/clientHelpDesk');
var walletRouter = require('./routes/wallet');
var rateRouter = require('./routes/rate');
var profileRouter = require('./routes/profile');
var logoutRouter = require('./routes/logout');
/* ------------------------------------------ */



var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Authentication Setup
//require('dotenv').load();
require('./auth').init(app);
app.use(session({
  //secret: process.env.SECRET, 
  secret: 'blah',
  resave: true,
  saveUninitialized: true
}))
app.use(passport.initialize())
app.use(passport.session())


/* --- For before login pages -----*/
app.use('/', indexRouter);
app.use('/users', usersRouter);
var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/register', registerRouter);
app.use('/login', loginRouter);

/* ------------------------------- */

/* --- For passenger page --- */
app.use('/findRide', findRideRouter);
app.use('/registerAsDriver',regDriverRouter);
app.use('/manageBids',manageBidsRouter);
app.use('/passengerHistory',passengerHistoryRouter);

/* -------------------------- */

/* --- For driver page --- */
app.use('/advertiseRide', advertiseRideRouter);
app.use('/selectPassenger', selectPassengerRouter);
app.use('/manageRide', manageRideRouter);

/* -------------------------- */

/* --- For both passenger and driver page --- */
app.use('/clientHelpDesk',clientHelpRouter);
app.use('/wallet',walletRouter);
app.use('/rate',rateRouter);
app.use('/profile',profileRouter);
app.use('/logout',logoutRouter);

/* ------------------------------------------ */


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
