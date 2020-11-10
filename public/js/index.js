function getTopWeek() {
	getTrendingManga("top-week");
}

function getTopMonth() {
	getTrendingManga("top-month");
}

function getTopDay() {
	getTrendingManga("top-day");
}

function getTrendingManga(type) {
	$.ajax({
		url: `/find-manga/${type}`,
		method: "POST",
		success: function (response) {
			$("#top_zone").html("");
			response.forEach((item, index) => {
				$("#top_zone").append(
					`<div
                              class="product__sidebar__view__item set-bg mix day years"
                              data-setbg="${item.avatar}"
                              style="background-image: url('/${item.avatar}');"
                         >
                              <div class="view">
                                   <i class="fa fa-eye"></i>${item.count_view}
                              </div>
                              <h5>
                                   <a href="/manga/${item._id}">${item.title}</a>
                              </h5>
                         </div>`
				);
			});
		},
	});
}
