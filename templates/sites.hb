<!DOCTYPE html>
<html lang="en">
{{> header}}
<div class="row">
    <div class="col-lg-12">
      {{> runSummary}}

      <div class="table-responsive">
            <table class="table table-hover table-condensed table-striped table-bordered" id="sitesTable">
              <thead>
                <tr>
                  <th>Site
                  </th>
                  {{#each columns}}
                  <th data-sort="float">
                    {{this}}
                  </th>
                  {{/each}}
                </tr>
              </thead>
              <tbody>
                {{#each sitesAndAggregates}}
              <tr>
                <td>
                <a href="{{getHostname this.site}}/index.html">{{this.site}}</a>
                </td>
                {{#each aggregates}}
                  <td data-sort-value="{{stats.median}}">{{getHumanReadable this stats.median true}}</td>
                {{/each}}
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
$("#sitesTable").stupidtable();
});
</script>

<script>
$(function () {
$('.container').tooltip({
  selector: "a[rel=tooltip]"
  })
})
</script>
</body>
</html>
