const mongoose = require("mongoose");

const mangaSchema = mongoose.Schema({
	title: {
		type: String,
		required: true,
	},
	realName: {
		type: String,
	},
	file_storage: {
		type: String,
		required: true,
	},
	author: {
		type: String,
		required: true,
	},
	avatar: {
		type: String,
	},
	upload_date: {
		type: Date,
		default: Date.now,
	},
	newest_date: {
		type: Date,
		default: Date.now,
	},
	tags: [{ type: String }],
	description: { type: String },
	state: {
		type: Boolean,
		default: false,
	},
	count_followed: {
		type: Number,
		default: 0,
	},
	count_view: {
		type: Number,
		default: 0,
	},
	count_review: {
		type: Number,
		default: 0,
	},
	count_chapter: {
		type: Number,
		default: 0,
	},
	vote: [
		{
			type: mongoose.Schema.Types.ObjectID,
			ref: "User",
		},
	],
	point: {
		type: Number,
		default: 0,
	},
	view: [
		{
			type: Date,
		},
	],
	review: [
		{
			user: {
				type: mongoose.Schema.Types.ObjectID,
				ref: "User",
			},
			content: {
				type: String,
				required: true,
			},
			date: {
				type: Date,
				default: Date.now,
			},
		},
	],
	chapter: [
		{
			chapter_title: {
				type: String,
				required: true,
			},
			chapter_index: {
				type: Number,
				required: true,
			},
			publish_date: {
				type: Date,
				default: Date.now,
			},
			images: [{ type: String }],
		},
	],
});

mangaSchema.pre("validate", function (next) {
	if (!this.file_storage && this.title) {
		this.file_storage = this.title.replace(/\s/g, "");
	}
	if (this.title) {
		this.realName = this.title.slice(0, -6);
	}
	next();
});

module.exports = mongoose.model("Manga", mangaSchema);
