Score:
<ol>
{{#each highestScore}}

<li><strong>{{getHostname this.site}} <small> - {{this.stats}} {{this.diff}}%</small></strong> </li>

{{/each}}
</ol>

Fastest:
<ol>
{{#each fastestSites}}

<li><strong>{{getHostname this.site}} <small> - {{this.stats}} {{this.diff}}%</small></strong> </li>

{{/each}}
</ol>
