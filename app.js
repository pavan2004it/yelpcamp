require('dotenv').config()


let express = require('express'),
    app = express(),
    bodyParser = require('body-parser'),
    mongoose = require('mongoose'),
    passport = require('passport'),
    moment = require('moment-timezone')
    LocalStrategy = require('passport-local'),
    User = require('./models/user'),
    Campground = require("./models/campgrounds"),
    Comment = require("./models/comment"),
    methodOverride = require('method-override'),
    flash = require('connect-flash'),
    expressSanitizer = require('express-sanitizer')


//Routes

let commentRoutes    = require("./routes/comments")
    campgroundRoutes = require("./routes/campgrounds")
    authRoutes       = require("./routes/index")

// Mongoose Configuration
mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useUnifiedTopology', true);
mongoose.set('useNewUrlParser', true);

let url = process.env.DATABASEURL || "mongodb://localhost/yelp_camp_v10"
// mongoose.connect("mongodb://localhost/yelp_camp_v10");
mongoose.connect(url,{ useNewUrlParser: true });


// Passport config

app.use(require("express-session")({
    secret: "Rusty is the cutest dog again",
    resave: false,
    saveUninitialized: false
}))


app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"))
app.use(methodOverride("_method"));
app.use(flash());
app.use(bodyParser.urlencoded({extended: true}));
app.use(expressSanitizer());


app.use(function (req, res, next) {
    res.locals.currentUser = req.user;
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    next();
})

app.use(authRoutes);
app.use("/campgrounds",campgroundRoutes);
app.use("/campgrounds/:id/comments",commentRoutes);

let port = process.env.PORT || 3000;
app.listen(port, function () {
    console.log("Yelpcamp server has started")
});