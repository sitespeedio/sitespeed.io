{{#if pageMeta.isSites}}
  <h2>Analyzed sites</h2>
{{else}}
  {{#if config.url}}
    <h2 class="url">
      {{numberOfPages}} page{{getPlural numberOfPages}} analyzed for <a href="{{config.url}}" target="_blank">{{config.url}}</a>
    </h2>
  {{else}}
    {{#if config.urls}}
      <h2> {{numberOfPages}} page{{getPlural numberOfPages}} analyzed for file {{config.urls}}</h2>
    {{/if}}
  {{/if}}
{{/if}}

{{> testSummary}}
