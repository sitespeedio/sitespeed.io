<h3 id="score">Scores below 100</h3>

  <div class="table-responsive">
    <table class="table table-condensed table-striped table-bordered" id="scoreTable">
      <thead>
        <tr>
          <th>Rule</th>
          <th data-sort="int">Score</th>
          <th>Message</th>
          <th>Extra</th>
        </tr>
        </thead>
        <tbody>
          {{#each rules}}
            {{#isLowerThan score 100}}
            <tr>
              <td>
                <em>{{getMatchingRuleName @key ../../ruleDictionary}}</em>
                ({{@key}})
              </td>
              <td>{{score}}</td>
              <td class="nobreak-page">{{{message}}}</td>
              <td class="nobreak-page">
                  {{#each components}}
                    <p>{{decodeURIComponent this}}</p>
                  {{/each}}
              </td>
            </tr>
            {{/isLowerThan}}
          {{/each}}

        </tbody>
      </table>
    </div>
