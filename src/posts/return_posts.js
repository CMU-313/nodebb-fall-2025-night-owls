'use strict';

const winston = require('winston');
const db = require('./src/database').init();

async function getAllPosts() {
	try {
		// Initialize database connection
		await db.init();

		// Get all post IDs from Redis sorted set
		const pids = await db.getSortedSetRange('posts:pid', 0, -1);
        
		// Get post data for each PID
		for (const pid of pids) {
			// Get all fields for this post from Redis hash
			const postData = await db.getObject(`post:${pid}`);
            
			if (postData) {
				winston.log('\n-------------------');
				winston.log(`Post ID: ${pid}`);
				winston.log(`Content: ${postData.content}`);
				winston.log(`Created by: ${postData.uid}`);
				winston.log(`Created on: ${new Date(parseInt(postData.timestamp)).toLocaleString()}`);
				winston.log('-------------------');
			}
		}

		winston.log(`\nTotal posts found: ${pids.length}`);
		process.exit(0);
	} catch (error) {
		winston.error('Error fetching posts:', error);
		process.exit(1);
	}
}

getAllPosts();