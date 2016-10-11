---
layout: default
title: WebPageTest - Documentation - sitespeed.io
description: Drive WebPageTest using sitespeed.io and include the metrics in your sitespeed.io report.
keywords: webpagetest, wpt, documentation, web performance, sitespeed.io
author: Peter Hedenskog
nav: documentation
image: https://www.sitespeed.io/img/sitespeed-2.0-twitter.png
twitterdescription: Drive WebPageTest using sitespeed.io and include the metrics in your sitespeed.io report.
---
[Documentation]({{site.baseurl}}/documentation/sitespeed.io/) / WebPageTest

# WebPageTest
{:.no_toc}

* Lets place the TOC here
{:toc}

## Using WebPageTest
Yep we all still love [WebPageTest](https://www.webpagetest.org/) (WPT), so we made it possible to drive an instance of and collect the data from it.

To use WPT you can either get an [API key](https://www.webpagetest.org/getkey.php) (sponsored by Akamai) for the global version or follow Pat Meenans instructions on how to get [a private version up and running in 5 minutes](http://calendar.perfplanet.com/2014/webpagetest-private-instances-in-five-minutes/). Or read how [WikiMedia setup there own instance using AWS](https://wikitech.wikimedia.org/wiki/WebPageTest).

## Configuration
Internally sitespeed.io uses the [WebPageTest API](https://github.com/marcelduran/webpagetest-api) so you can do almost the same thing as with the API standalone.

By default we the following configuration options:

~~~ bash
--webpagetest.host          The domain of your WebPageTest instance.                                        
--webpagetest.key           The API key for you WebPageTest instance.
--webpagetest.location      The location for the test                                                                      
--webpagetest.connectivity  The connectivity for the test.                                                                
--webpagetest.runs          The number of runs per URL.                                                                           
--webpagetest.custom        Execute arbitrary Javascript at the end of a test to collect custom metrics.
--webpagetest.script        Path to a script file
~~~

and if you need anything else adding your own CLI parameter will propagate to the WebPageTest API. Checkout the different [options](https://github.com/marcelduran/webpagetest-api#test-works-for-test-command-only) for the API. Say that you want to change the user agent of your test. In the API you do that with <code>--useragent</code> so you can pass the same by adding <code>--webpagetest.useragent</code> in the cli.

The default configuration for WebPageTest looks like this:

~~~ bash
{
  pollResults: 10,
  timeout: 600,
  includeRepeatView: false,
  private: true,
  aftRenderingTime: true,
  location: 'Dulles:Chrome',
  connectivity: 'Cable',
  video: true
}
~~~

### WebPageTest scripting

WebPageTest has scripting capability where you can automate a multi-step test (=login the user and do stuff). That is supported by sitespeed.io by supplying the script. Do like this. Create your script file (checkout [WebPageTest documentation](https://sites.google.com/a/webpagetest.org/docs/using-webpagetest/scripting)). It can look something like this (wptScript.txt):

~~~ bash
logData    0

// put any urls you want to navigate
navigate    www.aol.com
navigate    news.aol.com

logData    1

// this step will get recorded
navigate    news.aol.com/world
~~~

Then change your URL you want test (probably the last one) to \{\{\{URL\}\}\} and then all occurrences of \{\{\{URL\}\}\} will then be replaced with the current URL that should be tested. Then run sitespeed.io (and add the parameters as you usually do):

~~~ bash
sitespeed.io --webpagetest.script wptScript.txt --webpagetest.host  my.wpt.host.com http://example.org
~~~

### Custom metrics

Hey we love custom metrics and you can fetch them using WPT. Checkout the [metrics docs](https://sites.google.com/a/webpagetest.org/docs/using-webpagetest/custom-metrics) for WPT and then create a file containing your metrics:

~~~ bash
[iframe-count]
return document.getElementsByTagName("iframe").length;

[script-tag-count]
return document.getElementsByTagName("script").length;

[meta-viewport]
var viewport = undefined;
var metaTags=document.getElementsByTagName("meta");
for (var i = 0; i < metaTags.length; i++) {
    if (metaTags[i].getAttribute("name") == "viewport") {
        viewport = metaTags[i].getAttribute("content");
        break;
    }
}
return viewport;
~~~

Then run sitespeed.io like this:

~~~ bash
sitespeed.io --webpagetest.custom myScriptFile.txt --webpagetest.host my.wpt.host.com https://www.sitespeed.ip
~~~
