<h4>Size per Content-Type</h4>
<table class="table table-condensed table-striped table-bordered"  id="sizeContentTypeTable">
  <thead>
            <tr>
              <th data-sort="string">Type</th>
              <th data-sort="float">Size</th>
              <th data-sort="float">Percentage</th>
            </tr>
  </thead>
  <tbody>
      {{#each sizePerContentType}}
        <tr>
          <td>{{@key}}</td>
          <td>{{getKbSize this}}</td>
          <td>{{getPercentage this ../size 1}} %</td>
        </tr>
      {{/each}}
  </tbody>
</table>
