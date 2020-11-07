function setFollowState(self, id) {
	$.ajax({
		url: `/manga/${id}/like`,
		method: "POST",
		success: function (response) {
			if (response.isLiked) {
				$(self).css("background-color", "aqua");
				$(self).text("Unfollow");
			} else {
				$(self).css("background-color", "");
				$(self).text("Follow");
			}
		},
	});
}

function rate(self, id) {
	$.ajax({
		url: `/manga/${id}/rate`,
		method: "POST",
		data: { point: $(self).val() },
		success: function (response) {
			if (response.isRated) {
				alert("This manga is already rated");
			} else {
				alert("Thank you for your rating");
			}
		},
	});
}
