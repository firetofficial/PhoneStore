const { render } = require("ejs");
const bcrypt = require("bcryptjs");

const User = require("../models/user");
exports.getLogin = (req, res, next) => {
  let message = req.flash("error");
  if (message.length > 0) {
    message = message[0];
  } else message = null;
  res.render("auth/login", {
    pageTitle: "Login",
    path: "/login",
    errorMessage: message,
  });
};

exports.postLogin = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  User.findOne({ email: email })
    .then((user) => {
      if (!user) {
        req.flash("error", "Invalid email or password");
        return res.redirect("/login");
      }
      bcrypt
        .compare(password, user.password)
        .then((doMatch) => {
          if (doMatch) {
            req.session.user = user;
            req.session.isLoggedIn = true;
            return req.session.save((err) => {
              res.redirect("/");
            });
          }
          req.flash("error", "Invalid email or password");
          res.redirect("/login");
        })
        .catch((err) => {
          console.log(err);
          res.redirect("/login");
        });
    })
    .catch((err) => console.log(err));
};
exports.postLogout = (req, res, next) => {
  req.session.destroy((err) => {
    if (err) {
      console.log(err);
    }
    res.redirect("/");
  });
};

exports.getSignup = (req, res, next) => {
  let message = req.flash("error");
  if (message.length > 0) {
    message = message[0];
  } else message = null;
  res.render("auth/signup", {
    pageTitle: "Sign up",
    path: "/signup",
    errorMessage: message,
  });
};
exports.postSignup = (req, res, next) => {
  const Fullname = req.body.Fullname;
  const email = req.body.email;
  const password = req.body.password;
  const address = req.body.address; 
  const phoneNumber = req.body.phoneNumber; 

  User.findOne({ email: email })
    .then((user) => {
      if (user) {
        req.flash(
          "error",
          "E-mail is already exist, please pick up another one"
        );
        return res.redirect("/signup");
      }
      bcrypt
        .hash(password, 12)
        .then((hashedPass) => {
          const newUser = new User({
            Fullname: Fullname,
            email: email,
            password: hashedPass,
            address: address, 
            phoneNumber: phoneNumber,
          });
          return newUser.save();
        })
        .then((result) => {
          res.redirect("/login");
        })
        .catch((err) => console.log(err));
    })
    .catch((err) => console.log(err));
};

