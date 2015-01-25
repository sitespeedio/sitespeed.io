<div class="row">
  <div class="col-lg-12">
      <h2 id="wpt">WebPageTest</h2>

      {{#each wptData}}

      <h3>{{{response.data.from}}} {{response.data.runs}} times

      {{response.data.median.firstView.browser_name}} version {{response.data.median.firstView.browser_version}}
      </h3>

      <p><a href="{{response.data.summary}}">WPT summary</a> - <a href="../data/webpagetest/{{getFileName ../url}}{{getWPTKey response.data.location response.data.connectivity}}-wpt.har">Download HAR</a></p></p>

      <div class="table-responsive">
        <table class="table table-condensed table-striped table-bordered">
          <thead>
           <tr>
            <th>View</th>
            <th>Load Time</th>
            <th>TTFB</th>
            <th>First paint</th>
            <th>Render time</th>
            <th>Fully Loaded</th>
            <th>Last Visual Change</th>
            <th>Speed Index</th>
            <th>Visual Complete</th>
            {{#each response.data.median.repeatView.userTimes}}
            <th>{{@key}}</th>
            {{/each}}
           </tr>
          </thead>
         <tbody>
             <tr>
               <td><strong>First View</strong></td>
               <td>{{response.data.median.firstView.loadTime}}</td>
               <td>{{response.data.median.firstView.TTFB}}</td>
               <td>{{response.data.median.firstView.firstPaint}}</td>
               <td>{{response.data.median.firstView.render}}</td>
               <td>{{response.data.median.firstView.fullyLoaded}}</td>
               <td>{{response.data.median.firstView.lastVisualChange}}</td>
               <td>{{response.data.median.firstView.SpeedIndex}}</td>
               <td>{{response.data.median.firstView.visualComplete}}</td>
               {{#each response.data.median.firstView.userTimes}}
               <td>{{this}}</td>
               {{/each}}
             </tr>
             {{#if response.data.median.repeatView}}
             <tr>
               <td><strong>Repeat View</strong></td>
               <td>{{response.data.median.repeatView.loadTime}}</td>
               <td>{{response.data.median.repeatView.TTFB}}</td>
               <td>{{response.data.median.repeatView.firstPaint}}</td>
               <td>{{response.data.median.repeatView.render}}</td>
               <td>{{response.data.median.repeatView.fullyLoaded}}</td>
               <td>{{response.data.median.repeatView.lastVisualChange}}</td>
               <td>{{response.data.median.repeatView.SpeedIndex}}</td>
               <td>{{response.data.median.repeatView.visualComplete}}</td>
               {{#each response.data.median.repeatView.userTimes}}
               <td>{{this}}</td>
               {{/each}}
             </tr>
             {{/if}}
         </tbody>
       </table>

      <h3>Waterfall first view</h3>

    <p>
      <img src="../data/webpagetest/{{getFileName ../url}}{{getWPTKey response.data.location response.data.connectivity}}-waterfall.png" class="img-responsive" alt="Waterfall first view"/>
    </p>
    {{#if response.data.median.repeatView}}
    <p>
      <h3>Waterfall repeated view</h3>
        <img src="../data/webpagetest/{{getFileName ../../url}}{{getWPTKey response.data.location response.data.connectivity}}-waterfall-repeat.png" class="img-responsive" alt="Waterfall repeated view"/>
    </p>
    {{/if}}

    {{/each}}
  </div>
</div>
