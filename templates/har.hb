<!DOCTYPE html>
<html lang="en">
{{> header}}
<link rel="stylesheet" href="{{#if config.assetPath}}{{config.assetPath}}{{else}}{{pageMeta.path}}{{/if}}css/simpleHar.css" />
<link rel="stylesheet" href="{{#if config.assetPath}}{{config.assetPath}}{{else}}{{pageMeta.path}}{{/if}}css/simpleHar-overrides.css" />


<div class="row">
    <div class="col-lg-12">
      <h2>HAR waterfall graph for {{capitalize browser}} run {{inc run 1}}</h2>
      <h3 class="url">
        Page <a href="{{decodeURIComponent url}}" target="_blank">{{decodeURIComponent url}}</a>
      </h3>
      <p>The HAR waterfall is created using a modified version of <a href="https://github.com/rafacesar/simplehar">Simple HAR</a> (originally created by <a href="https://github.com/rafacesar">Rafael Cesar</a>) and is under development.
      </p>

      <div class="hidden-xs hidden-sm">
      <div class="container sh-container">
      {{{har}}}
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

    <!--
    <div class="table-responsive">
    <table class="table table-condensed table-bordered">
      <thead>
        <tr>
            <th>RUM SpeedIndex</th>
            <th>FirstPaint</th>
            <th>DomContentLoadedTime</th>
            {{#each userTimings}}
              <th>{{name}}</th>
            {{/each}}
        </tr>
      </thead>
      <tbody>
        <tr>
            <td>{{getDecimals speedIndex}}</td>
            <td>{{getDecimals firstPaint 1}}</td>
            <td>{{getDecimals timings.domContentLoadedTime 1}}</td>
            {{#each userTimings}}
              <td>{{getDecimals startTime 1}}</td>
            {{/each}}
        </tr>
      </tbody>
    </table>
  </div>
-->

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
