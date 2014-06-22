<!DOCTYPE html>
<html lang="en">
{{> header}}
<div class="row">
    <div class="col-lg-12">
      {{> runSummary}}

        <p>
          Got {{totalErrors}} error{{getPlural totalErrors}}.
        </p>
        {{{getErrorHTML errors.downloadErrorUrls}}}

        {{{getErrorHTML errors.analysisErrorUrls}}}

    </div>
</div>

{{> footer}}
</body>
</html>
