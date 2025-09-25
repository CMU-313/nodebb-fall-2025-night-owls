'use strict';

const winston = require('winston');
const db = require('../src/database');
const Posts = require('../src/posts');
// const Posts = require('./index');



async function getAllPosts() {
	try {
		// Initialize database
		await db.init();
        
		// Get all posts (pass 0 as uid for guest access)
		const posts = await Posts.getAllPosts(0);
        
		// Display posts
		posts.forEach(post => {
			console.log('\n-------------------');
			console.log(`Post ID: ${post.pid}`);
			console.log(`Content: ${post.content}`);
			console.log(`Created by: ${post.uid}`);
			console.log(`Topic ID: ${post.tid}`);
			console.log(`Created on: ${new Date(parseInt(post.timestamp)).toLocaleString()}`);
			console.log('-------------------');
		});

		console.log(`\nTotal posts found: ${posts.length}`);
		process.exit(0);
	} catch (error) {
		console.error('Error:', error);
		process.exit(1);
	}
}

getAllPosts();