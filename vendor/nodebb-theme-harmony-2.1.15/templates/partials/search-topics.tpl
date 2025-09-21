<div>
    <form id="search-topics-form" onsubmit="return searchTopics(event)">
        <input class="title form-control h-100 rounded-1 shadow-none" id="search-topics" type="text" name="search-topics" placeholder="Search a key word or phrase" display="inline">
        <button class="btn btn-primary btn-sm text-nowrap" type="submit" id="search-topics-submit" display="inline">Submit</button>
    </form>
</div>

<script>
  function searchTopics(event) {
    event.preventDefault();
    const query = document.getElementById("search-topics").value;
    console.log("Searching for:", query);
    alert("Searching for:" + query);
  }
</script>