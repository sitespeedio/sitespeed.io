<div class="row">
  <div class="col-lg-12">
    <h4 id="browserTime"> Page tested with {{pageData.browserName}} version {{pageData.browserVersion}} on
      {{pageData.platform}} with {{timingRuns.length}} run(s).
       Using SPDY: {{pageData.wasFetchedViaSpdy}}
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
             <td><rel="tooltip"  data-placement="top" data-html="false" href="#" data-original-title="{{getTimingMetricsDefinition name}}">{{name}}</a></td>
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
