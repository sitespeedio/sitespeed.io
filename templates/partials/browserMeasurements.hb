<div class="row">
  <div class="col-lg-12">
    <h4 id="browserTime"> Page tested with {{prettyBrowserName pageData.browserName}} version {{pageData.browserVersion}} on
      {{prettyOSName pageData.platform}} with {{timingRuns.length}} run{{getPlural timingRuns.length}}.
    </h4>
    <div class="table-responsive">
      <table class="table table-condensed table-striped table-bordered">
        <thead>
         <tr>
          <th>Name</th>
          <th>min</th>
          <th>median</th>
          <th>p90</th>
          <th>max</th>
         </tr>
        </thead>
       <tbody>
         {{#each statistics}}
           <tr>
             <td>{{name}} <a rel="tooltip"  data-placement="right" data-html="false" href="#" data-original-title="{{getTimingMetricsDefinition name}}"><i class="glyphicon glyphicon-question-sign"></i></a></td>
             <td>{{getDecimals min 1}}</td>
             <td>{{getDecimals median 1}}</td>
             <td>{{getDecimals p90 1}}</td>
             <td>{{getDecimals max 1}}</td>
           </tr>
        {{/each}}
       </tbody>
     </table>
   </div>
  </div>
</div>
