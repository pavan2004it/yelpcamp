let express = require('express'),
    router = express.Router(),
    Campground = require("../models/campgrounds"),
    middleware = require("../middleware"),
    moment = require('moment');



// Index - Show all campgrounds

router.get("/", function (req, res) {
    Campground.find({}, function (err, allCampgrounds) {
        if(err){
            console.log(err)
        }else{
            res.render("campgrounds/index", {campgrounds:allCampgrounds})
        }
    })
})

//Create - add new campground to DB

router.post("/", middleware.isLoggedIn, function (req, res) {
    console.log(req.body)
    let camp_name = req.body.name;
    let price = req.body.price;
    let image = req.body.image;
    let desc = req.body.description;
    let author = {
        id: req.user._id,
        username: req.user.username
    }
    let camp = {name: camp_name, price: price, image:image, description:desc, author: author}

    Campground.create(camp, function (err, newlyCreated) {
        if(err){
            console.log(err)
        }else{
            res.redirect("/campgrounds")
        }
    })
})

//New - show form to create new campgrounds
router.get("/new", middleware.isLoggedIn, function (req, res) {
    res.render("campgrounds/new")
})



//Show - Shows more info about a campground
router.get("/:id", function (req, res) {
    Campground.findById(req.params.id).populate("comments").exec(function (err, foundCampground) {
        if(err){
            console.log(err)
        }else{
            res.render("campgrounds/show", {campground: foundCampground, moment: moment})
        }
    })

})

//Edit routes
router.get("/:id/edit", middleware.checkCampgroundOwnership, function (req, res) {
    Campground.findById(req.params.id, function (err, foundCampground) {
        if(err){
            res.redirect("/campgrounds")
        }else{
            res.render("campgrounds/edit", {campground: foundCampground})
        }
    })
})

//Update route

router.put("/:id", middleware.checkCampgroundOwnership, function (req, res) {
    Campground.findByIdAndUpdate(req.params.id, req.body.campground, function (err, updatedCampground) {
        if(err){
            res.redirect("/campgrounds")
        }else{
            res.redirect("/campgrounds/" + req.params.id)
        }
    })
})

//Delete campground

router.delete("/:id", middleware.checkCampgroundOwnership, function (req, res) {
    Campground.findByIdAndDelete(req.params.id, function (err, delCampground) {
        if(err){
            res.redirect("/campgrounds")
        }else{
            console.log(delCampground)
            res.redirect("/campgrounds")
        }
    })
})



module.exports = router;