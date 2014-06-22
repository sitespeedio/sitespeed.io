<h4>Cache</h4>
<table class="table table-condensed table-striped table-bordered">
  <tbody>
    <tr>
      <td>requests with primed cache</td>
      <td>{{rules.expiresmod.components.length}}</td>
    </tr>
    <tr>
      <td>median time since last modification</td>
      <td>
        {{getPrettyPrintSeconds timeSinceLastModificationStats.median}}
        </td>
    </tr>
    <tr>
      <td>median cache time</td>
      <td>
        {{getPrettyPrintSeconds cacheTimeStats.median}}
      </td>
    </tr>
    <tr>
      <td>assets cached</td>
      <td>
          {{getPercentage noOfAssetsThatIsCached assets.length 2}} %
      </td>
    </tr>
  </tbody>
</table>
