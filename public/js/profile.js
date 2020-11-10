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
