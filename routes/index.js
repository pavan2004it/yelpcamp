let express = require('express'),
    router = express.Router(),
    passport = require('passport'),
    User = require("../models/user"),
    async = require('async'),
    crypto = require('crypto'),
    nodemailer = require('nodemailer')



// Landing Page

router.get("/", function (req, res) {
    res.render("landing");
})



// Auth Routes

// Show register form

router.get("/register", function (req, res) {
    res.render("register")
})

//handle signup logic

router.post("/register", function (req, res) {
    let newUser = new User({username: req.body.username, email: req.body.email});
    User.register(newUser, req.body.password, function (err, user) {
        if(err){
            req.flash("error", err.message);
            // return res.render("register" , {"error": err.message});
            return res.redirect("/register");
        }
        passport.authenticate("local")(req, res, function () {
            req.logout();
            // res.redirect("/campgrounds");
            res.redirect("/login");
        });
    })
})


// Show Login form

router.get("/login", function (req, res) {
    res.render("login")
})

// Login Logic

router.post("/login", passport.authenticate("local", {
    successRedirect: "/campgrounds",
    failureRedirect: "/login",
    failureFlash: "Invalid Username or Password",
    successFlash: "Welcome to YelpCamp"
}), function (req, res) {
})

// Logout route

router.get("/logout", function (req, res) {
    req.logout();
    req.flash("success", "Logged you out");
    res.redirect("/");
})

// Reset Password

router.get("/forgot", function (req, res) {
    res.render('forgot')
})

router.post("/forgot", function (req, res, next) {
    async.waterfall([
        function (done) {
            crypto.randomBytes(20, function (err, buf) {
                let token = buf.toString('hex')
                done(err, token)
            })
        },
        function (token, done) {
            User.findOne({email: req.body.email}, function (err, user) {
                if(!user){
                    req.flash('error', 'No account with that email address exists')
                    return res.redirect("/forgot")
                }
                user.resetPasswordToken = token;
                user.resetPasswordExpires = Date.now() + 36000000;
                user.save(function (err) {
                    done(err, token, user)
                })
            })
        },
        function (token, user, done) {
            let smtpTransport = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: 'nubewired@gmail.com',
                    pass: process.env.GMAILPW
                }
            })
            let mailOptions= {
                to: user.email,
                from: 'nubewired@gmail.com',
                subject: 'Yelpcamp Password reset',
                text: 'You are receiving this email since you have requested for the password reset please click on the following link ' +
                    'http://' + req.headers.host + '/reset/' + token + '\n\n' + 'If you did not request password reset ignore this email'
            }
            smtpTransport.sendMail(mailOptions, function (err) {
                console.log('mail sent')
                req.flash('success', 'An email has been sent to ' + user.email + ' with further instructions')
                done(err, 'done')
            })
        }
    ], function (err) {
        if(err) return next(err);
        res.redirect('/forgot')
    })
})

// reset routes

router.get('/reset/:token', function (req, res) {
    User.findOne({resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function (err, user) {
            if(!user){
                req.flash('error', "Password reset token is invalid or expired.")
                return res.redirect('/forgot')
            }
            res.render('reset', {token: req.params.token})
    })
})

router.post('/reset/:token', function (req, res) {

    async.waterfall([
        function (done) {
            User.findOne({resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() }}, function (err, user) {
                if(!user){
                    req.flash('error', 'Password reset token is invalid or has expired')
                    return res.redirect('back')
                }
                if(req.body.password === req.body.confirm){
                    user.setPassword(req.body.password, function (err) {
                        user.resetPasswordToken = undefined
                        user.resetPasswordExpires = undefined
                        user.save(function (err) {
                            req.logIn(user, function (err) {
                                done(err, user)
                            })
                        })
                    })
                }else{
                    req.flash('error', "Passwords do not match")
                    return res.redirect('back')
                }
            })
        },
        function (user, done) {
            let smtpTransport = nodemailer.createTransport({
                service: 'Gmail',
                auth: {
                    user: 'learntocodeinfo@gmail.com',
                    pass: process.env.GMAILPW
                }
            })
            let mailOptions = {
                to: user.email,
                from: 'learntocodeinfo@gmail.com',
                subject: 'Your Password has been changed',
                text: 'Hello, \n\n' +
                    'This is a confirmation that password for your account ' + user.email  + ' has been changed'
            }
            smtpTransport.sendMail(mailOptions, function (err) {
                req.flash('success', 'Success your password has been changed!!!')
                done(err)
            })
        }
    ], function (err) {
            res.redirect('/campgrounds')
        })

})

module.exports = router;