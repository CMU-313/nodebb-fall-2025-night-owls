'use strict';

require('./app');

// scripts-client.js is generated during build, it contains javascript files
// from plugins that add files to "scripts" block in plugin.json
require('../scripts-client');

require(['searchTopics'], function (searchTopics) {
	function initSearchTopics() {
		$('[component="search/topics"]').each(function () {
			searchTopics.init($(this));
		});
	}

	$(window).on('action:ajaxify.end', initSearchTopics);
	$(document).ready(initSearchTopics);
});

app.onDomReady();
