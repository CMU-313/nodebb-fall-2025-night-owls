# Search
### How to Use & Test
1) View a Category page such as General Discussion
2) Type a search query contaning a word or phrase that you are looking for in the content of a topic post
3) Submit search query by pressing the enter key or the submit button on the page
4) The page will display only topics which contain the search in its contents for that category

### Automated Test Location
Function to find all posts: test/post.js<br>
Function to filter all posts: test/categories.js

### Automated Test Description
Function to find all posts: A new test was added inside test/posts.js: 1266 for Posts.getAllContent(). This test creates temperary posts and checks if there are exactly 30 posts in the array, as getAllContent returns an array of dictionaries. It then checks if the new posts, represented with testPost1 and testPost2 return the messages `Test posts for getAllContent` and `Another test post for getAllContent` for testPost1[content] and testPost2[content]. <br>
Function to filter all posts: A new test was added inside of test/categories.js:105 for .getCategoryTopics(). The test creates two topics in a new category and searches for one of them (the search query is "good" to match the description: `content: 'The content of the good test topic',`). It then asserts that the "good" topic is in the resulting list of topics and not the "bad" topic.


### Why is this sufficient?
This testing covers both of the main backend areas of the search feature. It's two main functions are a new one getAllContent() and modifications on .getCategoryTopics(). Thus, our focus surrounds on testing for both. The latter consequently also verifies that data (the search value) is being received from the front-end and applied correctly. The explicit assertion that a topic *not* matching the search wasn't included verifies that search is accurate. While there is not an explicit test to show that the filtered posts from .getCategoryTopics() are then actuallyrendered on the page, this is logic that already existed in the codebase and went unmodified. The only modification are the values in the filtered array which are verified in the test for .getCategoryTopics(). This can be seen by manually testing out the feature in a local server. Therefore, the tests that we currrently have are sufficient to validate that search is working, and meets our acceptance criteria from the Issues and related user story.

# Anonymous Posting
### How to Use & Test

This feature allows users to post anonymously and for staff members to see the original author.

**As a regular user:**

1) Navigate to the composer to create a new topic or reply.

2) Enter your message content.

3) Check the "Post anonymously" checkbox at the bottom.

4) Submit the post.

5) Verification: The post should appear with the author listed as "Anonymous," with no link to your profile.

**As an admin or moderator:**

1) Log in with an account that has staff privileges.

2) Navigate to a topic containing an anonymous post.

3) Verification: You will see "Anonymous" followed by a muted badge containing the original author's username (e.g., Anonymous (username)). This provides staff with the context of the 

4) original poster while maintaining anonymity for regular users.


### Automated Test Location

test/topics.js

### Automated Test Description

The automated tests are located within a specific describe block named 'anonymous author visibility'. These tests cover the following scenarios:

- Confirms that when a topic is posted with the anonymous flag, the anonymous: 1 flag and the original author's user ID (uid) are correctly saved to the database.

- It simulates an API call as an administrator to fetch the anonymous post. It asserts that the response data includes the anonymousOriginalUser object, which contains the real author's details.

- It simulates API calls as a non-privileged user. It asserts that for the same anonymous post, the anonymousOriginalUser object is absent from the response, ensuring the author's identity remains hidden.

- It verifies that post summaries also correctly hide the author's identity from regular users.


### Why is this sufficient( for covering the changes that you have made)?

These tests are sufficient because they check the entire feature from start to finish. They first confirm that when someone posts anonymously, the system correctly hides the author's name from regular users. Then, the tests check the feature from two different points of view, a regular user and an admin, to make sure that only the admin is able to see who originally wrote the post. Because this process verifies that the rules work correctly for both types of users, it proves the feature is working as intended.


# Archive Posts
### How to Use & Test

### Automated Test Location

### Automated Test Description

### Why is this sufficient?

# Strike System
### How to Use & Test

This feature allows administrators to issue strikes against posts, which notify the user and can lead to an automatic ban.

**As an admin or moderator:**

1) Navigate to any post or reply.  
2) Open the post's menu and select the "Give strike" option.  
3) When prompted, enter a clear reason for the strike (this is required).  
4) Submit the strike.  

**Verification:**

- The post's author will receive a private in-app notification.  
- If this is the user's third strike, they will be automatically banned for a week and notified of the ban.  

**As a regular user:**

1) If an admin issues a strike on one of your posts, you will receive an in-app notification.  

**Verification:**

- The notification is private to you and will contain the reason the admin provided, along with a link to your post.  
- You can view the reasons for strikes on your own posts.  
- If you receive a third strike, you will get a second notification informing you that you have been banned.  
- While banned, you will be blocked from creating new posts or replies.  

### Automated Test Location

test/strikes.js

### Automated Test Description

The automated tests are located in a describe block named **'Strikes API'**. These tests cover the entire feature lifecycle:

- **Permissions:** Verifies that non-admin users are blocked from issuing strikes, while admins are allowed. It also ensures that strike details are kept private and are not visible to unrelated users.  
- **Strike Creation:** Confirms that when an admin issues a strike, it is correctly saved in the database with the proper reason, linked to the post, the target user, and the issuing admin.  
- **Notifications:** Checks that a strike correctly triggers a private notification that is sent only to the user who was struck. It also confirms the notification includes the reason.  
- **Automatic Ban:** Simulates a user receiving three strikes and verifies that the system automatically bans them. It then confirms the banned user receives a specific "ban" notification and is successfully blocked from attempting to post again.  
- **Input Validation:** Ensures that an admin cannot create a strike without providing a reason.  

### Why is this sufficient (for covering the changes that you have made)?

These tests are sufficient because they check the entire feature from every angle and for every user involved. They first confirm the permission rules, only admins can give strikes, and private details are hidden from the public. The tests then verify that all the core actions work correctly, from saving the strike and sending a notification to automatically banning a user after three strikes. Because this process proves the rules, actions, and consequences all work as intended for admins, regular users, and bystanders, it fully covers the feature's requirements.
