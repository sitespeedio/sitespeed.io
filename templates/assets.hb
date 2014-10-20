<!DOCTYPE html>
<html lang="en">
{{> header}}
<div class="row">
    <div class="col-lg-12">

      {{> assetsSummary}}

      <div class="table-responsive">
		    <table class="table table-condensed table-striped table-bordered" id="assetsTable">
			    <thead>
				   <tr>
					  <th data-sort="string">asset</th>
					  <th data-sort="string">type</th>
					  <th data-sort="int">time since last modification</th>
					  <th data-sort="int">cache time</th>
					  <th data-sort="float">size (kb)</th>
					  <th data-sort="int">nr of requests</th>
				   </tr>
			    </thead>
			<tbody>
        {{#each assets}}
        <tr>
          <td><div class="nobreak-asset-url">{{> displayUrlHeaders}}{{> displayAssetUrl}}</div></td>
          <td>{{this.type}}</td>
          <td data-sort-value="{{this.timeSinceLastModification}}">{{getPrettyPrintSeconds this.timeSinceLastModification}}</td>
          <td data-sort-value="{{this.cacheTime}}">{{getPrettyPrintSeconds this.cacheTime}}</td>
          <td data-sort-value="{{this.size}}">{{getKbSize this.size}}</td>
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
  $("#assetsTable").stupidtable();
});
</script>

</body>
</html>
