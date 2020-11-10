const bodyParser = require("body-parser");
const express = require("express");
const mongoose = require("mongoose");
const hbs = require("./hbs");
const flash = require("connect-flash");

const passport = require("passport");
const session = require("express-session");

const Manga = require("./models/manga");

const { ensureAuthenticated, authenticate } = require("./config/auth");

const routerManga = require("./router/manga");
const routerUser = require("./router/user");

require("./config/passport")(passport);
require("dotenv").config();

const url = process.env.MONGODB;
const port = process.env.PORT;

const app = express();

app.engine("hbs", hbs.engine);
app.set("view engine", "hbs");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(
	session({
		resave: true,
		saveUninitialized: true,
		secret: "somesecret",
		cookie: {
			secure: false,
			maxAge: 900000,
		},
	})
);

app.use(passport.initialize());
app.use(passport.session());

app.use(flash());

app.use((req, res, next) => {
	res.locals.success_msg = req.flash("success_msg");
	res.locals.error_msg = req.flash("error_msg");
	res.locals.error = req.flash("error");
	next();
});

mongoose
	.connect(url, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
		useCreateIndex: true,
		useFindAndModify: false,
	})
	.then(() => console.log("MongoDB connected..."))
	.catch((err) => console.log(err));

let config = {
	blogsPerPage: 9,
};

getQuantity();

app.get("/", async (req, res) => {
	let index = () => (!req.query.page ? 1 : req.query.page);
	let array = arrayPage(
		index(),
		Math.ceil(config.quantity / config.blogsPerPage)
	);

	let fromDate = new Date();
	let toDate = new Date();

	toDate.setDate(toDate.getDate() - 7);

	let newChapter = await Manga.find(
		{},
		{ title: 1, tags: 1, count_view: 1, avatar: 1 }
	)
		.limit(4)
		.sort({ newest_date: -1 });

	let newManga = await Manga.find(
		{},
		{ title: 1, tags: 1, count_view: 1, avatar: 1, count_chapter: 1 }
	)
		.limit(config.blogsPerPage)
		.skip((index() - 1) * config.blogsPerPage)
		.sort({ upload_date: -1 });

	let topPoint = await Manga.aggregate([
		{
			$project: {
				count_vote: { $size: { $ifNull: ["$vote", []] } },
				point: 1,
				title: 1,
				tags: 1,
				avatar: 1,
				author: 1,
			},
		},
		{ $match: { count_vote: { $gte: 1 } } },
		{
			$project: {
				point: { $divide: ["$point", "$count_vote"] },
				title: 1,
				tags: 1,
				avatar: 1,
				author: 1,
			},
		},
		{
			$sort: { point: -1 },
		},
		{ $limit: 4 },
	]).then((result) => {
		return result;
	});

	await findMangaByTime(fromDate, toDate).then((topWeek) => {
		res.render("index", {
			manga: newManga,
			newChapter: newChapter,
			topWeek: topWeek,
			topPoint: topPoint,
			user: req.user,
			array: array,
		});
	});
});

app.post("/find-manga/top-day", async (req, res) => {
	let fromDate = new Date();
	let toDate = new Date();

	toDate.setDate(toDate.getDate() - 1);

	await findMangaByTime(fromDate, toDate).then((result) => {
		res.send(result);
	});
});

app.post("/find-manga/top-week", async (req, res) => {
	let fromDate = new Date();
	let toDate = new Date();

	toDate.setDate(toDate.getDate() - 7);

	await findMangaByTime(fromDate, toDate).then((result) => {
		res.send(result);
	});
});

app.post("/find-manga/top-month", async (req, res) => {
	let fromDate = new Date();
	let toDate = new Date();

	toDate.setMonth(toDate.getMonth() - 1);

	await findMangaByTime(fromDate, toDate).then((result) => {
		res.send(result);
	});
});

app.get("/find/search_page", async (req, res) => {
	res.render("manga-filter", { user: req.user });
});

app.post("/find/search_page", async (req, res) => {
	let sub_title = `.*${req.body.sub_title.trim()}.*`;

	let type_sort = req.body.order_by;
	let sort, manga;

	if (type_sort === "title") {
		sort = { [type_sort]: 1 };
	} else {
		sort = { [type_sort]: -1 };
	}

	if (!req.body.genre) {
		manga = await Manga.find(
			{
				count_chapter: { $gte: req.body.chapter },
				realName: { $regex: sub_title, $options: "i" },
			},
			{
				title: 1,
				count_view: 1,
				count_chapter: 1,
				avatar: 1,
				upload_date: 1,
				state: 1,
				tags: 1,
			}
		).sort(sort);
	} else {
		manga = await Manga.find(
			{
				tags: { $all: req.body.genre },
				count_chapter: { $gte: req.body.chapter },
				title: { $regex: sub_title, $options: "i" },
			},
			{
				title: 1,
				count_view: 1,
				count_chapter: 1,
				avatar: 1,
				upload_date: 1,
				state: 1,
				tags: 1,
			}
		).sort(sort);
	}

	res.render("manga-filter", { manga: manga, user: req.user });
});

function ok(res) {}

app.use("/manga", ensureAuthenticated, routerManga);
app.use("/user", routerUser);

app.use(express.static("public"));
app.use(express.static("uploads"));
app.use(express.static("avatars"));

app.set("json spaces", 2);

async function getQuantity() {
	await Manga.countDocuments({}).then((result) => {
		config.quantity = result;
		return;
	});
}

function arrayPage(index, max) {
	let array = [];
	if (max <= 5) {
		for (let i = 1; i <= max; i++) {
			array.push(i);
		}
		return array;
	}
	if (index <= 2) {
		for (let i = 1; i <= 4; i++) {
			array.push(i);
		}
		array.push(max);
		return array;
	} else if (index + 2 >= max) {
		for (let i = max - 4; i <= max; i++) {
			array.push(i);
		}
		return array;
	} else {
		for (let i = index - 1; i <= index + 2; i++) {
			array.push(i);
		}
		array.push(max);
		return array;
	}
}

async function findMangaByTime(fromDate, toDate) {
	return await Manga.aggregate(
		[
			{ $unwind: "$view" },
			{
				$match: {
					view: { $lt: fromDate, $gte: toDate },
				},
			},
			{
				$group: {
					_id: "$_id",
					title: { $first: "$title" },
					avatar: { $first: "$avatar" },
					count_chapter: { $first: "$count_chapter" },
					file_storage: { $first: "$file_storage" },
					count_followed: { $first: "$count_followed" },
					count_view: { $sum: 1 },
				},
			},
			{
				$sort: { count_view: -1 },
			},
			{ $limit: 4 },
		],
		function (err, result) {
			return result;
		}
	);
}

app.listen(port, () => {
	console.log("Server is starting at port " + port);
});
