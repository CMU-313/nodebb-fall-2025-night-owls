'use strict';

const { createClient } = require('redis');

async function getPostsFromRedis() {
	const client = createClient({
		url: 'redis://localhost:6379',
	});

	client.on('error', (err) => console.log('Redis Client Error', err));

	try {
		await client.connect();

		// Get all post IDs from the sorted set that NodeBB uses
		const postIds = await client.zRange('posts:pid', 0, -1);
		console.log('Found post IDs:', postIds);

		// Get details for each post
		const posts = [];
		for (const pid of postIds) {
			const postData = await client.hGetAll(`post:${pid}`);
			if (Object.keys(postData).length > 0) {
				console.log('\n-------------------');
				console.log(`Post ID: ${pid}`);
				console.log(`Content: ${postData.content}`);
				console.log(`Created by: ${postData.uid}`);
				console.log(`Topic ID: ${postData.tid}`);
				console.log(`Created on: ${new Date(parseInt(postData.timestamp)).toLocaleString()}`);
				console.log('-------------------');
				posts.push(postData);
			}
		}

		console.log(`\nTotal posts found: ${posts.length}`);
	} catch (error) {
		console.error('Error:', error);
	} finally {
		await client.disconnect();
	}
}

// First install redis if not already installed
// npm install redis

getPostsFromRedis();