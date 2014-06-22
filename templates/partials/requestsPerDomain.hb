<h4>Per Domain ({{noOfDomains}})</h4>
<table class="table table-condensed table-striped table-bordered" id="domainsTable">
  <thead>
    <tr>
      <th data-sort="string">Domain</th>
      <th data-sort="int">Requests</th>
      <th data-sort="float">Size</th>
      </tr>
  </thead>
  <tbody>
    {{#each assetsPerDomain}}
      <tr>
        <td>{{@key}}</td>
        <td>{{this}}</td>
        <td>{{getPrettySizeForDomain @key ../assets}}</td>
      </tr>
    {{/each}}
  </tbody>
</table>
