<h4 id="har">Timing Metrics for each run including HAR waterfalls</h4>
<nav>
<ul class="pagination">
  <li class="disabled">
    <a href="#" aria-label="Previous">
      <span aria-hidden="true">&laquo;</span>
    </a>
  </li>
{{#each browsertimeData}}
  {{#times runs}}
      <li><a href="../har/{{../browserName}}/{{getFileName ../../url}}-{{this}}.html">Run {{inc this 1}} {{capitalize ../browserName}}</a></li>
  {{/times}}

{{/each}}
<li class="disabled">
  <a href="#" aria-label="Next">
    <span aria-hidden="true">&raquo;</span>
  </a>
</li>
</ul>
</nav>
