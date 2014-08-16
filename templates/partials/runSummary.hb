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

{{> testSummary}}
