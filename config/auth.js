module.exports = {
	ensureAuthenticated: function (req, res, next) {
		if (req.isAuthenticated()) {
			return next();
		}
		req.flash("error_msg", "Please log in to view this resource");
		return res.redirect("/user/login");
	},

	authenticate: function (req, res, next) {
		if (req.isAuthenticated()) {
			return res.redirect("/");
		}
		return next();
	},
};
