const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");
const session = require("express-session");
const MongoSessionStore = require("connect-mongodb-session")(session);
const csrf = require("csurf");
const flash = require("connect-flash");
require("dotenv").config();

const adminRouter = require("./routes/admin");
const shopRouter = require("./routes/shop");
const authRouter = require("./routes/auth");
const errorController = require("./controllers/error");

// DB
const mongoose = require("mongoose");
const User = require("./models/user");

const app = express();

// Thiết lập template engine là EJS
app.set("view engine", "ejs");
app.set("views", "views");

const storeSession = new MongoSessionStore({
  uri: process.env.DATABASE_URL,
  collection: "sessions",
});

app.use(express.static(path.join(__dirname, "public")));

// Xử lý dữ liệu đầu vào
app.use(bodyParser.urlencoded({ extended: false }));

// Sử dụng session middleware
app.use(
  session({
    secret: "My secret",
    resave: false,
    saveUninitialized: false,
    store: storeSession,
  })
);

const csrfProtection = csrf();
app.use(csrfProtection);

app.use(flash());

// Middleware để đặt các biến cục bộ, isAuthenticated, isAdmin và csrfToken, sẽ được truy cập từ tất cả các template
app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.isAdmin = req.session.user ? req.session.user.isAdmin : false;
  res.locals.csrfToken = req.csrfToken();
  next();
});

// Middleware để kiểm tra người dùng đã đăng nhập hay chưa và gán thông tin người dùng cho mỗi request
app.use((req, res, next) => {
  if (!req.session.user) {
    next();
  } else {
    User.findById(req.session.user._id)
      .then((user) => {
        req.user = user;
        next();
      })
      .catch((err) => console.log(err));
  }
});

app.use("/admin", adminRouter);
app.use(shopRouter);
app.use(authRouter);

app.use(errorController.get404);

mongoose
  .connect(process.env.DATABASE_URL)
  .then((result) => {
    console.log("Connected");
    app.listen(3000);
  })
  .catch((err) => console.log(err));
