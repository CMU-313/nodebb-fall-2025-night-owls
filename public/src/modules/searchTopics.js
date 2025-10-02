define('searchTopics', ['fuse.js'], function (Fuse) {
	const searchTopics = {};

	searchTopics.init = function (el) {
		if (!el || !el.length) {
			return;
		}

		el.on('submit', function (event) {
			event.preventDefault();

			const query = el.find('#search-topics').val().trim();
			console.log('Search request received for: ', query);

			const allPostsExample = [
				{pid: 1, content: 'This is a test post about JavaScript.'},
				{pid: 2, content: 'Another post discussing Python programming.'},
			];

			const fuse = new Fuse(allPostsExample, {
				includeScore: false,
				keys: ['content'],
			});

			const results = fuse.search(query);

			console.log('Search results:', results);
		});
	};

	return searchTopics;
});
