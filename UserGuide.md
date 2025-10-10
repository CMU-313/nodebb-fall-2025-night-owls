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
Function to find all posts:<br>
Function to filter all posts:

### Why is this sufficient?
This testing covers both of the main backend areas of the search feature. It's two main functions are a new one getAllContent() and modifications on .getCategoryTopics(). Thus, our focus surrounds on testing for both. The latter consequently also verifies that data (the search value) is being received from the front-end and applied correctly. While there is not an explicit test to show that the filtered posts from .getCategoryTopics() are then rendered on the page, this is logic that already existed in the codebase and went unmodified. The only modification are the values in the filtered array which are verified in the test for .getCategoryTopics(). Therefore, the tests that we currrently have are sufficient to validate that search is working, and meets our acceptance criteria from the Issues and related user story.

# Anonymous Posting
### How to Use & Test

### Automated Test Location

### Automated Test Description

### Why is this sufficient?

# Archive Posts
### How to Use & Test

### Automated Test Location

### Automated Test Description

### Why is this sufficient?

# Strike System
### How to Use & Test

### Automated Test Location

### Automated Test Description

### Why is this sufficient?
