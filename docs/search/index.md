---
layout: default
title: Search the documentation.
description: Search and you should find.
keywords: sitespeed.io, search, documentation
nav: search
image: https://www.sitespeed.io/img/sitespeed-2.0-twitter.png
---

<div id="search-container">
 <input type="text" id="search-input" placeholder="Search ..." class="input-field">
 <ul id="results-container"></ul>
</div>

<!-- script pointing to jekyll-search.js -->
<script src="{{ site.baseurl }}/simple-jekyll-search.min.js"></script>
<script>
SimpleJekyllSearch({
 searchInput: document.getElementById('search-input'),
 resultsContainer: document.getElementById('results-container'),
 json: {% include_relative search.json %},
 searchResultTemplate: "<li><a href='{url}'>{title}</a> - {description}</li>"
})
</script>
