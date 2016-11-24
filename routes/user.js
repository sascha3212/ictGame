var express = require('express');
var passport = require('passport');
var ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn();
var router = express.Router();
var db = require('./../database_handler')();
var highcores;
/* GET user profile. */
router.get('/', ensureLoggedIn, function (req, res, next) {
    db.all("SELECT * FROM highscore ORDER BY score DESC",function (err,result) {
        res.render('user', {
            user: req.user,
            highscores: result
        });
    });
});

module.exports = router;
