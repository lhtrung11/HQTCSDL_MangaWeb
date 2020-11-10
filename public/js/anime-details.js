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

function newComment(e, self, id, name, avatar) {
	e.preventDefault();
	let review = $(self).serializeArray()[0].value;
	if (!avatar) {
		avatar = "img/anime/review-1.jpg";
	}

	$.ajax({
		url: `/manga/review/${id}`,
		method: "POST",
		data: { comment: review },
		success: function (response) {
			$("#review_zone").prepend(
				`<div class="anime__review__item">
                         <div class="anime__review__item__pic">
                              <img
                              src="/${avatar}"
                              alt="" />
                         </div>
                         <div class="anime__review__item__text">
                              <h6>
                                   ${name}
                                   <span>${response.date}</span>
                              </h6>
                              <p>${review}</p>
                         </div>
                    </div>`
			);
			$(self).children("#comment").val("");
		},
	});

	return false;
}
