var express = require("express");
var app = express();
var path = require("path");
var routes = require("./routes/routes");
var cookieParser = require("cookie-parser");
var session = require("express-session");
var connectMonge = require("connect-mongo")(session);
var mongoose = require("mongoose");
var config = require("./config.json");
var passport = require("passport");
var facebookStrategy = require("passport-facebook");
var rooms = require("./rooms.json");

app.engine("html", require("hogan-express"));
app.set("view engine", "html");
app.use(express.static(path.join(__dirname, "public")));
app.use(cookieParser());

var env = process.env.NODE_ENV || "development";
var secret = process.env.SESSIONSECRET || "secret word";
var dbUrl = process.env.DBURL || "mongodb://chatcat:chatcatpassword@ds031995.mlab.com:31995/mychatcat";
var port = process.env.PORT || 3000;
if (env === "development") {
    app.use(session({
        secret: secret,
        resave: true,
        saveUninitialized: true
    }));
} else if (env === "production") {
    app.use(session({
        secret: secret,
        store: new connectMonge({mongooseConnection: mongoose.connections[0] , stringify: true}),
        resave: true,
        saveUninitialized: true
    }));
}

app.use(passport.initialize());
app.use(passport.session());

require("./auth/passportAuth")(passport , facebookStrategy , config , mongoose);
mongoose.connect(dbUrl);



app.use(routes)




// app.listen(3000, function () {
//     console.log("started");
// });
app.set("port", port);
var server = require("http").createServer(app);
var io = require("socket.io").listen(server);
require("./socket/socket")(io , rooms);
server.listen(app.get("port"), function () {
    console.log("started");
});