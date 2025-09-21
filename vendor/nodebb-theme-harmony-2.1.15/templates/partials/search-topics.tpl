<div>
    <form id="search-topics-form" onsubmit="return searchTopics(event)">
        <label for="search-topics">Search</label>
        <input class="title form-control h-100 rounded-1 shadow-none" id="search-topics" type="text" name="search-topics" placeholder="Enter a key word or phrase">
        <button type="submit" id="search-topics-submit">Submit</button>
    </form>
</div>

<script>
  function searchTopics(event) {
    event.preventDefault();
    const query = document.getElementById("search-topics").value;
    console.log("Searching for:", query);
    alert("Searching for:", query);
  }
</script>