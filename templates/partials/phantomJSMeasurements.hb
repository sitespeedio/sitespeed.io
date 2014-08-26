<div class="row">
  <div class="col-lg-12">
    <h4 id="browser"> Page tested with PhantomJS one run.
    </h4>
    <div class="table-responsive">
      <table class="table table-condensed table-striped table-bordered">
        <thead>
         <tr>
          <th>Name</th>
          <th>time (ms)</th>
         </tr>
        </thead>
       <tbody>
         {{#each phantomjsData.timings}}
           <tr>
             <td>{{@key}} <a rel="tooltip"  data-placement="right" data-html="false" href="#" data-original-title="{{getTimingMetricsDefinition @key}}"><i class="glyphicon glyphicon-question-sign"></i></a></td>
             <td>{{this}}</td>
           </tr>
        {{/each}}
        {{#each phantomjsData.userTimings.marks}}
          <tr>
            <td>{{this.name}} <a rel="tooltip"  data-placement="right" data-html="false" href="#" data-original-title="{{getTimingMetricsDefinition this.name}}"><i class="glyphicon glyphicon-question-sign"></i></a></td>
            <td>{{getDecimals this.startTime 1}}</td>
          </tr>
       {{/each}}
       </tbody>
     </table>
   </div>
  </div>
</div>
