const express = require("express");
const multer = require("multer");
const fs = require("fs-extra");
const methodOverride = require("method-override");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const Manga = require("../models/manga");
const User = require("../models/user");
const ObjectId = mongoose.Types.ObjectId;

let router = express.Router();

router.use(methodOverride("_method"));

router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());

// router.get("/", async (req, res) => {
// 	let manga = await Manga.find({}, { review: 0, chapter: 0, followed: 0 })
// 		.sort({ upload_date: -1 })
// 		.lean();

// 	res.render("manga", { manga: manga, user: req.user });
// });

router.get("/:id", async (req, res) => {
	let isLiked = req.user.following.includes(req.params.id);
	await Manga.aggregate(
		[
			{
				$match: {
					_id: ObjectId(req.params.id),
				},
			},
			{
				$project: {
					title: 1,
					author: 1,
					description: 1,
					tags: 1,
					state: 1,
					count_view: 1,
					upload_date: 1,
					avatar: 1,
					point: 1,
					count_vote: {
						$cond: {
							if: { $isArray: "$vote" },
							then: { $size: "$vote" },
							else: "NA",
						},
					},
					count_chapter: {
						$cond: {
							if: { $isArray: "$chapter" },
							then: { $size: "$chapter" },
							else: "0",
						},
					},
				},
			},
		],
		function (err, result) {
			res.render("anime-details", {
				manga: result[0],
				isLiked,
				user: req.user,
			});
		}
	);

	//await Manga.findOne({ _id: req.params.id }).then((manga) => {});
});

router.get("/new/upload", async (req, res) => {
	res.render("new-manga");
});

router.get("/edit/:id", async (req, res) => {
	let manga = await Manga.findOne({ _id: req.params.id }).lean();
	res.render("edit_manga", { manga: manga });
});

router.get("/:id/:chapter/read", async (req, res) => {
	let index = req.params.chapter - 1;

	await Manga.aggregate(
		[
			{
				$match: {
					_id: ObjectId(req.params.id),
				},
			},
			{
				$project: {
					title: 1,
					chapter: { $arrayElemAt: ["$chapter", index] },
				},
			},
		],
		function (err, result) {
			res.render("anime-watching", { manga: result[0] });
		}
	).then(async function () {
		// await User.updateOne(
		// 	{ _id: req.user._id },
		// 	{ $addToSet: { history: req.params.id } }
		// );
		// await Manga.updateOne(
		// 	{ _id: req.params.id },
		// 	{ $inc: { count_view: 1 }, $push: { view: Date.now() } }
		// );
	});
});

router.get("/edit/:id/:chapter", async (req, res) => {
	let manga = await Manga.findOne(
		{ _id: req.params.id },
		{ chapter: 1 }
	).lean();

	let index = req.params.chapter - 1;
	let chapter = await manga.chapter[index];

	res.render("edit_chapter", { chapter: chapter, manga_id: manga._id });
});

router.get("/find-manga/top-month", async (req, res) => {
	let fromDate = new Date();
	let toDate = new Date();

	toDate.setMonth(toDate.getMonth() - 1);

	findMangaByTime(fromDate, toDate, res, 1);
});

router.get("/find-manga/top-week", async (req, res) => {
	let fromDate = new Date();
	let toDate = new Date();

	toDate.setDate(toDate.getDate() - 7);

	findMangaByTime(fromDate, toDate, res, 1);
});

router.get("/find-manga/genre", async (req, res) => {
	let manga = await Manga.find({
		tags: { $all: ["Fantasy"] },
		state: true,
	});

	res.json(manga);
});

router.delete("/delete/:id", async (req, res) => {
	await Manga.deleteOne({ _id: req.params.id }, (err, result) => {
		res.redirect("/manga");
	});
});

const uploadManga = multer({
	storage: multer.diskStorage({
		destination: async (req, file, callback) => {
			let path;
			if (req.query._method == "PUT") {
				let manga = await Manga.findOne(
					{ _id: req.params.id },
					{ review: 0, chapter: 0, followed: 0 }
				);
				req.manga = manga;
				path = `./uploads/${manga.file_storage}`;
			} else {
				let extName = randomStr(5);
				req.extName = extName;
				path = `./uploads/${req.body.folder_name}_${extName}`;
			}

			fs.mkdirsSync(path);
			callback(null, path);
		},
		filename: (req, file, callback) => {
			callback(null, file.originalname);
		},
	}),
});

const uploadChapter = multer({
	storage: multer.diskStorage({
		destination: async (req, file, callback) => {
			let path, manga;
			manga = await Manga.findOne({ _id: req.params.id });
			req.manga = manga;
			path = `./uploads/${manga.file_storage}/${req.params.chapter}`;
			fs.mkdirsSync(path);
			callback(null, path);
		},
		filename: (req, file, callback) => {
			callback(null, file.originalname);
		},
	}),
});

