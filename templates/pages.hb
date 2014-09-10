<!DOCTYPE html>
<html lang="en">
{{> header}}
<div class="row">
    <div class="col-lg-12">
      {{> runSummary}}

      <div class="table-responsive">
            <table class="table table-hover table-condensed table-striped table-bordered" id="pagesTable">
                <thead>
                <tr>
                    <th data-sort="string">
                        <a rel="tooltip"  data-placement="top" data-html="false" href="#" data-original-title="The URL to the page">url</a>
                    </th>
                    {{#each config.pageColumns}}
                    <th data-sort="float">
                    <a rel="tooltip"  data-placement="top" data-html="false" href="#" data-original-title="{{getColumnsMeta this ../columnsMeta ../ruleDictionary 'desc'}}">
                      {{getColumnsMeta this ../columnsMeta ../ruleDictionary 'title'}}
                    </a>
                    </th>
                    {{/each}}
                    <th data-sort="int">
                        <a rel="tooltip"  data-placement="top" data-html="false" href="#" data-original-title="The sitespeed.io rule grade for this page. 100 is perfect 0 is incredibe bad.">score</a>
                    </th>
                </tr>
                </thead>

                <tbody>
                  {{#each pages}}
                      <tr>
                          <td>
                            {{> displayUrlHeaders}}
                            <!-- TODO how to get the config-->
                            {{#if ../config.screenshot}}<a href="screenshots.html#{{getFileName this.url}}"><i class="glyphicon glyphicon-picture"></i></a>{{/if}}
                            {{> displayUrl}}</td>
                          {{#each ../config.pageColumns}}
                          <td>{{getPageColumnValue this ../this}}</td>
                          {{/each}}

                          <td><span class="label label-{{getRuleColor 'ruleScore' this.score ../config }}">{{this.score}}</span></td>
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
  $("#pagesTable").stupidtable();
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
