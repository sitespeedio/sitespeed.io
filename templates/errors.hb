<!DOCTYPE html>
<html lang="en">
{{> header}}
<div class="row">
    <div class="col-lg-12">
      {{> runSummary}}

        <p>
          Got {{totalErrors}} error{{getPlural totalErrors}}.
        </p>
      {{#if hasErrors}}
          <h2>Download errors</h2>
          <dl>
            {{#each errors.downloadErrorUrls}}
                <dt>{{@key}}</dt>
                <dd>{{this}}</dd>
            {{/each}}
          </dl>
      {{/if}}

      {{#if hasErrors}}
          <h2>Analysis errors</h2>
          <dl>
            {{#each errors.analysisErrorUrls}}
                <dt>{{@key}}</dt>
                <dd>
                    <ul>
                      {{#each this}}
                          <li>{{@key}} - {{this}}</li>
                      {{/each}}
                    </ul>
                </dd>
            {{/each}}
          </dl>
      {{/if}}
    </div>
</div>

{{> footer}}
</body>
</html>
