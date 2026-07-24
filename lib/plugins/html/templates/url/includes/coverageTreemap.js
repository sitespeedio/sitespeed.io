/* eslint-disable no-undef */
// Drill-in for the coverage treemap. Clicking a bundle tile that carries
// a module breakdown swaps the whole-page treemap for that bundle's
// pre-rendered module treemap; Back returns. Every layout is computed
// server-side (pug + tmSquarify), so this only toggles which of the
// already-rendered views is visible — no client-side layout math.
(function () {
  const root = document.querySelector('#coverage-treemap-root');
  if (!root) {
    return;
  }
  const main = root.querySelector('.cov-tm-main');

  function showMain() {
    for (const drill of root.querySelectorAll('.cov-tm-drill')) {
      drill.hidden = true;
    }
    if (main) {
      main.hidden = false;
    }
  }

  root.addEventListener('click', function (event) {
    if (!event.target.closest) {
      return;
    }
    const tile = event.target.closest('.cov-tm-tile--drill');
    if (tile) {
      const drill = document.querySelector('#' + tile.dataset.drill);
      if (drill) {
        if (main) {
          main.hidden = true;
        }
        drill.hidden = false;
      }
      return;
    }
    if (event.target.closest('.cov-tm-back')) {
      showMain();
    }
  });
})();
