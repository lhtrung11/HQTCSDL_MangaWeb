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
		realName: function (name) {
			return name.slice(0, -6);
		},
		formatDate: function (date) {
			return dateFormat(date, "mm/dd/yyyy HH:MM");
		},
		size: function (array) {
			if (array) {
				return array.length;
			}
			return 0;
		},
	},
});

module.exports = hbs;
