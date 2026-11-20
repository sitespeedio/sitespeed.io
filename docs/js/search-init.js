window.addEventListener('DOMContentLoaded', function () {
  if (typeof PagefindUI !== 'function') return;
  new PagefindUI({
    element: '#search',
    showSubResults: true,
    showImages: false,
    resetStyles: false
  });

  // Pagefind renders the result-count message ("75 results for measure")
  // as plain text — there's no element wrapping the search term we can
  // target from CSS. Watch the message and wrap the term in <strong>
  // after every Pagefind render so it stands out from the surrounding
  // sentence. CSS handles the actual styling.
  function escapeRegex(s) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
  function emphasiseTerm() {
    var message = document.querySelector('#search .pagefind-ui__message');
    if (!message) return;
    // Already wrapped — Pagefind hasn't re-rendered since
    if (message.querySelector('strong')) return;
    var input = document.querySelector('#search .pagefind-ui__search-input');
    if (!input || !input.value) return;
    var term = input.value.trim();
    if (!term) return;
    var re = new RegExp('(' + escapeRegex(term) + ')', 'i');
    var text = message.textContent;
    if (re.test(text)) {
      message.innerHTML = text.replace(re, '<strong>$1</strong>');
    }
  }
  // PagefindUI builds its DOM after we run, so poll for the message
  // element to appear, then attach a MutationObserver to it.
  var tries = 0;
  var poll = setInterval(function () {
    var message = document.querySelector('#search .pagefind-ui__message');
    if (message) {
      clearInterval(poll);
      new MutationObserver(emphasiseTerm).observe(message, {
        childList: true,
        characterData: true,
        subtree: true
      });
      emphasiseTerm();
    } else if (++tries > 50) {
      clearInterval(poll);
    }
  }, 100);
});
