'use strict';

const db = require('./database');
const posts = require('./posts');
const plugins = require('./plugins');

const Strikes = module.exports;

Strikes.create = async function ({ issuerUid, pid, ip, reason }) {
	if (!issuerUid || !pid) {
		throw new Error('[[error:invalid-data]]');
	}

	const reasonString = typeof reason === 'string' ? reason.trim() : '';
	if (!reasonString) {
		throw new Error('[[error:invalid-data]]');
	}
	if (reasonString.length > 500) {
		throw new Error('[[error:content-too-long, 500]]');
	}

	const post = await posts.getPostFields(pid, ['pid', 'uid', 'tid']);
	if (!post || !post.pid) {
		throw new Error('[[error:no-post]]');
	}

	const [cid, sid] = await Promise.all([
		posts.getCidByPid(pid),
		db.incrObjectField('global', 'nextStrikeId'),
	]);

	const timestamp = Date.now();
	const strike = {
		sid: sid,
		pid: post.pid,
		tid: post.tid,
		targetUid: post.uid || 0,
		issuerUid: issuerUid,
		cid: cid,
		timestamp: timestamp,
		reason: reasonString,
	};
	if (ip) {
		strike.ip = ip;
	}

	await Promise.all([
		db.setObject(`strike:${sid}`, strike),
		db.sortedSetAdd(`post:${post.pid}:strikes`, timestamp, sid),
		db.sortedSetAdd(`uid:${strike.targetUid}:strikes`, timestamp, sid),
		db.sortedSetAdd(`uid:${issuerUid}:issued:strikes`, timestamp, sid),
	]);

	await plugins.hooks.fire('action:strikes.create', { strike });

	return strike;
};

Strikes.getCountForPid = async function (pid) {
	return await db.sortedSetCard(`post:${pid}:strikes`);
};

Strikes.getCountForUid = async function (uid) {
	return await db.sortedSetCard(`uid:${uid}:strikes`);
};

Strikes.listForPid = async function (pid, start = 0, stop = -1) {
	const ids = await db.getSortedSetRevRange(`post:${pid}:strikes`, start, stop);
	if (!ids.length) {
		return [];
	}
	const strikes = await db.getObjects(ids.map(id => `strike:${id}`));
	return strikes.filter(Boolean).map((strike) => {
		if (!strike) {
			return strike;
		}
		const parsed = { ...strike };
		['sid', 'pid', 'tid', 'targetUid', 'issuerUid', 'cid', 'timestamp'].forEach((field) => {
			if (parsed[field] !== undefined && parsed[field] !== null && parsed[field] !== '') {
				const value = parseInt(parsed[field], 10);
				parsed[field] = Number.isNaN(value) ? parsed[field] : value;
			}
		});
		if (parsed.reason) {
			parsed.reason = String(parsed.reason);
		}
		return parsed;
	}).filter(Boolean);
};
