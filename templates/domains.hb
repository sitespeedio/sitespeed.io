<!DOCTYPE html>
<html lang="en">
{{> header}}
<div class="row">
    <div class="col-lg-12">

      {{> assetsSummary}}

      <div class="table-responsive">
        <table class="table table-condensed table-striped table-bordered" id="domainsTable">
          <thead>
           <tr>
            <th data-sort="string">domain</th>
            <th data-sort="float">blocked</th>
            <th data-sort="float">dns</th>
            <th data-sort="float">connect</th>
            <th data-sort="float">ssl</th>
            <th data-sort="float">send</th>
            <th data-sort="float">wait</th>
            <th data-sort="float">receive</th>
            <th data-sort="int">nr of requests</th>
           </tr>
          </thead>
      <tbody>
        {{#each domains}}
        <tr>
          <td>{{this.domain}}</td>
          <td>{{this.blocked.max}}</td>
          <td>{{this.dns.max}}</td>
          <td>{{this.connect.max}}</td>
          <td>{{this.ssl.max}}</td>
          <td>{{this.send.max}}</td>
          <td>{{this.wait.max}}</td>
          <td>{{this.receive.max}}</td>
          <td>{{this.count}}</td>
        </tr>
        {{/each}}
      </tbody>
    </table>
    </div>

    </div>
</div>

{{> footer}}
<script>
$(function(){
  $("#domainsTable").stupidtable();
});
</script>

</body>
</html>
