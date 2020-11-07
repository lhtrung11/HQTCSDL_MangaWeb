const exphb = require("express-handlebars");
const dateFormat = require("dateformat");
const path = require("path");

const hbs = exphb.create({
	defaultLayout: "main",
	layoutsDir: path.join(__dirname, "views/layouts"),
	partialsDir: path.join(__dirname, "views/partials"),
	extname: "hbs",

	runtimeOptions: {
		allowProtoPropertiesByDefault: true,
		allowProtoMethodsByDefault: true,
	},

	helpers: {
		sum: function (value1, value2) {
			return value1 + value2;
		},
		getPoint: function (value1, value2) {
			let result = value1 / value2;
			return Math.round(result * 10) / 10;
		},
		realName: function (name) {
			return name.slice(0, -6);
		},
		formatDate: function (date) {
			return dateFormat(date, "mm/dd/yyyy");
		},
		size: function (array) {
			if (array) {
				return array.length;
			}
			return 0;
		},
		state: function (boolean) {
			if (boolean) {
				return "True";
			} else {
				return "False";
			}
		},
	},
});

module.exports = hbs;
