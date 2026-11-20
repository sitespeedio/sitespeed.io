/* eslint-disable no-undef */
// Substring filter for the Pages table. Matches against the whole row
// text so you can filter by URL, alias or verdict word ("poor").
// Hiding rows plays nice with sortable.min.js: sorting reorders the
// rows but leaves the inline display style alone.
globalThis.addEventListener('DOMContentLoaded', function () {
  const input = document.querySelector('#pages-filter');
  const counter = document.querySelector('#pages-filter-count');
  if (!input) {
    return;
  }
  const rows = document.querySelectorAll('#pages tbody tr');
  input.addEventListener('input', function () {
    const query = input.value.trim().toLowerCase();
    let shown = 0;
    for (const row of rows) {
      const match =
        query === '' || row.textContent.toLowerCase().includes(query);
      row.style.display = match ? '' : 'none';
      if (match) {
        shown++;
      }
    }
    counter.textContent =
      query === '' ? '' : shown + ' of ' + rows.length + ' shown';
  });
});
