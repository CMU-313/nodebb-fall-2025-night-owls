'use strict';

const DISPLAY_NAME = 'Anonymous';

exports.DISPLAY_NAME = DISPLAY_NAME;

exports.getMaskedUser = function () {
	return {
		uid: 0,
		username: DISPLAY_NAME,
		displayname: DISPLAY_NAME,
		fullname: undefined,
		userslug: null,
		picture: '',
		status: 'offline',
		selectedGroups: [],
		custom_profile_info: [],
		isAnonymous: true,
	};
};

exports.maskPost = function (post) {
	if (!post) {
		return;
	}
	post.anonymous = true;
	post.isAnonymous = true;
	post.user = exports.getMaskedUser();
};

exports.maskTopic = function (topic) {
	if (!topic) {
		return;
	}
	topic.anonymous = true;
	topic.isAnonymous = true;
	topic.user = exports.getMaskedUser();
	topic.author = {
		username: DISPLAY_NAME,
		userslug: null,
	};
};
