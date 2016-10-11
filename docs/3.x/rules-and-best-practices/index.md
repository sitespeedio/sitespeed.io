---
layout: default
title: The performace best practices rules used by Sitespeed.io
description: Here are the list of performance best practices rules used by sitespeed.io when analyzing your website. It will check for SPOF, synchronously loaded javascripts inside head and a lot of more things.
author: Peter Hedenskog
keywords: sitespeed.io, rules, wpo, fast, speed, web performance optimization, best practices
nav: documentation

---
[Documentation 3.x](/documentation/) / Rules and best practices

# The rules
{:.no_toc}

Sitespeed.io uses performance best practices rules to decide if a page is optimized for performance. The idea of rules for performance was started by Steve Souders
[14 rules for faster loading websites](http://stevesouders.com/hpws/rules.php) in 2007. Those rules and a couple of more is implemented in YSlow. Sitespeed.io uses these rules and approx. 20 more (it has happened things since 2007). You can see all rules used [here](#allrules). There are two set of rules; desktop & mobile. Desktop is the default one and described on this page. The mobile rules are the same rules, but they have different weight.
    You can see the exact implementation [here](https://github.com/soulgalore/yslow/blob/master/src/common/rulesets/ruleset_sitespeed.js).

## Don't break the rules!
{:.no_toc}

Sitespeed.io is very demanding on your site, it will test/analyze and punish hard if you have broken the most important rules.

Sitespeed.io uses about 20 of the basic rules from YSlow (read about them
        [here](http://yslow.org#web_performance_best_practices_and_rules) and [here](https://github.com/marcelduran/yslow/wiki/Ruleset-Matrix) and then there are the sitespeed.io specific rules.

## The rules
{:.no_toc}

* Lets place the TOC here
{:toc}  

### Critical Rendering Path
Every request fetched inside of HEAD, will postpone the rendering of the page! Do not load javascript synchronously inside of head, load files from the same domain as the main document (to avoid DNS lookups) and inline CSS for a really fast rendering path. The scoring system for this rule, will give you minus score for synchronously loaded javascript inside of head, CSS files requested inside of head and minus for every DNS lookup inside of head. If you want to have a really fast first paint (and you always want that), make sure to score high on this rule.


You can read more about the critical rendering path in [this](http://calendar.perfplanet.com/2012/deciphering-the-critical-rendering-path/) article by Ilya Grigorik and [this](http://www.phpied.com/css-and-the-critical-path/) post by Stoyan Stefanov.
{: .note .note-info}


### Never scale images in HTML
Images should always be sent with the correct size else the browser will download an image that is larger than necessary. This is more important today with responsive web design, meaning you want to avoid downloading non scaled images to a mobile phone or tablet. Note: This rule doesn't check images with size 0 (images in carousels etc), so they will be missed by the rule.


Set the viewport size when you analyze a page and you will get the real image size & the image screen size with this rule!
{: .note .note-info}

### Frontend single point of failure (SPOF)
A page can be stopped to be loaded in the browser, if a single script, css and in some cases a font couldn't be fetched or loading slow (the white screen of death!). You really want to avoid that. Never load 3rd party components inside of head!  One important note, right now this rule treats domain and subdomains as ok, that match the document domain, all other domains is treated as a SPOF. The score is calculated like this: Synchronously loaded javascripts inside of head, hurts you the most & then CSS files inside of head hurts a little less. You can also look for Font Face inside of CSS files and  inline font face files, but they are considered minor and not turned on by default. One rule SPOF rule missing is the IE specific feature, that a font face will be SPOF if a script is requested before the font face file.



Read more about SPOF in [this](http://www.stevesouders.com/blog/2010/06/01/frontend-spof/") nice blog post by Steve Souders.
{: .note .note-info}


### Low number of total requests
Avoid have too many requests on your page. The more requests, the slower the page will be. This is extremely important on mobile devices, keep the requests as few as possible. But remember that using SPDY and the forthcoming HTTP 2.0, requests to the same domain will be done at the same time, meaning the total number of requests will be less important.

### Do not load specific CSS file for print
Loading a specific stylesheet for print, can block rendering in your browser (depending on version) and will for almost all browsers, block the onload event to fire (even though the print stylesheet isn't even used). In the old times, it was ok to have own print styles, but nowadays you can keep them in the same CSS file.


You can read more about it [here](http://www.phpied.com/5-years-later-print-css-still-sucks/).
{: .note .note-info}

### Load CSS in HEAD from document domain
CSS files inside of the HEAD tag, should be loaded from the same domain as the main document, in order to avoid DNS lookups. This is extra important for mobile. This rule exist in YSLow don't work on PhantomJS. This modified version do.

### Never load JS synchronously in HEAD
Javascript files should never be loaded synchronously inside the HEAD tag, because it will block the rendering of the page. This rule exist in YSLow don't work on PhantomJS. This modified version do.

### Avoid use of web fonts
Avoid use of web fonts because they will decrease the performance of the page. Web fonts are faster today then they ever has been, but still they will decrease performance.


Read [more](http://www.stevesouders.com/blog/2009/10/13/font-face-and-performance/) about avoiding web fonts.
{: .note .note-info}

### Have expire headers for static components
This is a modified version of YSlow expire rule, it will look for assets without any expire headers, meaning all assets without any expire headers will be reported.

### Have expires headers equals or longer than one year
Having really long cache headers are beneficial for caching.

### Avoid DNS lookups when the page has few request
If you have few requests on a page, they should all be on the same domain to avoid DNS lookups, because the lookups will cost much. This rule only kicks in if you have fewer request than 10 on the page.

### Do not load stylesheet files when the page has few request
When a page has few requests (or actually maybe always if you don't have a massive amount of CSS), it is better to inline the CSS, to make the page to start render as early as possible.

### Have a reasonable percentage of textual content compared to the rest of the page
Make sure you don't have too much styling etc that hides the text you want to deliver.


### Load third party JS asynchronously
Always load third party javascript asynchronously. Third parties that will be checked are Twitter, Facebook, Google (api, analytics, ajax), LinkedIn, Disqus, Pinterest & JQuery.


Read more about asynchronously third party scripts [here](http://www.phpied.com/3PO#async). This rule is borrowed from Stoyan Stefanov :)
{: .note .note-info}

<!-- Genererated from a sitespeed run -->

<h2>The rules</h2>
 <p>The rules are a mashup between classic YSlow rules & new sitespeed.io rules, all are based on performance best practices. The current version of the rules is sitespeed.io-desktop.

     <h3 id="Avoid slowing down the critical rendering path">Avoid slowing down the critical rendering path<em class="url"> (criticalpath)</em></h3>
     <p>Every request fetched inside of HEAD, will postpone the rendering of the page! Do not load javascript synchronously inside of head, load files from the same domain as the main document (to avoid DNS lookups) and inline CSS for a really fast rendering path. The scoring system for this rule, will give you minus score for synchronously loaded javascript inside of head, css files requested inside of head and minus score for every DNS lookup inside of head.<em>Weight: 15</em></p>
     <h3 id="Frontend single point of failure">Frontend single point of failure<em class="url"> (spof)</em></h3>
     <p> A page can be stopped to be loaded in the browser, if a single script, css and in some cases a font couldn&#x27;t be fetched or loading slow (the white screen of death), and that is something you really want to avoid. Never load 3rd party components inside of head!  One important note, right now this rule treats domain and subdomains as ok, that match the document domain, all other domains is treated as a SPOF. The score is calculated like this: Synchronously loaded javascripts inside of head, hurts you the most, then CSS files inside of head hurts a little less, font face inside of css files further less, and least inline font face files. One rule SPOF rule missing is the IE specific feature, that a font face will be SPOF if a script is requested before the font face file.<em>Weight: 5</em></p>
     <h3 id="Make fewer HTTP requests for CSS files">Make fewer HTTP requests for CSS files<em class="url"> (cssnumreq)</em></h3>
     <p>Decreasing the number of components on a page reduces the number of HTTP requests required to render the page, resulting in faster page loads. Combine your CSS files into as few as possible.<em>Weight: 8</em></p>
     <h3 id="Make fewer HTTP requests for CSS image files">Make fewer HTTP requests for CSS image files<em class="url"> (cssimagesnumreq)</em></h3>
     <p>Decreasing the number of components on a page reduces the number of HTTP requests required to render the page, resulting in faster page loads. Combine your CSS images files into as few CSS sprites as possible.<em>Weight: 8</em></p>
     <h3 id="Make fewer synchronously HTTP requests for Javascript files">Make fewer synchronously HTTP requests for Javascript files<em class="url"> (jsnumreq)</em></h3>
     <p>Decreasing the number of components on a page reduces the number of HTTP requests required to render the page, resulting in faster page loads. Combine your Javascript files into as few as possible (and load them asynchronously).<em>Weight: 8</em></p>
     <h3 id="Avoid empty src or href">Avoid empty src or href<em class="url"> (yemptysrc)</em></h3>
     <p>You may expect a browser to do nothing when it encounters an empty image src.  However, it is not the case in most browsers. IE makes a request to the directory in which the page is located; Safari, Chrome, Firefox 3 and earlier make a request to the actual page itself. This behavior could possibly corrupt user data, waste server computing cycles generating a page that will never be viewed, and in the worst case, cripple your servers by sending a large amount of unexpected traffic.<em>Weight: 30</em></p>
     <h3 id="Compress components with gzip">Compress components with gzip<em class="url"> (ycompress)</em></h3>
     <p>Compression reduces response times by reducing the size of the HTTP response.  Gzip is the most popular and effective compression method currently available and generally reduces the response size by about 70%.  Approximately 90% of today&#x27;s Internet traffic travels through browsers that claim to support gzip.<em>Weight: 8</em></p>
     <h3 id="Put CSS at top">Put CSS at top<em class="url"> (ycsstop)</em></h3>
     <p>Moving style sheets to the document HEAD element helps pages appear to load quicker since this allows pages to render progressively.<em>Weight: 4</em></p>
     <h3 id="Put JavaScript at bottom">Put JavaScript at bottom<em class="url"> (yjsbottom)</em></h3>
     <p>JavaScript scripts block parallel downloads; that is, when a script is downloading, the browser will not start any other downloads.  To help the page load faster, move scripts to the bottom of the page if they are deferrable.<em>Weight: 4</em></p>
     <h3 id="Avoid CSS expressions">Avoid CSS expressions<em class="url"> (yexpressions)</em></h3>
     <p>CSS expressions (supported in IE beginning with Version 5) are a powerful, and dangerous, way to dynamically set CSS properties.  These expressions are evaluated frequently:  when the page is rendered and resized, when the page is scrolled, and even when the user moves the mouse over the page.  These frequent evaluations degrade the user experience.<em>Weight: 3</em></p>
     <h3 id="Reduce DNS lookups">Reduce DNS lookups<em class="url"> (ydns)</em></h3>
     <p>The Domain Name System (DNS) maps hostnames to IP addresses, just like phonebooks map people&#x27;s names to their phone numbers.  When you type URL www.yahoo.com into the browser, the browser contacts a DNS resolver that returns the server&#x27;s IP address.  DNS has a cost; typically it takes 20 to 120 milliseconds for it to look up the IP address for a hostname.  The browser cannot download anything from the host until the lookup completes.<em>Weight: 3</em></p>
     <h3 id="Minify JavaScript and CSS">Minify JavaScript and CSS<em class="url"> (yminify)</em></h3>
     <p>Minification removes unnecessary characters from a file to reduce its size, thereby improving load times.  When a file is minified, comments and unneeded white space characters (space, newline, and tab) are removed.  This improves response time since the size of the download files is reduced.<em>Weight: 4</em></p>
     <h3 id="Never do redirects">Never do redirects<em class="url"> (redirects)</em></h3>
     <p>Redirects is bad for performance, specially for mobile.<em>Weight: 4</em></p>
     <h3 id="Remove duplicate JavaScript and CSS">Remove duplicate JavaScript and CSS<em class="url"> (noduplicates)</em></h3>
     <p>Duplicate JavaScript and CSS files hurt performance by creating unnecessary HTTP requests (IE only) and wasted JavaScript execution (IE and Firefox).  In IE, if an external script is included twice and is not cacheable, it generates two HTTP requests during page loading.  Even if the script is cacheable, extra HTTP requests occur when the user reloads the page.  In both IE and Firefox, duplicate JavaScript scripts cause wasted time evaluating the same scripts more than once.  This redundant script execution happens regardless of whether the script is cacheable.<em>Weight: 4</em></p>
     <h3 id="Configure entity tags (ETags)">Configure entity tags (ETags)<em class="url"> (yetags)</em></h3>
     <p>Entity tags (ETags) are a mechanism web servers and the browser use to determine whether a component in the browser&#x27;s cache matches one on the origin server.  Since ETags are typically constructed using attributes that make them unique to a specific server hosting a site, the tags will not match when a browser gets the original component from one server and later tries to validate that component on a different server.<em>Weight: 2</em></p>
     <h3 id="Make AJAX cacheable">Make AJAX cacheable<em class="url"> (yxhr)</em></h3>
     <p>One of AJAX&#x27;s benefits is it provides instantaneous feedback to the user because it requests information asynchronously from the backend web server.  However, using AJAX does not guarantee the user will not wait for the asynchronous JavaScript and XML responses to return.  Optimizing AJAX responses is important to improve performance, and making the responses cacheable is the best way to optimize them.<em>Weight: 4</em></p>
     <h3 id="Use GET for AJAX requests">Use GET for AJAX requests<em class="url"> (yxhrmethod)</em></h3>
     <p>When using the XMLHttpRequest object, the browser implements POST in two steps:  (1) send the headers, and (2) send the data.  It is better to use GET instead of POST since GET sends the headers and the data together (unless there are many cookies).  IE&#x27;s maximum URL length is 2 KB, so if you are sending more than this amount of data you may not be able to use GET.<em>Weight: 3</em></p>
     <h3 id="Reduce the number of DOM elements">Reduce the number of DOM elements<em class="url"> (mindom)</em></h3>
     <p>A complex page means more bytes to download, and it also means slower DOM access in JavaScript.  Reduce the number of DOM elements on the page to improve performance.<em>Weight: 3</em></p>
     <h3 id="Avoid HTTP 404 (Not Found) error">Avoid HTTP 404 (Not Found) error<em class="url"> (yno404)</em></h3>
     <p>Making an HTTP request and receiving a 404 (Not Found) error is expensive and degrades the user experience.  Some sites have helpful 404 messages (for example, &quot;Did you mean ...?&quot;), which may assist the user, but server resources are still wasted.<em>Weight: 4</em></p>
     <h3 id="Reduce cookie size">Reduce cookie size<em class="url"> (ymincookie)</em></h3>
     <p>HTTP cookies are used for authentication, personalization, and other purposes.  Cookie information is exchanged in the HTTP headers between web servers and the browser, so keeping the cookie size small minimizes the impact on response time.<em>Weight: 3</em></p>
     <h3 id="Use cookie-free domains">Use cookie-free domains<em class="url"> (ycookiefree)</em></h3>
     <p>When the browser requests a static image and sends cookies with the request, the server ignores the cookies.  These cookies are unnecessary network traffic.  To workaround this problem, make sure that static components are requested with cookie-free requests by creating a subdomain and hosting them there.<em>Weight: 3</em></p>
     <h3 id="Avoid AlphaImageLoader filter">Avoid AlphaImageLoader filter<em class="url"> (ynofilter)</em></h3>
     <p>The IE-proprietary AlphaImageLoader filter attempts to fix a problem with semi-transparent true color PNG files in IE versions less than Version 7.  However, this filter blocks rendering and freezes the browser while the image is being downloaded.  Additionally, it increases memory consumption.  The problem is further multiplied because it is applied per element, not per image.<em>Weight: 4</em></p>
     <h3 id="Never scale images in HTML">Never scale images in HTML<em class="url"> (avoidscalingimages)</em></h3>
     <p>Images should always be sent with the correct size else the browser will download an image that is larger than necessary. This is more important today with responsive web design, meaning you want to avoid downloading non scaled images to a mobile phone or tablet. Note: This rule doesn	 check images with size 0 (images in carousels etc), so they will be missed by the rule.The rule also skip images where the difference between the sizes are less than a configurable value (default 100 pixels).<em>Weight: 5</em></p>
     <h3 id="Make favicon small and cacheable">Make favicon small and cacheable<em class="url"> (yfavicon)</em></h3>
     <p>A favicon is an icon associated with a web page; this icon resides in the favicon.ico file in the server&#x27;s root.  Since the browser requests this file, it needs to be present; if it is missing, the browser returns a 404 error (see &quot;Avoid HTTP 404 (Not Found) error&quot; above).  Since favicon.ico resides in the server&#x27;s root, each time the browser requests this file, the cookies for the server&#x27;s root are sent.  Making the favicon small and reducing the cookie size for the server&#x27;s root cookies improves performance for retrieving the favicon.  Making favicon.ico cacheable avoids frequent requests for it.<em>Weight: 2</em></p>
     <h3 id="Load third party javascript asynchronously">Load third party javascript asynchronously<em class="url"> (thirdpartyasyncjs)</em></h3>
     <p>Always load third party javascript asynchronously. Third parties that will be checked are twitter, facebook, google (api, analythics, ajax), linkedin, disqus, pinterest &amp; jquery.<em>Weight: 10</em></p>
     <h3 id="Avoid loading specific css for print">Avoid loading specific css for print<em class="url"> (cssprint)</em></h3>
     <p>Loading a specific stylesheet for print, can block rendering in your browser (depending on browser version) and will for almost all browsers, block the onload event to fire (even though the print stylesheet is not even used!).<em>Weight: 3</em></p>
     <h3 id="Load CSS in head from document domain">Load CSS in head from document domain<em class="url"> (cssinheaddomain)</em></h3>
     <p>CSS files inside of HEAD should be loaded from the same domain as the main document, in order to avoid DNS lookups, because you want to have the HEAD part of the page finished as fast as possible, for the browser to be abe to start render the page. This is extra important for mobile.<em>Weight: 8</em></p>
     <h3 id="Never load JS synchronously in head">Never load JS synchronously in head<em class="url"> (syncjsinhead)</em></h3>
     <p>Javascript files should never be loaded synchronously in HEAD, because it will block the rendering of the page.<em>Weight: 20</em></p>
     <h3 id="Avoid use of web fonts">Avoid use of web fonts<em class="url"> (avoidfont)</em></h3>
     <p>Avoid use of webfonts because they will decrease the performance of the page.<em>Weight: 1</em></p>
     <h3 id="Reduce number of total requests">Reduce number of total requests<em class="url"> (totalrequests)</em></h3>
     <p>Avoid to have too many requests on your page. The more requests, the slower the page will be for the end user.<em>Weight: 10</em></p>
     <h3 id="Have expire headers for static components">Have expire headers for static components<em class="url"> (expiresmod)</em></h3>
     <p>By adding HTTP expires headers to your static files, the files will be cached in the end users browser.<em>Weight: 10</em></p>
     <h3 id="Have expires headers equals or longer than one year">Have expires headers equals or longer than one year<em class="url"> (longexpirehead)</em></h3>
     <p>Having really long cache headers are beneficial for caching.<em>Weight: 5</em></p>
     <h3 id="Avoid DNS lookups when a page has few requests">Avoid DNS lookups when a page has few requests<em class="url"> (nodnslookupswhenfewrequests)</em></h3>
     <p>If you have few requests on a page, they should all be on the same domain to avoid DNS lookups, because the lookups will cost much.<em>Weight: 8</em></p>
     <h3 id="Do not load css files when the page has few request">Do not load css files when the page has few request<em class="url"> (inlinecsswhenfewrequest)</em></h3>
     <p>When a page has few requests (or actually maybe always if you dont have a massive amount of css), it is better to inline the css, to make the page to start render as early as possible.<em>Weight: 7</em></p>
     <h3 id="Have a reasonable percentage of textual content compared to the rest of the page">Have a reasonable percentage of textual content compared to the rest of the page<em class="url"> (textcontent)</em></h3>
     <p>Make sure the amount of HTML elements are too many compared to text content.<em>Weight: 1</em></p>
     <h3 id="Always use latest versions of third party javascripts">Always use latest versions of third party javascripts<em class="url"> (thirdpartyversions)</em></h3>
     <p>Always use the latest &amp; greatest versions of third party javascripts, this is really important for JQuery, since the latest versions is always faster &amp; better.<em>Weight: 5</em></p>
     <h3 id="Use a Content Delivery Network (CDN)">Use a Content Delivery Network (CDN)<em class="url"> (ycdn)</em></h3>
     <p>User proximity to web servers impacts response times.  Deploying content across multiple geographically dispersed servers helps users perceive that pages are loading faster.<em>Weight: 6</em></p>
     <h3 id="Do not close the connection">Do not close the connection<em class="url"> (connectionclose)</em></h3>
     <p>Check if the site closes a connection to a domain, where we have multiple requests. Use Keep-Alive headers and never close a connection<em>Weight: 7</em></p>
     <h3 id="Do not use private headers on static assets">Do not use private headers on static assets<em class="url"> (privateheaders)</em></h3>
     <p>Make all static assets cacheable for everyone and don&#x27;t set private cache headers. Will check for private headers for css, images, cssimages, fonts, flash &amp; favicon.<em>Weight: 3</em></p>
