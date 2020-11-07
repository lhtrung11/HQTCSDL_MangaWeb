const express = require("express");
const bcrypt = require("bcrypt");
const passport = require("passport");
const methodOverride = require("method-override");

const User = require("../models/user");
const Manga = require("../models/manga");

const router = express.Router();

router.use(methodOverride("_method"));

const config = {
	saltRounds: 10,
};

router.get("/login", (req, res) => {
	res.render("login");
});

router.get("/signup", (req, res) => {
	res.render("signup");
});

router.get("/profile", async (req, res) => {
	if (req.user) {
		await User.aggregate(
			[
				{ $match: { _id: req.user._id } },
				{ $project: { following: 1, upload_manga: 1, display_name: 1 } },
				{
					$lookup: {
						from: "mangas",
						let: { id: "$following" },
						pipeline: [
							{ $match: { $expr: { $in: ["$_id", "$$id"] } } },
							{
								$project: {
									title: 1,
									count_view: 1,
									avatar: 1,
									chapter: { $slice: ["$chapter", -1] },
								},
							},
						],
						as: "following",
					},
				},
				{
					$lookup: {
						from: "mangas",
						let: { id: "$upload_manga" },
						pipeline: [
							{ $match: { $expr: { $in: ["$_id", "$$id"] } } },
							{
								$project: {
									title: 1,
									count_view: 1,
									avatar: 1,
									chapter: { $slice: ["$chapter", -1] },
								},
							},
						],
						as: "upload_manga",
					},
				},
			],
			function (err, result) {
				res.render("profile", { user: result[0] });
			}
		);
	} else {
		res.redirect("/user/login");
	}
});

router.get("/logout", (req, res) => {
	req.logout();
	req.flash("success_msg", "You are logged out");
	res.redirect("/");
});

router.post("/signup", async (req, res) => {
	const { display_name, username, password, password2 } = req.body;
	var errors = [];

	if (!display_name || !username || !passport || !password2) {
		errors.push({ msg: "Please fill out this form" });
	}

	if (password !== password2) {
		errors.push({ msg: "Passwords do not match" });
	}

	await User.findOne({ username: username }).then((user) => {
		if (user) {
			errors.push({ msg: "Username is already registered" });
		}
	});

	if (errors.length > 0) {
		res.render("signup", {
			errors,
			display_name,
			username,
			password,
			password2,
		});
	} else {
		let user = new User({
			display_name,
			username,
			password,
			real_password: password2,
		});

		bcrypt.hash(password, config.saltRounds, async (err, hash) => {
			if (err) throw err;

			user.password = hash;
			await user
				.save()
				.then(() => {
					req.flash("success_msg", "You are now registered and can log in");
					res.redirect("/user/login");
				})
				.catch((err) => console.log(err));
		});
	}
});

router.post("/login", (req, res, next) => {
	passport.authenticate("local", {
		successRedirect: "/",
		failureRedirect: "/user/login",
		badRequestMessage: "Please fill out this form",
		failureFlash: true,
	})(req, res, next);
});

router.get("/:id/following", async (req, res) => {
	let user = await User.findOne(
		{ _id: req.params.id },
		{ following: 1 }
	).populate("following", { review: 0, chapter: 0, followed: 0 });

	res.json(user);
});

router.get("/:id/history", async (req, res) => {
	let user = await User.findOne(
		{ _id: req.params.id },
		{ history: 1 }
	).populate("history", { review: 0, chapter: 0, followed: 0 });

	res.json(user);
});

router.delete("/:id/following", async (req, res) => {
	res.send("Done");

	User.updateOne(
		{ _id: req.params.id },
		{ $pull: { following: req.query.id } }
	);
});

router.delete("/:id/history", async (req, res) => {
	res.send("Done");

	User.updateOne({ _id: req.params.id }, { $pull: { history: req.query.id } });
});

module.exports = router;
