<h4>Requests per Content-Type</h4>
<table class="table table-condensed table-striped table-bordered" id="requestsContentTypeTable">
  <thead>
    <tr>
      <th data-sort="string">Type</th>
      <th data-sort="int">Requests</th>
      <th data-sort="float">Percentage</th>
    </tr>
  </thead>
  <tbody>
    {{#each assetsPerContentType}}
      <tr>
        <td>{{@key}}</td>
        <td>{{this}}</td>
        <td>{{getPercentage this ../assets.length 1}} %</td>
      </tr>
    {{/each}}
  </tbody>
</table>
