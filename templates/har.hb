<!DOCTYPE html>
<html lang="en">
{{> header}}
<link rel="stylesheet" href="{{#if config.assetPath}}{{config.assetPath}}{{else}}{{pageMeta.path}}{{/if}}css/simpleHar.css" />
<link rel="stylesheet" href="{{#if config.assetPath}}{{config.assetPath}}{{else}}{{pageMeta.path}}{{/if}}css/simpleHar-overrides.css" />


<div class="row">
    <div class="col-lg-12">
      <h2>HAR {{browser}} run {{inc run 1}}</h2>
      <h3 class="url">
        Page <a href="{{decodeURIComponent url}}" target="_blank">{{decodeURIComponent url}}</a>
      </h3>
      <div class="container sh-container">
      {{{har}}}
    </div>
    <p>
      {{#times config.no}}
        <a href="{{getFileName ../url}}-{{this}}.html">Run {{inc this 1}}</a>
      {{/times}}
    </p>

    <a href="../../data/har/{{browser}}/{{getFileName url}}.har">Download</a>
    </div>
</div>

{{> footerHAR}}

</body>
</html>
