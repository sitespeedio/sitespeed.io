<head>
  <meta charset="utf-8">
  <title>{{pageMeta.title}}</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0,maximum-scale=1">
  <meta name="description" content="{{pageMeta.description}}">
  <meta name="keywords" content="results,sitespeed.io,site speed,speed test, perfmatters, webperf">
  <link rel="stylesheet" href="{{#if config.assetPath}}{{config.assetPath}}{{else}}{{pageMeta.path}}{{/if}}css/bootstrap.min.css" type="text/css">
  <link rel="stylesheet" href="{{#if config.assetPath}}{{config.assetPath}}{{else}}{{pageMeta.path}}{{/if}}css/bootstrap-overrides.css" type="text/css">
<link rel="apple-touch-icon-precomposed" sizes="144x144" href="{{#if config.assetPath}}{{config.assetPath}}{{else}}{{pageMeta.path}}{{/if}}img/ico/sitespeed.io-144.png">
<link rel="apple-touch-icon-precomposed" sizes="114x114" href="{{#if config.assetPath}}{{config.assetPath}}{{else}}{{pageMeta.path}}{{/if}}img/ico/sitespeed.io-114.png">
<link rel="apple-touch-icon-precomposed" sizes="72x72" href="{{#if config.assetPath}}{{config.assetPath}}{{else}}{{pageMeta.path}}{{/if}}img/ico/sitespeed.io-72.png">
<link rel="apple-touch-icon-precomposed" href="{{#if config.assetPath}}{{config.assetPath}}{{else}}{{pageMeta.path}}{{/if}}img/ico/sitespeed.io-57.png">
<link rel="shortcut icon" href="{{#if config.assetPath}}{{config.assetPath}}{{else}}{{pageMeta.path}}{{/if}}img/ico/sitespeed.io.ico">
</head>

<body>
  <nav class="navbar navbar-default" role="navigation">
    <div class="container">
      <div class="navbar-header">
        <!-- .navbar-toggle is used as the toggle for collapsed navbar content -->
        <button type="button" class="navbar-toggle" data-toggle="collapse" data-target=".sitespeed-collapse">
          <span class="icon-bar"></span>
          <span class="icon-bar"></span>
          <span class="icon-bar"></span>
        </button>
        <img src="{{#if config.assetPath}}{{config.assetPath}}{{else}}{{pageMeta.path}}{{/if}}img/sitespeed-logo.png" class="navbar-brand" alt="Sitespeed.io - How speedy is your site?" width="162" height="50"/>
      </div>
      <!-- Place everything within .navbar-collapse to hide it until above 768px -->
    {{#unless pageMeta.hideMenu}}
    <nav class="collapse navbar-collapse sitespeed-collapse">
       <ul class="nav navbar-nav">
            <li {{#if pageMeta.isSummary}} class="active" {{/if}}>
              <a href="{{pageMeta.path}}index.html">Summary</a>
            </li>
            <li{{#if pageMeta.isDetailedSummary}} class="active" {{/if}}>
              <a href="{{pageMeta.path}}detailed-site-summary.html">Detailed summary</a>
            </li>
            <li{{#if pageMeta.isPages}} class="active" {{/if}}>
              <a href="{{pageMeta.path}}pages.html">Pages</a>
            </li>
            {{#if config.runYslow}}
            <li{{#if pageMeta.isAssets}} class="active" {{/if}}>
              <a href="{{pageMeta.path}}assets.html">Assets</a>
            </li>
            {{/if}}
            <li{{#if pageMeta.isHotlist}} class="active" {{/if}}>
              <a href="{{pageMeta.path}}hotlist.html">Hotlist</a>
            </li>
            {{#if config.browsertime}}
              <li{{#if pageMeta.isDomains}} class="active" {{/if}}>
                <a href="{{pageMeta.path}}domains.html">Domains</a>
              </li>
            {{else}}
              {{#if config.wptHost}}
              <li{{#if pageMeta.isDomains}} class="active" {{/if}}>
                <a href="{{pageMeta.path}}domains.html">Domains</a>
              </li>
              {{/if}}
            {{/if}}
            {{#if config.budget}}
              <li{{#if pageMeta.isBudget}} class="active" {{/if}}>
                <a href="{{pageMeta.path}}budget.html">Budget</a>
              </li>
            {{/if}}
            {{#if config.screenshot}}
              <li{{#if pageMeta.isScreenshots}} class="active" {{/if}}>
                <a href="{{pageMeta.path}}screenshots.html">Screenshots</a>
              </li>
            {{/if}}
            <li{{#if pageMeta.isErrors}} class="active" {{/if}}>
              <a href="{{pageMeta.path}}errors.html">Errors</a>
            </li>
          </ul>
        </nav><!-- /.nav-collapse -->
        {{/unless}}
    </div><!-- /.container -->
  </nav><!-- /.navbar -->

  <div class="container">
