var express = require("express");
var router = express.Router();
var passport = require("passport");
var config = require("../config.json");
var rooms = require("../rooms.json");

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        next();
    } else {
        res.redirect("/");
    }
}


router.get("/", function (req, res, next) {
    res.render("index", { title: "ChatCat" });
});

router.get("/chatrooms",isLoggedIn, function (req, res, next) {
    res.render("chatrooms", { title: "ChatCat"  , user: req.user});
});

router.get("/room/:id", isLoggedIn, function (req, res, next) {
    var room_name = findTitle(req.params.id);
    if (!room_name) {
        res.render("chatrooms", { title: "ChatCat"  , user: req.user});
    }
    res.render("room", { user: req.user, room_number: req.params.id, room_name: room_name, config: config });
});

function findTitle(room_number) {
    var n = 0;
    while (n < rooms.length) {
        if (rooms[n].room_number == room_number) {
            return rooms[n].room_name;
        } else {
            n++;
        }
    }
}

router.get("/auth/facebook", passport.authenticate("facebook"));

router.get("/auth/facebook/callback", passport.authenticate("facebook", {
    successRedirect: "/chatrooms",
    failureRedirect: "/"
}));

router.get("/logout", function (req, res, next) {
    req.logout();
    res.redirect("/");
})

module.exports = router;