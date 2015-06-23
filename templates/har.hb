<!DOCTYPE html>
<html lang="en">
{{> header}}
<link rel="stylesheet" href="{{#if config.assetPath}}{{config.assetPath}}{{else}}{{pageMeta.path}}{{/if}}css/simpleHar.css" />
<link rel="stylesheet" href="{{#if config.assetPath}}{{config.assetPath}}{{else}}{{pageMeta.path}}{{/if}}css/simpleHar-overrides.css" />


<div class="row">
    <div class="col-lg-12">
      <h2>HAR {{capitalize browser}} run {{inc run 1}}</h2>
      <h3 class="url">
        Page <a href="{{decodeURIComponent url}}" target="_blank">{{decodeURIComponent url}}</a>
      </h3>
      <div class="hidden-xs hidden-sm">
      <div class="container sh-container">
      {{{makeSafe har}}}
    </div>
  </div>
      <div class="visible-xs visible-sm">
      You need to have a large screen to see the HAR waterfall graph.
      </div>

    <nav class="text-center">
      <ul class="pagination">
        <li class="disabled">
          <a href="#" aria-label="Previous">
            <span aria-hidden="true">&laquo;</span>
          </a>
        </li>
        {{#times config.no}}
          <li><a href="{{getFileName ../url}}-{{this}}.html">Run {{inc this 1}}</a></li>
          {{/times}}
        <li class="disabled">
          <a href="#" aria-label="Next">
            <span aria-hidden="true">&raquo;</span>
          </a>
        </li>
      </ul>
    </nav>

    <nav>
      <ul class="pager">
        <li><a href="../../data/har/{{browser}}/{{getFileName url}}.har">Download the HAR</a></li>
      </ul>
    </nav>

    </div>
</div>

{{> footerHAR}}

</body>
</html>
