
      <h2 id="gpsi">Google Page Speed Insights score: {{gpsiData.score}}</h2>

      <table class="table table-condensed table-striped table-bordered" id="gpsiTable">
        <thead>
          <tr>
          <th data-sort="string">Rule</th>
          <th data-sort="float">Impact</th>
          <th>Info</th>
        </tr>
        </thead>
      {{#each gpsiData.formattedResults.ruleResults}}
         <tr>
           <td>{{this.localizedRuleName}}</td>
           <td>{{getDecimals this.ruleImpact 2}}</td>
           <td class='nobreak-page'>
            {{#each this.urlBlocks}}
              {{{formatGPSIResult this}}}
            {{/each}}
          </td>
        </tr>
      {{/each}}
    </table>
