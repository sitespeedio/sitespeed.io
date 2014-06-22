<a href="#headers-{{@index}}" data-toggle="modal"> <i class="glyphicon glyphicon-zoom-in"></i></a>
  <div class="modal fade" id="headers-{{@index}}">
   <div class="modal-dialog">
    <div class="modal-content">
    <div class="modal-header">
      <h3 id="headersModalLabel-{{@index}}">Response headers</h3>
    </div>
    <div class="modal-body">
      <table class="table-hover table-condensed table-striped table-bordered">
        <thead>
          <tr>
            <th>Name</th>
            <th>Value</th>
          </tr>
        </thead>
        <tbody>
          {{#each this.headers.response}}
          <tr>
            <td>{{escapeExpression @key}}</td>
            <td>{{escapeExpression this}}</td>
          </tr>
          {{/each}}
        </tbody>
      </table>

    </div>
    <div class="modal-footer">
      <button class="btn" data-dismiss="modal" aria-hidden="true">Close</button>
    </div>
  </div>
  </div>
  </div>
