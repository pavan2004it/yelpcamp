let express = require('express'),
    router = express.Router({mergeParams: true}),
    Campground = require("../models/campgrounds"),
    Comment    = require("../models/comment"),
    middleware = require("../middleware")



//Comments Routes

// New Comments



router.get("/new", middleware.isLoggedIn,function (req, res) {
    Campground.findById(req.params.id, function (err, campground) {
        if(err){
            console.log(err)
        }else {
            res.render("comments/new", {campground: campground})
        }
    })
})


// Add Comments
router.post("/", middleware.isLoggedIn, function (req, res) {
    Campground.findById(req.params.id, function (err, campground) {
        if(err){
            console.log(err)
            res.redirect("/campgrounds")
        }else {
            req.body.comment.text = req.sanitize(req.body.comment.text);
            Comment.create(req.body.comment, function (err, comment) {
                if(err){
                    req.flash("error", "Something went wrong!")
                    console.log(err)
                }else{
                    // add user and id to comment
                    comment.author.id = req.user._id;
                    comment.author.username = req.user.username;
                    comment.save()
                    campground.comments.push(comment);
                    campground.save();
                    req.flash("success", "Successfully added comment");
                    res.redirect("/campgrounds/" + campground._id)
                }
            })
        }
    })
})

//Edit Comments

router.get("/:comment_id/edit", middleware.checkCommentOwnership, function (req, res) {

    Comment.findById(req.params.comment_id, function (err, foundComment) {
        if(err){
            re.redirect("back")
        }else{
            res.render("comments/edit", {campground_id: req.params.id, comment: foundComment})
        }
    })
})

// Update Comments

router.put("/:comment_id", middleware.checkCommentOwnership, function (req, res) {

    req.body.comment.text = req.sanitize(req.body.comment.text);
    Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function (err, updatedComments) {
        if(err){
            res.redirect("back")
        }else{
            res.redirect("/campgrounds/" + req.params.id)
        }
    })
})

// Delete Comments

router.delete("/:comment_id", middleware.checkCommentOwnership, function (req, res) {
    Comment.findByIdAndDelete(req.params.comment_id, function (err) {
            if(err){
                res.redirect("back")
            }else{
                req.flash("success", "Comment deleted")
                res.redirect("/campgrounds/" + req.params.id)
            }
    })
})


// Export

module.exports = router;