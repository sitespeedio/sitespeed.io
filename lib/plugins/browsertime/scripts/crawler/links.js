(function() {
  return Array.prototype.slice.call(document.links).map(function(a) {
    return a.href;
  }).filter(function(e, i, arr) {
    return arr.lastIndexOf(e) === i;
  });
})();