var express = require('express');
var router = express.Router();

// router.get('/', function(req, res, next) {
//   res.render('about', { title: 'About', user: 'kelvin' });
// });

router.get('/', about);

function about(req,res,next){
  basic(req,res,'about', {});
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
