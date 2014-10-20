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
                        {{#if config.runYslow}}
                        <a href="#score" class="list-group-item">Pages with worst score</a>
                        <a href="#largestPages" class="list-group-item">Largest pages</a>
                        <a href="#largestImages" class="list-group-item">Largest images</a>
                        <a href="#largestAssets" class="list-group-item">Largest assets</a>
                        <a href="#worstCachedAssets" class="list-group-item">Worst cached assets</a>
                        {{/if}}
                        {{#if config.browsertime}}
                        <a href="#slowestAssets" class="list-group-item">Slowest assets</a>
                        <a href="#slowestDomains" class="list-group-item">Slowest domains</a>
                        {{/if}}
                    </div>
                  </div>
          </div>

{{#if config.runYslow}}
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
        <td><div class="nobreak-asset-url">{{> displayUrl}}</div></td>
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
         <td><div class="nobreak-asset-url">{{> displayUrl}}</div></td>
         <td>{{getKbSize this.yslow.pageWeight.v}}</td>
       </tr>
       {{/each}}
     </tbody>
     </table>
  </div>
</div>

<div class="row">
  <div class="col-lg-12">
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
        <td><div class="nobreak-asset-url">{{> displayAssetUrl}} <a href="{{this.parent}}" title="Example page where the image is used"><span class="glyphicon glyphicon-home"></span></a></div></td>
        <td>{{getKbSize this.size}}</td>
      </tr>
      {{/each}}
    </tbody>
  </table>
  </div>
</div>

<div class="row">
  <div class="col-lg-12">
     <h3>Largest assets excluding images</h3>
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
         <td><div class="nobreak-asset-url">{{> displayAssetUrl}} <a href="{{this.parent}}" title="Example page where the asset is used"><span class="glyphicon glyphicon-home"></span></a></div></td>
         <td>{{this.type}}</td>
         <td>{{getKbSize this.size}}</td>
       </tr>
       {{/each}}
     </tbody>
   </table>
  </div>
</div>

<div class="row">
  <div class="col-lg-12">
    <h3>Worst cached assets</h3>
      <table class="table table-condensed table-striped table-bordered" id="worstCachedAssets">
        <thead>
         <tr>
          <th>url</th>
          <th>time since last modification</th>
          <th>cache time</th>
         </tr>
        </thead>
    <tbody>
      {{#each worstCachedAssets}}
      <tr>
        <td>{{> displayAssetUrl}} <a href="{{this.parent}}"><span class="glyphicon glyphicon-home"></span></a></td>
        <td data-sort-value="{{this.timeSinceLastModification}}">{{getPrettyPrintSeconds this.timeSinceLastModification}}</td>
        <td data-sort-value="{{this.cacheTime}}">{{getPrettyPrintSeconds this.cacheTime}}</td>
      </tr>
      {{/each}}
    </tbody>
    </table>
  </div>
</div>
{{/if}}

{{#if config.browsertime}}
<div class="row">
  <div class="col-lg-12">
     <h3>Slowest assets</h3>
       <table class="table table-condensed table-striped table-bordered" id="slowestAssets">
         <thead>
          <tr>
           <th>url</th>
           <th>time (ms)</th>
          </tr>
         </thead>
     <tbody>
       {{#each slowestAssets}}
       <tr>
         <td><div class="nobreak-asset-url">{{> displayAssetUrl}} <a href="{{this.parent}}" title="Example page where the asset is used"><span class="glyphicon glyphicon-home"></span></a></div></td>
         <td>{{this.timing.stats.max}}</td>
       </tr>
       {{/each}}
     </tbody>
     </table>
  </div>
</div>
{{/if}}


{{#if config.browsertime}}
<div class="row">
  <div class="col-lg-12">
     <h3>Slowest domains</h3>
       <table class="table table-condensed table-striped table-bordered" id="slowestDomains">
         <thead>
          <tr>
           <th>domain</th>
           <th>time (ms)</th>
          </tr>
         </thead>
     <tbody>
       {{#each slowestDomains}}
       <tr>
         <td>{{this.domain}}</td>
         <td>{{this.total.stats.max}}</td>
       </tr>
       {{/each}}
     </tbody>
     </table>
  </div>
</div>
{{/if}}

{{> footer}}
</body>
</html>
