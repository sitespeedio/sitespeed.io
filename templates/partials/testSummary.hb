{{#if config.name}}
    <h3>{{config.name}}</h3>
{{/if}}
<p>
    Test performed {{config.run.date}} with {{config.ruleSet}} rules.
</p>
<p>
<small>
{{#if config.ip}}
    <strong>IP:</strong> <em>{{config.ip}}</em>
{{/if}}
    <strong>User-Agent:</strong> <em>{{config.userAgent}}</em>
    <strong>Viewport:</strong> <em>{{config.viewPort}}</em>
</small>
</p>
