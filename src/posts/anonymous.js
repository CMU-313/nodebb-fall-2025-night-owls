'use strict';

const user = require('../user');

const ANONYMOUS_KEY = '[[global:anonymous]]';

module.exports = function (Posts) {
	function buildAnonymousUser() {
		const guestBase = user.guestData || {};
		return {
			uid: 0,
			username: ANONYMOUS_KEY,
			displayname: ANONYMOUS_KEY,
			fullname: ANONYMOUS_KEY,
			userslug: '',
			picture: '',
			status: 'offline',
			'icon:text': guestBase['icon:text'] || 'A',
			'icon:bgColor': guestBase['icon:bgColor'] || '#aaa',
			selectedGroups: [],
			custom_profile_info: [],
			isAnonymous: true,
			signature: '',
		};
	}

	Posts.getAnonymousUser = function () {
		return buildAnonymousUser();
	};

	Posts.applyAnonymousState = function (post) {
		if (!post) {
			return post;
		}
		const isAnonymous = typeof post.anonymous === 'boolean' ? post.anonymous : parseInt(post.anonymous, 10) === 1;
		if (!isAnonymous) {
			return post;
		}

		post.anonymous = true;
		post.isAnonymous = true;
		post.handle = undefined;

		const anonymousUser = buildAnonymousUser();
		post.user = anonymousUser;
		return post;
	};
};
