<!DOCTYPE html>
<html lang="en">
{{> header}}
<link rel="stylesheet" href="{{#if config.assetPath}}{{config.assetPath}}{{else}}{{pageMeta.path}}{{/if}}css/simpleHar.css" />
<style>

/* Fix for sitespeed, we set the headers collide
*/
.headers {
   max-width: 1100px;
 }

/*
  Make the waterfall more compact
*/
 .url > div {
   padding:2px 5px;
 }

 .progress {
   margin-bottom:0;
   height:23px;
   border-radius:0;
   -webkit-box-shadow: none;
   box-shadow: none;
}

.progress-bar {
  -webkit-box-shadow: none;
  box-shadow: none;
 }

 /**
 Redirect background color
 */
 .sh-table .bg-redirect {
  background-color: #ffff61;
}

.sh-table .bg-missing {
 background-color: #e25f5c;
}


/** WPT waterfall colors
DNS 497b1e
Initial cf8124
SSL a83bcb
Tme to forst byte: 7ff62f
Content Download: 4374dc
*/



</style>

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
