{{#if pageMeta.isSites}}
  <h2> Sites analyzed from file {{config.sites}}</h2>
{{else}}
  {{#if config.url}}
    <h2 class="url">
      {{numberOfPages}} page{{getPlural numberOfPages}} analyzed for <a href="{{config.url}}" target="_blank">{{config.url}}</a>
    </h2>
  {{else}}
    {{#if config.file}}
      <h2> {{numberOfPages}} page{{getPlural numberOfPages}} analyzed for file {{config.file}}</h2>
    {{/if}}
  {{/if}}
{{/if}}

{{#if config.name}}
  <h3>{{config.name}}</h3>
{{/if}}

<p>Test performed {{config.run.date}} with {{config.ruleSet}} rules.</p>
<p>
  <small>
    {{#if config.ip}}
      <strong>IP:</strong> <em>{{config.ip}}</em>
    {{/if}}
    <strong>User-Agent:</strong> <em>{{config.userAgent}}</em>
    <strong>Viewport:</strong> <em>{{config.viewPort}}</em>
  </small>
</p>
