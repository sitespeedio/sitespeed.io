<!DOCTYPE html>
<html lang="en">
{{> header}}
<div class="row">
    <div class="col-lg-12">
      <h2>The budget</h2>
      <p>These are the results from the performance budget:</p>
      
        {{#each budget}}
        <p>
        {{#if isOk}}
          The budget for {{title}} {{url}} passed.
        {{else}}
          The budget for {{title}} {{url}} failed. {{description}}
        {{/if}}
        </p>
        {{/each}}

    </div>
</div>

{{> footer}}
</body>
</html>
