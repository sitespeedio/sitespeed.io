<!DOCTYPE html>
<html lang="en">
{{> header}}
<div class="row">
    <div class="col-lg-12">

      {{> domainSummary}}

      <div class="table-responsive">
        <table class="table table-condensed table-striped table-bordered" id="domainsTable">
          <thead>
           <tr>
            <th data-sort="string">domain</th>
            <th data-sort="int">blocked</th>
            <th data-sort="int">dns</th>
            <th data-sort="int">connect</th>
            <th data-sort="int">ssl</th>
            <th data-sort="int">send</th>
            <th data-sort="int">wait</th>
            <th data-sort="int">receive</th>
            <th data-sort="int">total</th>
            <th data-sort="int">nr of requests</th>
           </tr>
          </thead>
      <tbody>
        {{#each domains}}
        <tr>
          <td>{{this.domain}}</td>
          <td><a href="{{this.blocked.maxTimeUrl}}">{{this.blocked.stats.max}}</a></td>
          <td><a href="{{this.dns.maxTimeUrl}}">{{this.dns.stats.max}}</a></td>
          <td><a href="{{this.connect.maxTimeUrl}}">{{this.connect.stats.max}}</a></td>
          <td><a href="{{this.ssl.maxTimeUrl}}">{{this.ssl.stats.max}}</a></td>
          <td><a href="{{this.send.maxTimeUrl}}">{{this.send.stats.max}}</a></td>
          <td><a href="{{this.wait.maxTimeUrl}}">{{this.wait.stats.max}}</a></td>
          <td><a href="{{this.receive.maxTimeUrl}}">{{this.receive.stats.max}}</a></td>
          <td><a href="{{this.total.maxTimeUrl}}">{{this.total.stats.max}}</a></td>
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
