        {{#if config.url}}
        <h2 class="url">
            The {{assets.length}} most used assets for <a href="{{config.url}}" target="_blank">{{config.url}}</a> ({{numberOfPages}} page{{getPlural numberOfPages}})
        </h2>
       {{else}}
         <h2>   he {{assets.length}} most used assets for URL:s in the file {{config.file}} ({{numberOfPages}} page{{getPlural numberOfPages}})</h2>
       {{/if}}
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
