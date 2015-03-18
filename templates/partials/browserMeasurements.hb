<div class="row">
  <div class="col-lg-12">
    <h4 id="browser"> Page tested with {{capitalize browserName}} version {{browserVersion}} on
      {{prettyOSName platform}} with {{runs}} run{{getPlural runs}}.
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
         {{#each default.statistics}}
           <tr>
             <td>{{@key}} <a rel="tooltip"  data-placement="right" data-html="false" href="#" data-original-title="{{getTimingMetricsDefinition name}}"><i class="glyphicon glyphicon-question-sign"></i></a></td>
            <td>{{getDecimals min 1}}</td>
            <td>{{getDecimals median 1}}</td>
            <td>{{getDecimals p90 1}}</td>
            <td>{{getDecimals max 1}}</td>
           </tr>
        {{/each}}
       </tbody>
     </table>

     {{#if custom.data}}
      <h4>Custom scripts</h4>
        <table class="table table-condensed table-striped table-bordered">
          <thead>
            <tr>
              <th>Name</th>
              <th>Value</th>
            </tr>
          </thead>
       <tbody>
      {{#each custom.data}}
        {{#each this}}
          <tr>
            <td>{{@key}}</td>
            <td>{{this}}</td>
          </tr>
        {{/each}}
      {{/each}}
    </tbody>
    </table>
    {{/if}}
   </div>
  </div>
</div>
