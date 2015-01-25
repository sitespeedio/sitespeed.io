<div class="row">
  <div class="col-lg-12">
    <h4 id="browser"> Page tested with
      {{#if config.slimerjs}}
      SlimerJS
      {{else}}
      PhantomJS
      {{/if}}
      
      {{config.no}} run{{getPlural config.no}}
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
         {{#each headlessData}}
           <tr>
             <td>{{this.id}} <a rel="tooltip"  data-placement="right" data-html="false" href="#" data-original-title="{{getTimingMetricsDefinition this.id}}"><i class="glyphicon glyphicon-question-sign"></i></a></td>
             <td>{{getDecimals this.stats.min 1}}</td>
             <td>{{getDecimals this.stats.median 1}}</td>
             <td>{{getDecimals this.stats.p90 1}}</td>
             <td>{{getDecimals this.stats.max 1}}</td>
           </tr>
        {{/each}}
       </tbody>
     </table>
   </div>
  </div>
</div>
