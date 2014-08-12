<!DOCTYPE html>
<html lang="en">
{{> header}}
<div class="row">
    <div class="col-lg-12">
      <h2 class="url">
			Page <a href="{{decodeURIComponent url}}" target="_blank">{{decodeURIComponent url}}</a> (score: {{score}})
      </h2>
    </div>
</div>

<div class="row">
      	<div class="col-lg-12">
      		<div class="list-group">
      				<a href="#" class="list-group-item active">Quick links</a>
      				<a href="#score" class="list-group-item">Scores below 100</a>
      				<a href="#assets" class="list-group-item">Page assets</a>
      				<a href="#summary" class="list-group-item">Page summary</a>
              {{#if config.googleKey}}
              <a href="#gpsi" class="list-group-item">Google Pagespeed Insights</a>
              {{/if}}
              {{#if config.webpagetestUrl}}
              <a href="#wpt" class="list-group-item">WebPageTest metrics</a>
              {{/if}}
              {{#if config.browser}}
              <a href="#browserTime" class="list-group-item">Timing metrics</a>
              {{/if}}
      		</div>
      	</div>
</div>


{{#if config.runYslow}}
<div class="row">
    <div class="col-lg-12">
      {{> displayRulesBelowGrade}}
    </div>
</div>

<div class="row">
    <div class="col-lg-12">
      {{> pageAssets}}
  </div>
</div>

<div class="row">
  <div class="col-lg-12">
    <h3 id="summary">Page summary</h3>
  </div>
</div>
<div class="row">
	<div class="col-lg-6">
    {{> requestsPerContentType}}
	</div>

  <div class="col-lg-6">
	   {{> sizePerContentType}}
  </div>
</div>

		<div class="row">
			<div class="col-lg-6">
				{{> requestsPerDomain}}
      </div>
      	<div class="col-lg-6">
				{{> pageContentInfoBox}}
			</div>
		</div>

		<div class="row">
			<div class="col-lg-6">
			    {{> cacheBox}}
			</div>
			<div class="col-lg-6">

			</div>
		</div>
    {{/if}}

    {{#if config.googleKey}}
    <div class="row">
        <div class="col-lg-12">
          {{>gpsi}}
        </div>
    </div>
    {{/if}}

    {{#if config.webpagetestUrl}}
    <div class="row">
        <div class="col-lg-12">
          {{>wpt}}
        </div>
    </div>
    {{/if}}

    {{#if config.browser}}
      {{#each browsertimeData}}
        {{>browserMeasurements}}
    {{/each}}
    {{/if}}
{{> footer}}
<script>
		   $(function(){
				$("#scoreTable").stupidtable();
        $("#assetsTable").stupidtable();
        $("#domainsTable").stupidtable();
        $("#requestsContentTypeTable").stupidtable();
        $("#sizeContentTypeTable").stupidtable();
        $("#gpsiTable").stupidtable();
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
