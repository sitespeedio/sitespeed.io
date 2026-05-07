SimpleJekyllSearch({
  searchInput: document.getElementById('search-input'),
  resultsContainer: document.getElementById('results-container'),
  json: '/search/search.json',
  searchResultTemplate: "<li><a href='{url}'>{title}</a> - {description}</li>"
});
