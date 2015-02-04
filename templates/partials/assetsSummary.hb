{{#if config.url}}
  <h2 class="url">
    The {{assets.length}} most used assets for <a href="{{config.url}}" target="_blank">{{config.url}}</a> ({{numberOfPages}} page{{getPlural numberOfPages}})
  </h2>
{{else}}
  <h2>The {{assets.length}} most used assets for URL:s in the file {{config.urls}} ({{numberOfPages}} page{{getPlural numberOfPages}})</h2>
{{/if}}

{{> testSummary}}
