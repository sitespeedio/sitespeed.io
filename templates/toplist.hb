<!DOCTYPE html>
<html lang="en">
{{> header}}
<div class="row">
    <div class="col-lg-12">
      {{> runSummary}}
    </div>
</div>
        <div class="row">
                  <div class="col-lg-12">
                    <div class="list-group">
                        <a href="#score" class="list-group-item">Pages with worst score</a>
                        <a href="#largestPages" class="list-group-item">Largest pages</a>
                        <a href="#largestImages" class="list-group-item">Largest images</a>
                        <a href="#largestAssets" class="list-group-item">Largest assets</a>
                        <a href="#slowestAssets" class="list-group-item">Slowest assets</a>
                        <a href="#worstCachedAssets" class="list-group-item">Worst cached assets</a>
                    </div>
                  </div>
          </div>

<div class="row">
  <div class="col-lg-6">
    <h3>Pages with worst score</h3>
      <table class="table table-condensed table-striped table-bordered" id="score">
        <thead>
         <tr>
          <th>url</th>
          <th>score</th>
         </tr>
        </thead>
    <tbody>
      {{#each lowestScoringPages}}
      <tr>
        <td>{{> displayUrlHeaders}} {{> displayUrl}}</td>
        <td>{{this.score}}</td>
      </tr>
      {{/each}}
    </tbody>
    </table>

  </div>

  <div class="col-lg-6">
     <h3>Largest pages</h3>
       <table class="table table-condensed table-striped table-bordered" id="largestPages">
         <thead>
          <tr>
           <th>url</th>
           <th>size (kb)</th>
          </tr>
         </thead>
     <tbody>
       {{#each heaviestPages}}
       <tr>
         <td>{{> displayUrlHeaders}} {{> displayUrl}}</td>
         <td>{{getKbSize this.yslow.pageWeight.v}}</td>
       </tr>
       {{/each}}
     </tbody>
     </table>
  </div>
</div>

<div class="row">
  <div class="col-lg-6">
    <h3>Largest images</h3>
      <table class="table table-condensed table-striped table-bordered" id="largestImages">
        <thead>
         <tr>
          <th>url</th>
          <th>size (kb)</th>
         </tr>
        </thead>
    <tbody>
      {{#each largestImages}}
      <tr>
        <td>{{> displayUrlHeaders}}{{> displayAssetUrl}} <a href="{{this.parent}}">p</a></td>
        <td>{{getKbSize this.size}}</td>
      </tr>
      {{/each}}
    </tbody>
  </table>
  </div>

  <div class="col-lg-6">
     <h3>Largest assets</h3>
       <table class="table table-condensed table-striped table-bordered" id="largestAssets">
         <thead>
          <tr>
           <th>url</th>
           <th>type</th>
           <th>size (kb)</th>
          </tr>
         </thead>
     <tbody>
       {{#each largestAssets}}
       <tr>
         <td>{{> displayUrlHeaders}}{{> displayAssetUrl}} <a href="{{this.parent}}">p</a></td>
         <td>{{this.type}}</td>
         <td>{{getKbSize this.size}}</td>
       </tr>
       {{/each}}
     </tbody>
   </table>
  </div>
</div>


<div class="row">
  <div class="col-lg-6">
    <h3>Worst cached assets</h3>
      <table class="table table-condensed table-striped table-bordered" id="worstCachedAssets">
        <thead>
         <tr>
          <th>url</th>
          <th>size (kb)</th>
         </tr>
        </thead>
    <tbody>
      {{#each worstCachedAssets}}
      <tr>
        <td>{{> displayUrlHeaders}}{{> displayAssetUrl}} <a href="{{this.parent}}">p</a></td>
        <td>{{getKbSize this.size}}</td>
      </tr>
      {{/each}}
    </tbody>
    </table>
  </div>

  <div class="col-lg-6">
     <h3>Slowest assets</h3>
       <table class="table table-condensed table-striped table-bordered" id="slowestAssets">
         <thead>
          <tr>
           <th>url</th>
           <th>size (kb)</th>
          </tr>
         </thead>
     <tbody>
       {{#each slowestAssets}}
       <tr>
         <td>{{> displayUrlHeaders}}{{> displayAssetUrl}} <a href="{{this.parent}}">p</a></td>
         <td>{{getKbSize this.size}}</td>
       </tr>
       {{/each}}
     </tbody>
     </table>
  </div>
</div>

    </div>
</div>

{{> footer}}
</body>
</html>
