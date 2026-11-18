// Adds a "Copy" button to every <pre class="language-…"> on the page.
// The DOM shape matches Prism's toolbar plugin so the existing CSS in
// prism-1.15.css (`.code-toolbar`, `.toolbar`, `.toolbar-item`) applies.
// Uses navigator.clipboard.writeText — no library needed.
(function () {
  if (!navigator.clipboard) return;
  document.addEventListener('DOMContentLoaded', function () {
    var pres = document.querySelectorAll('pre[class*="language-"]');
    for (var i = 0; i < pres.length; i++) {
      var pre = pres[i];
      if (pre.parentNode.classList && pre.parentNode.classList.contains('code-toolbar')) continue;

      var wrapper = document.createElement('div');
      wrapper.className = 'code-toolbar';
      pre.parentNode.insertBefore(wrapper, pre);
      wrapper.appendChild(pre);

      var toolbar = document.createElement('div');
      toolbar.className = 'toolbar';
      var item = document.createElement('div');
      item.className = 'toolbar-item';
      var button = document.createElement('button');
      button.type = 'button';
      button.textContent = 'Copy';

      (function (btn, p) {
        btn.addEventListener('click', function () {
          var code = p.querySelector('code');
          var text = code ? code.innerText : p.innerText;
          navigator.clipboard.writeText(text).then(
            function () { btn.textContent = 'Copied!'; },
            function () { btn.textContent = 'Copy failed'; }
          );
          setTimeout(function () { btn.textContent = 'Copy'; }, 1500);
        });
      })(button, pre);

      item.appendChild(button);
      toolbar.appendChild(item);
      wrapper.appendChild(toolbar);
    }
  });
})();
