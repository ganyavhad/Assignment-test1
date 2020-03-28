const express = require("express");
const app = express();
const path = require("path");

const mongoose = require("mongoose");

const session = require("express-session");

mongoose.connect("mongodb://localhost:27017/test1", {
  useUnifiedTopology: true,
  useNewUrlParser: true
});

app.set("view engine", "ejs");
const User = require("./user");

// midleware for parsing data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: "test",
    resave: false,
    saveUninitialized: false,
    cookie: {
      expires: 600000
    }
  })
);
app.use(require("cookie-parser")());

const passport = require("passport");
const FacebookStrategy = require("passport-facebook").Strategy;

passport.use(
  new FacebookStrategy(
    {
      clientID: "FACEBOOK_APP_ID",
      clientSecret: "FACEBOOK_SECRETE",
      callbackURL: "http://localhost:5000/facebook/callback",
      profileFields: ["id", "displayName", "gender", "photos", "email"]
    },
    function(accessToken, refreshToken, profile, done) {
      done(null, profile);
    }
  )
);

app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(path.join(__dirname, "public")));

app.get("/", function(req, res) {
  res.render("index");
});

app.get("/kycform", function(req, res) {
  if (req.session && req.session.passport) {
    let userName = req.session.passport.user.displayName;
    res.render("kycform", { userName: userName });
  } else {
    res.redirect("/");
  }
});

app.get("/facebook", passport.authenticate("facebook"));

passport.serializeUser(function(user, cb) {
  cb(null, user);
});

passport.deserializeUser(function(obj, cb) {
  cb(null, obj);
});
app.get(
  "/facebook/callback",
  passport.authenticate("facebook", {
    successRedirect: "/kycform",
    failureRedirect: "/"
  })
);

// users operation
app.post("/user/save", (req, res) => {
  let user = new User({
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    mobile: req.body.mobile,
    email: req.body.email
  });
  user.save(function(err, userData) {
    if (err) {
      res.json("Error while saving user");
    } else {
      res.redirect("/user");
    }
  });
});

app.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/");
});

app.get("/user", (req, res) => {
  if (req.session && req.session.passport) {
    let userName = req.session.passport.user.displayName;
    User.find({}).exec(function(err, users) {
      if (err) {
        res.join("Error while fetching users");
      } else {
        res.render("users", { users: users, userName: userName });
      }
    });
  } else {
    res.redirect("/");
  }
});
app.listen(5000, () => {
  console.log("Listening on 5000");
});
