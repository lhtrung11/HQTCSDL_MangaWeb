$("#file").on("change", function () {
	let preview = $("div.preview")[0];

	for (let i = 0; i < this.files.length; i++) {
		let file = this.files[i];
		let reader = new FileReader();
		reader.onload = function () {
			preview.innerHTML += `<img src= "${reader.result}" />`;
		};
		if (file) {
			reader.readAsDataURL(file);
		}
	}
});

$(".comment-list").on("click", ".reply-comment", function () {
	let reply_zone = $(this)
		.parents("div.well")
		.siblings(".media-list")
		.children(".reply-zone");
	reply_zone.toggle();
});
