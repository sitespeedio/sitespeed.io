<!DOCTYPE html>
<html lang="en">
{{> header}}
<div class="row">
  <div class="col-lg-12">
    {{> runSummary}}
    <!--{{> sitesWinner}}-->
    {{> sitesTable}}
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
