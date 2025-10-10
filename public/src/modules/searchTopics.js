define('searchTopics', [], function () {
	const searchTopics = {};

	searchTopics.init = function (el) {
		if (!el || !el.length) {
			return;
		}

		el.on('submit', function (event) {
			event.preventDefault();

			const query = el.find('#search-topics').val().trim();
			window.location.search = `?search=${encodeURIComponent(query)}`;
		});
	};

	return searchTopics;
});
