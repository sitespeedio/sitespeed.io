<!DOCTYPE html>
<html lang="en">
{{> header}}
<div class="row">
    <div class="col-lg-12">
      <h2>The rules</h2>
      <p>The rules are a mashup between classic YSlow rules & new sitespeed.io rules, all are based on performance best practices. The current version of the rules is {{config.ruleSet}}.

        {{#each ruleDictionary}}
          <h3 id="{{name}}">{{name}}<em class="url"> ({{@key}})</em></h3>
          <p>{{info}}<em>Weight: {{weight}}</em></p>
        {{/each}}

    </div>
</div>

{{> footer}}
</body>
</html>
