<!DOCTYPE html>
<html lang="en">
{{> header}}
<div class="row">
    <div class="col-lg-12">
      {{> runSummary}}
      <h2>Detailed summary</h2>
    </div>
</div>
      <div class="row">
    <div class="col-lg-12">
        <div class="table-responsive">
        <table class="table table-hover table-condensed table-striped table-bordered" id="detailedTable">
            <thead>
                <tr>
                    <th data-sort="string">name</th>
                    <th>min</th>
                    <th>p10</th>
                    <th>median</th>
                    <th>p80</th>
                    <th>p90</th>
                    <th>p99</th>
                    <th>max</th>
                </tr>
            </thead>
            <tbody>

      {{#aggregates}}
        {{> detailedSummaryRow}}
      {{/aggregates}}
    </tbody>
  </table>
  </div>
  </div>
</div>

{{> footer}}
<script>
$(function(){
        $("#detailedTable").stupidtable();
         });
</script>

</body>
</html>
