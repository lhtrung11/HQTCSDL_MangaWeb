function newChapter(e, self, id) {
	e.preventDefault();
	let name = $(self).serializeArray()[0].value;
	let length = $("#chapter-table tr").length;

	$.ajax({
		url: `/manga/${id}/${length}/new`,
		method: "POST",
		data: { chapter_title: name },
		success: function (response) {
			$("#chapter-table").append(
				`<tr>
			          <td data-th="Chapter">
			               <a
			                    href="/manga/${id}/${length}/read"
			                    >Chapter ${length}</a
			               >
			          </td>
			          <td data-th="Name">${name}</td>
			          <td data-th="Update">${response.date}</td>
			          <td data-th="Edit">
			               <a href="">
			                    <span class="fa fa-cut"></span>
			               </a>
			          </td>
			     </tr>`
			);
			$(self).children("#chapter_title").val("");
		},
	});

	return false;
}
