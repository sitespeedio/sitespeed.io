<!DOCTYPE html>
<html lang="en">
{{> header}}
<div class="row">
    <div class="col-lg-12">

      {{> domainSummary}}
      <h3>
        The max time each request timing took per domain
      </h3>

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
          <td><a href="{{this.blocked.maxTimeUrl}}">{{this.blocked.stats.max}}</a> <a href="pages/{{getFileName this.blocked.maxTimePageUrl}}.html#har"><span class="glyphicon glyphicon-search"></span></a></td>
          <td><a href="{{this.dns.maxTimeUrl}}">{{this.dns.stats.max}}</a> <a href="pages/{{getFileName this.dns.maxTimePageUrl}}.html#har"><span class="glyphicon glyphicon-search"></span></a></td>
          <td><a href="{{this.connect.maxTimeUrl}}">{{this.connect.stats.max}}</a> <a href="pages/{{getFileName this.connect.maxTimePageUrl}}.html#har"><span class="glyphicon glyphicon-search"></span></a></td>
          <td><a href="{{this.ssl.maxTimeUrl}}">{{this.ssl.stats.max}}</a> <a href="pages/{{getFileName this.ssl.maxTimePageUrl}}.html#har"><span class="glyphicon glyphicon-search"></span></a></td>
          <td><a href="{{this.send.maxTimeUrl}}">{{this.send.stats.max}}</a> <a href="pages/{{getFileName this.send.maxTimePageUrl}}.html#har"><span class="glyphicon glyphicon-search"></span></a></td>
          <td><a href="{{this.wait.maxTimeUrl}}">{{this.wait.stats.max}}</a> <a href="pages/{{getFileName this.wait.maxTimePageUrl}}.html#har"><span class="glyphicon glyphicon-search"></span></a></td>
          <td><a href="{{this.receive.maxTimeUrl}}">{{this.receive.stats.max}}</a> <a href="pages/{{getFileName this.receive.maxTimePageUrl}}.html#har"><span class="glyphicon glyphicon-search"></span></a></td>
          <td><a href="{{this.total.maxTimeUrl}}">{{this.total.stats.max}}</a> <a href="pages/{{getFileName this.total.maxTimePageUrl}}.html#har"><span class="glyphicon glyphicon-question-search"></span></a></td>
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
