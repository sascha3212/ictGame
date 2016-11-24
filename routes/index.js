var express = require('express');
var passport = require('passport');
var router = express.Router();
var db = require('./../database_handler')();

var env = {
    AUTH0_CLIENT_ID: process.env.AUTH0_CLIENT_ID,
    AUTH0_DOMAIN: process.env.AUTH0_DOMAIN,
    AUTH0_CALLBACK_URL: process.env.AUTH0_CALLBACK_URL || 'http://localhost:3000/callback'
};

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('index', {title: 'FlyingCode', env: env});
});

router.get('/login',
    function (req, res) {
        res.render('login', {env: env});
    });

// Perform session logout and redirect to homepage
router.get('/logout', function (req, res) {
    req.logout();
    res.redirect('/');
});

router.get('/insert_score/:score', function (req, res) {
    db.get("SELECT * FROM highscore WHERE id = ?", [req.user.id], function (err, res) {
        if (res) {
            //Check highscore in DB
            db.get("SELECT score FROM highscore WHERE id = ?", [req.user.id], function (err, res) {
                if (err) {
                    cronsole.log("Score select error:" + err);
                }
                if (req.params.score > res.score) {
                    //update
                    db.run("UPDATE highscore SET score = ? WHERE id = ?", [req.params.score, req.user.id], function (err) {
                        if (err) {
                            console.log("Update error:" + err);
                        }
                    });
                }
            });
        } else {
            db.run("INSERT INTO highscore (id,nickname,score) VALUES (?,?,?)", [req.user.id, req.user.nickname, req.params.score], function (err) {
                if (err) {
                    console.log("Insert error:" + err);
                }
            });
        }
    });
});

// Perform the final stage of authentication and redirect to '/user'
router.get('/callback',
    passport.authenticate('auth0', {failureRedirect: '/url-if-something-fails'}),
    function (req, res) {
        res.redirect(req.session.returnTo || '/user');
    }
);


module.exports = router;
