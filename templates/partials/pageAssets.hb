<h3 id="assets">Page assets</h3>
<div class="table-responsive">
  <table class="table table-condensed table-striped table-bordered" id="assetsTable">
    <thead>
      <tr>
        <th data-sort="string">url</th>
        <th data-sort="string">type</th>
        <th data-sort="int">time since last modification</th>
        <th data-sort="int">cache time</th>
        <th data-sort="float">size</th>
      </tr>
    </thead>
    <tbody>
      {{#each assets}}
      <tr>
      <td><div class="nobreak-asset-url">{{> displayUrlHeaders}}{{> displayAssetUrl}}</div></td>
      <td>{{type}}</td>
      <td data-sort-value="{{getTimeSinceLastMod this}}">{{getPrettyTimeSinceLastMod this}}</td>
      <td data-sort-value="{{getCacheTime this}}">{{getPrettyCacheTime this}}</td>
      <td data-sort-value="{{size}}">{{getKbSize size}}</td>
      </tr>
      {{/each}}
    </tbody>
    </table>
  </div>
