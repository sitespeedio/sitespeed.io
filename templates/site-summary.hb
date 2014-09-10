<!DOCTYPE html>
<html lang="en">
{{> header}}
<div class="row">
    <div class="col-lg-12">
      {{> runSummary}}

      {{#each aggregates}}
        {{#bootstrapIsNewRow @index 3}}
          <div class="row">
        {{/bootstrapIsNewRow}}
          <div class="col-lg-{{getBootstrapSpan @index 3 ../aggregates.length}}">
            <div class="alert alert-{{getRuleColor id stats.median ../config}}">
              {{title}}
              <div>
                <!-- TODO implement To get green you need to have ...-->
                <a href="#" class="alert-{{getRuleColor id stats.median ../config}} large" rel="popover" data-html="true" data-trigger="hover" title="{{title}}" data-content="{{desc}}">
                  {{getHumanReadable this stats.median true}} </a> ({{getHumanReadable this stats.p90 true}})
              </div>
            </div>
          </div>
      {{#bootstrapIsEndRow @index ../aggregates.length 3}}
      </div> <!-- end row -->
      {{/bootstrapIsEndRow}}

      {{/each}}
      	<div class="row">
            <div class="col-lg-12">
            <i>* The value inside of the parentheses are the 95th percentile (95% of the time, the number is below this amount)</i>
            </div>
        </div>
        <div class="row">
            <div class="col-lg-12">
                <h3>The rules</h3>
                <p>
                <b>Sitespeed.io</b> score are based on the <a href="rules.html">rules</a>.
		               <span class="hidden-phone">
		                   Click <a href="detailed-site-summary.html">here</a> to see a detailed version of the summary.
		                </span>
                    The rules are simple:
                    <span class="label label-success">Green</span>
                    color means you don't need to do anything (of course there could still be things you can do to get better performance).
                    <span class="label label-warning">Yellow</span>
                    tells you that you should look into this, and guess what,
                    <span class="label label-danger">red</span>
                    means that something is really bad. The <span class="label label-info">blue</span> color are things for your information, no rules but things that will be good to know.
                </p>

            </div>
        </div>

    </div>
</div>

{{> footer}}
<script>
$(function ()
{ $("a[rel=popover]").popover();
});
</script>

</body>
</html>
