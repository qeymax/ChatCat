module.exports = function (passport, facebookStrategy, config, mongoose) {    
    var userSchema = new mongoose.Schema({
        profileID: String,
        fullname: String,
        profilePic: String
    })

    var User = mongoose.model("User", userSchema);

    passport.serializeUser(function (user, done) {
        done(null, user.id);
    });
    passport.deserializeUser(function (id, done) {
        User.findById(id, function (err, user) {
            done(err, user);
        });
    });


    passport.use(new facebookStrategy({
        clientID: config.fb.appID,
        clientSecret: config.fb.appSecret,
        callbackURL: config.fb.callbackURL,
        profileFields: ["id" , "displayName" , "photos"]
    }, function (accessToken, refreshToken, profile, done) {
        User.findOne({ "pofileID": profile.id }, function (err, user) {
            if (user) {
                done(null, user);
            } else {
                var newUser = new User({
                    profileID: profile.id,
                    fullname: profile.displayName,
                    profilePic: profile.photos[0].value || ""
                });

                newUser.save(function (err) {
                    done(null, newUser);
                });
            }
        })
    }))
}