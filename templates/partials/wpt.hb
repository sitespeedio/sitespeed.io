<div class="row">
  <div class="col-lg-12">
      <h2 id="wpt">WebPageTest</h2>
      <p>{{{wptData.response.data.from}}}</p> {{wptData.response.data.runs}}

      {{wptData.response.data.median.firstView.browser_name}} {{wptData.response.data.median.firstView.browser_version}}

      <p><a href="{{wptData.response.data.summary}}">WPT summary</a> - <a href="../data/webpagetest/{{getFileName this.url}}-wpt.har">Download HAR</a></p></p>

      <div class="table-responsive">
        <table class="table table-condensed table-striped table-bordered">
          <thead>
           <tr>
            <th>View</th>
            <th>Load Time</th>
            <th>TTFB</th>
            <th>First paint</th>
            <th>Fully Loaded</th>
            <th>Last Visual Change</th>
            <th>Speed Index</th>
            <th>Visual Complete</th>
           </tr>
          </thead>
         <tbody>
             <tr>
               <td><strong>First View</strong></td>
               <td>{{wptData.response.data.median.firstView.loadTime}}</td>
               <td>{{wptData.response.data.median.firstView.TTFB}}</td>
               <td>{{wptData.response.data.median.firstView.firstPaint}}</td>
               <td>{{wptData.response.data.median.firstView.fullyLoaded}}</td>
               <td>{{wptData.response.data.median.firstView.lastVisualChange}}</td>
               <td>{{wptData.response.data.median.firstView.SpeedIndex}}</td>
               <td>{{wptData.response.data.median.firstView.visualComplete}}</td>
             </tr>
             {{#if wptData.response.data.median.repeatView}}
             <tr>
               <td><strong>Repeat View</strong></td>
               <td>{{wptData.response.data.median.repeatView.loadTime}}</td>
               <td>{{wptData.response.data.median.repeatView.TTFB}}</td>
               <td>{{wptData.response.data.median.repeatView.firstPaint}}</td>
               <td>{{wptData.response.data.median.repeatView.fullyLoaded}}</td>
               <td>{{wptData.response.data.median.repeatView.lastVisualChange}}</td>
               <td>{{wptData.response.data.median.repeatView.SpeedIndex}}</td>
               <td>{{wptData.response.data.median.repeatView.visualComplete}}</td>
             </tr>
             {{/if}}
         </tbody>
       </table>


      <h3>Waterfall first view</h3>

    <p>
      <img src="../data/webpagetest/{{getFileName this.url}}-waterfall.png" class="img-responsive" alt="Waterfall first view"/>
    </p>
    {{#if wptData.response.data.median.repeatView}}
    <p>
      <h3>Waterfall repeated view</h3>
        <img src="../data/webpagetest/{{getFileName this.url}}-waterfall-repeat.png" class="img-responsive" alt="Waterfall repeated view"/>
    </p>
    {{/if}}
  </div>
</div>
