<!DOCTYPE html>
<html lang="en">
{{> header}}
<div class="row">
    <div class="col-lg-12">
      <h2>The budget</h2>
      <p>These are the results from the performance budget. We got {{noFailing}} failing and {{noWorking}} working.</p>

      {{#if isFailing}}
        <h3>Failing budgets [{{noFailing}}]</h3>
          {{#each failing}}
            {{#each this}}
              {{#if @first}}
                Rule {{title}} with limit [{{limit}}] failed for <ul>
              {{/if}}
            <li>{{> displayUrl}} [{{value}}]</li>
            {{#if @last}}
              </ul>
            {{/if}}
            {{/each}}
          {{/each}}
      {{else}}
        <h3>No failing budgets</h3>
      {{/if}}

      <h3>Working budgets [{{noWorking}}]</h3>
        <ul>
        {{#each budget}}
        {{#if isOk}}
          <li>The budget for {{title}} {{> displayUrl}} passed [{{value}}].</li>
        {{/if}}
        {{/each}}
      </ul>
    </div>
</div>

{{> footer}}
</body>
</html>
