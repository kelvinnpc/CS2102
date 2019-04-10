  

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
require('dotenv').load();

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

/* --- V2: Adding Web Pages --- */
var aboutRouter = require('./routes/about');
/* ---------------------------- */



var findRideRouter = require('./routes/findRide');


/* --- V6: Modify Database  --- */
var registerRouter = require('./routes/register');
/* ---------------------------- */

/* --- CheeYeo: Additions to our webapp --- */
var loginRouter = require('./routes/login');
var clientHelpRouter = require('./routes/clientHelpDesk');
var manageBidsRouter = require('./routes/manageBids');
var walletRouter = require('./routes/wallet');
var regDriverRouter = require('./routes/registerAsDriver');
/* ---------------------------- */

var advertiseRideRouter = require('./routes/advertiseRide');
var driverhistoryRouter = require('./routes/driverhistory');
var selectPassengerRouter = require('./routes/selectPassenger');
var rateRouter = require('./routes/rate');
var profileRouter = require('./routes/profile');
var passengerHistoryRouter = require('./routes/passengerHistory');
var manageRideRouter = require('./routes/manageRide');
var logoutRouter = require('./routes/logout');

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

app.use('/', indexRouter);
app.use('/users', usersRouter);

/* --- V2: Adding Web Pages --- */
app.use('/about', aboutRouter);
/* ---------------------------- */
app.use('/findRide', findRideRouter);

app.use('/advertiseRide', advertiseRideRouter);
app.use('/driverhistory', driverhistoryRouter);
app.use('/selectPassenger', selectPassengerRouter);

/* --- V6: Modify Database  --- */
var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/register', registerRouter);
/* ---------------------------- */

/* --- CheeYeo: Additions to our webapp --- */
app.use('/login', loginRouter);
app.use('/clientHelpDesk',clientHelpRouter);
app.use('/manageBids',manageBidsRouter);
app.use('/wallet',walletRouter);
app.use('/registerAsDriver',regDriverRouter);
app.use('/rate',rateRouter);
app.use('/profile',profileRouter);
app.use('/passengerHistory',passengerHistoryRouter);
app.use('/manageRide', manageRideRouter);
app.use('/logout',logoutRouter);

/* ---------------------------- */



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
