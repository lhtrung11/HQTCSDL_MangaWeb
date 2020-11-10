/* image-upload preview */
function readURL(input) {
	if (input.files && input.files[0]) {
		var reader = new FileReader();
		reader.onload = function (e) {
			$(".image-upload-wrap").hide();
			$(".file-upload-image").attr("src", e.target.result);
			$(".file-upload-content").show();
		};
		reader.readAsDataURL(input.files[0]);
	} else {
		removeUpload();
	}
}

function removeUpload() {
	$(".file-upload-input").replaceWith($(".file-upload-input").clone());
	$(".file-upload-content").hide();
	$(".image-upload-wrap").show();
}
$(".image-upload-wrap").bind("dragover", function () {
	$(".image-upload-wrap").addClass("image-dropping");
});
$(".image-upload-wrap").bind("dragleave", function () {
	$(".image-upload-wrap").removeClass("image-dropping");
});
/* uploading multiple file */
$(document).on("change", ".up", function () {
	var names = [];
	var length = $(this).get(0).files.length;
	for (var i = 0; i < $(this).get(0).files.length; ++i) {
		names.push($(this).get(0).files[i].name);
	}
	// $("input[name=file]").val(names);
	if (length > 2) {
		var fileName = names.join(", ");
		$(this)
			.closest(".form-group")
			.find(".form-control")
			.attr("value", length + " files selected");
	} else {
		$(this).closest(".form-group").find(".form-control").attr("value", names);
	}
});
