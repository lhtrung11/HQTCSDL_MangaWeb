$("#file").on("change", function () {
	let preview = $("img.preview")[0];
	let file = this.files[0];
	let reader = new FileReader();
	reader.onload = function () {
		preview.src = reader.result;
	};
	if (file) {
		reader.readAsDataURL(file);
	}
});

$("#new_manga").one("submit", function (e) {
	e.preventDefault();
	let manga_title = $("#new_manga").serializeArray()[1].value;
	console.log(manga_title);
	$("#folder_name").val(manga_title);

	$(this).submit();
});
