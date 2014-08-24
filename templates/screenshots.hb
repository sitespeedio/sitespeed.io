<!DOCTYPE html>
<html lang="en">
{{> header}}
<div class="row">
    <div class="col-lg-12">
      <h2>The screenshots for viewport {{config.viewPort}}</h2>
        {{#each pages}}
          <h3 id="{{getFileName this.url}}" class="url"><a href="{{this.url}}" target="_blank">{{this.url}}</a></h3>
		        <p>
		       	<a href="pages/{{getFileName this.url}}.html" title="Go to the full analyze"><img src="data/screenshots/{{getFileName this.url}}.png" class="img-thumbnail" alt="Screenshot of {{this.url}}"></a>
		        </p>
        {{/each}}
    </div>
</div>
{{> footer}}
</body>
</html>
