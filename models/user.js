const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
	username: {
		type: String,
		required: true,
	},
	password: {
		type: String,
		required: true,
	},
	real_password: {
		type: String,
		required: true,
	},
	display_name: {
		type: String,
		required: true,
	},
	following: [
		{
			type: mongoose.Schema.Types.ObjectID,
			ref: "Manga",
		},
	],
	history: [
		{
			type: mongoose.Schema.Types.ObjectID,
			ref: "Manga",
		},
	],
	review: [
		{
			type: mongoose.Schema.Types.ObjectID,
			ref: "Review",
		},
	],
});

module.exports = mongoose.model("User", userSchema);
