const bodyParser = require("body-parser");
const express = require("express");
const mongoose = require("mongoose");
const hbs = require("./hbs");
const flash = require("connect-flash");

const passport = require("passport");
const session = require("express-session");

const Manga = require("./models/manga");

// const { ensureAuthenticated, authenticate } = require("./config/auth");

// const routerManga = require("./router/manga");
// const routerUser = require("./router/user");

//require("./config/passport")(passport);
require("dotenv").config();

const url = process.env.MONGODB;
const port = process.env.PORT;

const app = express();

app.engine("hbs", hbs.engine);
app.set("view engine", "hbs");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// app.use(
// 	session({
// 		resave: true,
// 		saveUninitialized: true,
// 		secret: "somesecret",
// 		cookie: {
// 			secure: false,
// 			maxAge: 900000,
// 		},
// 	})
// );

// app.use(passport.initialize());
// app.use(passport.session());

//app.use(flash());

// app.use((req, res, next) => {
// 	res.locals.success_msg = req.flash("success_msg");
// 	res.locals.error_msg = req.flash("error_msg");
// 	res.locals.error = req.flash("error");
// 	next();
// });

mongoose
	.connect(url, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
		useCreateIndex: true,
		useFindAndModify: false,
	})
	.then(() => console.log("MongoDB connected..."))
	.catch((err) => console.log(err));

// app.get("/", authenticate, async (req, res) => {
// 	res.render("index");
// });

app.get("/", async (req, res) => {
	await Manga.find({}).then((manga) => {
		console.log(manga);
		res.render("index", { manga });
	});
});

// app.use("/manga", ensureAuthenticated, routerManga);
// app.use("/user", routerUser);

app.use(express.static("public"));
app.use(express.static("uploads"));

app.set("json spaces", 2);

app.listen(port, () => {
	console.log("Server is starting at port " + port);
});
