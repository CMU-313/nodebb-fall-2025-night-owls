'use strict';

const assert = require('assert');
const util = require('util');

const db = require('./mocks/databasemock');
const helpers = require('./helpers');
const User = require('../src/user');
const Groups = require('../src/groups');
const Categories = require('../src/categories');
const Topics = require('../src/topics');
const plugins = require('../src/plugins');

const sleep = util.promisify(setTimeout);

describe('Strikes API', () => {
	let adminUid;
	let regularUid;
	let category;
	let post;
	let adminJar;
	let userJar;

	before(async () => {
		const noopEmailer = async () => {};
		plugins.hooks.register('strikes-test', {
			hook: 'static:email.send',
			method: noopEmailer,
		});
		adminUid = await User.create({ username: 'strike-admin', password: 'hunter2', email: 'strike-admin@example.com' });
		await Groups.join('administrators', adminUid);

		regularUid = await User.create({ username: 'strike-user', password: 'hunter2', email: 'strike-user@example.com' });

		category = await Categories.create({ name: 'Strike Test Category' });

		({ postData: post } = await Topics.post({
			cid: category.cid,
			uid: regularUid,
			title: 'Strike Test Topic',
			content: 'content to strike',
		}));

		({ jar: adminJar } = await helpers.loginUser('strike-admin', 'hunter2'));
		({ jar: userJar } = await helpers.loginUser('strike-user', 'hunter2'));
	});

	after(() => {
		plugins.hooks.unregister('strikes-test', 'static:email.send');
	});

	it('should block non-admin users from issuing strikes', async () => {
		const { response, body } = await helpers.request('post', `/api/v3/posts/${post.pid}/strikes`, {
			jar: userJar,
			body: {
				reason: 'Testing reason',
			},
			json: true,
		});

		assert.strictEqual(response.statusCode, 403);
		assert.strictEqual(body.status.message, 'You do not have enough privileges for this action.');
	});

	it('should allow admins to issue strikes tied to the target post', async () => {
		const reason = 'Posting spam links';
		const { response, body } = await helpers.request('post', `/api/v3/posts/${post.pid}/strikes`, {
			jar: adminJar,
			body: {
				reason: reason,
			},
			json: true,
		});

		assert.strictEqual(response.statusCode, 200);
		const strike = body.response.strike;
		assert.ok(strike.sid);
		assert.strictEqual(parseInt(strike.pid, 10), post.pid);
		assert.strictEqual(parseInt(strike.targetUid, 10), regularUid);
		assert.strictEqual(parseInt(strike.issuerUid, 10), adminUid);
		assert.strictEqual(strike.reason, reason);

		const stored = await db.getObject(`strike:${strike.sid}`);
		assert.strictEqual(parseInt(stored.pid, 10), post.pid);
		assert.strictEqual(parseInt(stored.targetUid, 10), regularUid);
		assert.strictEqual(stored.reason, reason);

		const postStrikeCount = await db.sortedSetCard(`post:${post.pid}:strikes`);
		assert.strictEqual(postStrikeCount, 1);

		const userStrikeCount = await db.sortedSetCard(`uid:${regularUid}:strikes`);
		assert.strictEqual(userStrikeCount, 1);

		const issuedCount = await db.sortedSetCard(`uid:${adminUid}:issued:strikes`);
		assert.strictEqual(issuedCount, 1);
	});

	it('should notify only the struck user with reason and link', async () => {
		await Promise.all([
			User.notifications.deleteAll(regularUid),
			User.notifications.deleteAll(adminUid),
		]);

		const reason = 'Reminder: follow community guidelines.';
		const { response } = await helpers.request('post', `/api/v3/posts/${post.pid}/strikes`, {
			jar: adminJar,
			body: { reason },
			json: true,
		});

		assert.strictEqual(response.statusCode, 200);

		await sleep(1500);

		const { unread } = await User.notifications.get(regularUid);
		const strikeNotification = unread.find(notif => notif && notif.type === 'post-strike');
		assert(strikeNotification, 'struck user should receive a strike notification');
		assert(strikeNotification.bodyShort.includes(reason), 'notification should include strike reason');
		assert(strikeNotification.path.endsWith(`/post/${post.pid}`), 'notification should link to the struck post');

		const adminNotifications = await User.notifications.get(adminUid);
		const adminCanSeeStrike = adminNotifications.unread
			.concat(adminNotifications.read || [])
			.some(notif => notif && notif.type === 'post-strike');
		assert.strictEqual(adminCanSeeStrike, false, 'notification should be private to the target user');
	});

	it('should automatically ban the user on the third strike and block posting', async () => {
		await User.notifications.deleteAll(regularUid);
		const isBannedBefore = await User.bans.isBanned(regularUid);
		assert.strictEqual(isBannedBefore, false);

		const reason = 'Third strike: automatic ban';
		const thirdStrike = await helpers.request('post', `/api/v3/posts/${post.pid}/strikes`, {
			jar: adminJar,
			body: { reason },
			json: true,
		});

		assert.strictEqual(thirdStrike.response.statusCode, 200);

		await sleep(2000);

		const isBannedAfter = await User.bans.isBanned(regularUid);
		assert.strictEqual(isBannedAfter, true, 'user should be banned after third strike');

		const { unread } = await User.notifications.get(regularUid);
		const banNotification = unread.find(notif => notif && notif.type === 'post-strike-ban');
		assert(banNotification, 'banned user should receive a ban notification');
		assert(banNotification.bodyShort.includes(reason), 'ban notification should include the strike reason');

		const postAttempt = await helpers.request('post', `/api/v3/topics/${post.tid}`, {
			jar: userJar,
			body: { content: 'This should be blocked.' },
			json: true,
		});

		assert.strictEqual(postAttempt.response.statusCode, 403);
		assert.strictEqual(postAttempt.body.status.message, 'You do not have enough privileges for this action.');
	});

	it('should reject strike creation without a reason', async () => {
		const { response, body } = await helpers.request('post', `/api/v3/posts/${post.pid}/strikes`, {
			jar: adminJar,
			body: {
				reason: '   ',
			},
			json: true,
		});

		assert.strictEqual(response.statusCode, 400);
		assert.strictEqual(body.status.message, 'Invalid Data');
	});
});