router.post("/", uploadManga.single("file"), async (req, res) => {
	const manga = new Manga({
		title: `${req.body.manga_title}_${req.extName}`,
		tags: req.body.genre,
		author: req.body.manga_author,
		description: req.body.description,
		avatar: `${req.body.manga_title}_${req.extName}/${req.file.filename}`,
	});

	await manga.save(async function (err, result) {
		req.user.upload_manga.push(result._id);
		await req.user.save();
	});

	res.redirect("/");
});

router.put(
	"/edit/:id/:chapter",
	uploadChapter.any("file"),
	async (req, res) => {
		let manga;
		let index = req.params.chapter - 1;

		if (!req.manga) {
			manga = await Manga.findOne({ _id: req.params.id });
		} else {
			manga = req.manga;
			manga.chapter[index].images = getImagesPath(manga, req);
		}

		manga.chapter[index].chapter_title = req.body.chapter_title;

		await manga.save();
		res.redirect(`/manga/${manga.title}`);
	}
);

router.put("/edit/:id", async (req, res) => {
	let manga;
	if (!req.manga) {
		manga = await Manga.findOne(
			{ _id: req.params.id },
			{ review: 0, chapter: 0, followed: 0 }
		);
	} else {
		manga = req.manga;
		manga.avatar = `${manga.file_storage}/${req.file.filename}`;
	}

	manga.title = `${req.body.manga_title}_${randomStr(5)}`;
	manga.author = req.body.manga_author;
	manga.tags = req.body.kind;
	manga.description = req.body.description;

	await manga.save().then(() => {
		res.redirect("/manga");
	});
});

router.post("/review/:id", async (req, res) => {
	let review = {
		user: req.user._id,
		content: req.body.comment,
	};

	let manga = await Manga.findOneAndUpdate(
		{ _id: req.params.id },
		{ $push: { review: { $each: [review], $position: 0 } } },
		{ new: true }
	).select("review");

	res.send(manga.review[0]);
});

router.post("/review/:id/reply", async (req, res) => {
	let reply = {
		user: req.user._id,
		content: req.body.reply,
	};

	let manga = await Manga.findOneAndUpdate(
		{
			_id: req.params.id,
			"review._id": req.body.id,
		},
		{
			$push: { "review.$.reply": { $each: [reply], $position: 0 } },
		},
		{
			new: true,
		}
	).select("review");

	res.send(manga.review[0].reply[0]);
});

router.post("/review/:id/show_reply", async (req, res) => {
	let manga = await Manga.find(
		{
			_id: req.params.id,
		},
		{
			review: { $elemMatch: { _id: req.body.id } },
		}
	);

	res.send(manga[0].review[0].reply);
});

router.post("/:id/like", async (req, res) => {
	await User.updateOne(
		{ _id: req.user._id },
		{ $addToSet: { following: req.params.id } }
	).then(async (result) => {
		if (result.nModified == 1) {
			res.send({ isLiked: true });

			await Manga.updateOne(
				{ _id: req.params.id },
				{ $inc: { count_followed: 1 } },
				{ new: true }
			);
		} else {
			res.send({ isLiked: false });

			await User.updateOne(
				{ _id: req.user._id },
				{
					$pull: { following: req.params.id },
				}
			);

			await Manga.updateOne(
				{ _id: req.params.id },
				{ $inc: { count_followed: -1 } },
				{ new: true }
			);
		}
	});
});

router.post("/:id/rate", async (req, res) => {
	let manga = await Manga.findOne(
		{ _id: req.params.id },
		{ vote: 1, point: 1 }
	);
	let added = manga.vote.addToSet(req.user._id);
	if (added.length) {
		res.send({ isRated: false });
		manga.point += parseInt(req.body.point);

		await manga.save();
	} else {
		res.send({ isRated: true });
	}
});

router.post(
	"/:id/:chapter/read",
	uploadChapter.any("file"),
	async (req, res) => {
		let manga = req.manga;

		const chapter = {
			chapter_title: req.body.chapter_title,
			chapter_index: req.params.chapter,
			images: getImagesPath(manga, req),
		};

		manga.chapter.push(chapter);
		await manga.save();

		res.redirect(`/manga/${manga.title}`);
	}
);

function getImagesPath(manga, req) {
	let savePath = [];
	req.files.forEach((file) => {
		savePath.push(
			`${manga.file_storage}/${req.params.chapter}/${file.filename}`
		);
	});
	return savePath;
}

function randomStr(len) {
	let ans = "";
	let arr = "0123456789";
	for (let i = len; i > 0; i--) {
		ans += arr[Math.floor(Math.random() * arr.length)];
	}
	return ans;
}

async function findMangaByTime(fromDate, toDate, res, source) {
	await Manga.aggregate(
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
					file_storage: { $first: "$file_storage" },
					count_followed: { $first: "$count_followed" },
					count_view: { $sum: 1 },
				},
			},
			{
				$sort: { count_view: -1 },
			},
		],
		function (err, result) {
			res.json(result);
		}
	);
}

router.use(express.static("public"));
router.use(express.static("uploads"));

module.exports = router;
