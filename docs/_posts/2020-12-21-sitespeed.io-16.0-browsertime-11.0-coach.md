---
layout: default
title: sitespeed.io 16.0, Browsertime 11.0 and the Coach 6.0 
description: New updates to sitespeed.io, Coach and Browsertime.
authorimage: /img/aboutus/peter.jpg
intro: New updates to sitespeed.io, Coach and Browsertime.
keywords: sitespeed.io, browsertime, webperf
image: https://www.sitespeed.io/img/santa.png
nav: blog
---

# sitespeed.io 16.0, Browsertime 11.0 and the Coach 6.0  

<img src="{{site.baseurl}}/img/santa.png" class="pull-right img-big" alt="sitespeed.io wish you a Merry Christmas!" width="200" height="236">

Santa Claus has something special for you this Christmas: Today we released a new major release of sitespeed.io!

- [The Coach is back in town!](#the-coach-is-back-in-town)
- [New Browsertime](#new-browsertime)
- [New sitespeed.io](#new-sitespeedio)
    - [WebPageTest plugin got a new repository](#webpagetest-plugin-got-a-new-repository)
    - [Other changes](#other-changes)
    - [New plugin maintainers welcome](#new-plugin-maintainers-welcome)
- [Support sitespeed.io](#support-sitespeedio)
- [And more in the latest releases](#and-more-in-the-latest-releases)

## The Coach is back in town!
We first released the Coach early 2016 and many things has changed on the web since then, it is time to give the Coach some extra love. Here it is: the [Coach 6.0](https://github.com/sitespeedio/coach-core/blob/main/CHANGELOG.md#600---2020-12-18). 

We tuned the performance advice to include advice about CPU Long Tasks, removed advice about using HTTP Push and added a advice about Cumulative Layout Shift. 

We also added [Wappalyzer-core](https://www.npmjs.com/package/wappalyzer-core) to analyse what software that is used to build the page. Together with a new updated version of [Third Party Web](https://github.com/patrickhulce/third-party-web) the Coach gives the big picture of what is used on the page. Go to the Coach result page and check the new _Technologies used to build the page_ section. To give Wappalyzer more information you can collect the HTML of the page using `--browsertime.firefox.includeResponseBodies html` or `--browsertime.chrome.includeResponseBodies html`.

![Technologies used to build the page]({{site.baseurl}}/img/technologies.png)
{: .img-thumbnail}
<p class="image-info">
 <em class="small center">The Coach uses Wappalyzer and Third Party Web to analyse technologies used.</em>
</p>

We increased the number of privacy advice. We incorporated third party web to identify third parties, we fixed a bug in how we count cookies and we started to categorize cookies as first vs third party cookies. It's now easy to check if your site is violating GDPR. We also added a check if _fingerprint.js_ is used to fingerprint the user.

![New privacy advice]({{site.baseurl}}/img/interest-in-the-new-coach.jpg)
{: .img-thumbnail-center}
<p class="image-info">
 <em class="small center">Not everyone likes the new privacy advice in the Coach that makes it harder for companies/governments to track your users.</em>
</p>


We also removed the accessibility category from the Coach. Yep we had to. We couldn't keep up with the advice and its better to use AXE-core, that helps you more than the Coach when it comes to accessibility. If you are a sitespeed.io user, use `--axe.enable` to run Axe.


We also made it easier to understand the Coach advice when you use sitespeed.io. Use the show/hide details button to see the description about the advice. 

![Click to show details ]({{site.baseurl}}/img/click-show-details.png)
{: .img-thumbnail}

Here you can see the third party domains and why you should not use third party cookies. 

![Coeach description ]({{site.baseurl}}/img/coach-description.png)
{: .img-thumbnail}
<p class="image-info">
 <em class="small center">With the new Coach you can click on show/hide to see the full description of the advice to understand why!</em>
</p>

Showing the description for each advice helps developers like this old gentleman to understand the advice from the Coach.

![Old people also like the Coach!]({{site.baseurl}}/img/old-people-also-like-sitespeed.jpg)
{: .img-thumbnail-center}

We also been going through all advice to make sure they are still relevant. The Coach is more vital than ever :)

## New Browsertime

A couple of days ago we released a new Browsertime. One relevant fix that you will notice is that we include the full browser window in the video for desktop (as we always done on mobile). It will not affect the metrics, only the video.

![Full browser Window]({{site.baseurl}}/img/video-full-browser.jpg)
{: .img-thumbnail-center}

We also updated our EdgeDriver library to download EdgeDriver if it exists (now in Linux) and included Edge in the Docker container. We added _Microsoft Edge 89.0.731.0 dev_ since the corresponding EdgeDriver for 88 is [ten times bigger in size](https://github.com/sitespeedio/browsertime/pull/1436#issuecomment-746972161) and we do want to keep the container as small as possible. Make sure to match the EdgeDriver with your Edge version if you run using NodeJS!

![Microsoft Edge 89.0.731.0 ]({{site.baseurl}}/img/edge-now-on-linux.jpg)
{: .img-thumbnail-center}
<p class="image-info">
 <em class="small center">Microsoft Edge 89.0.731.0 dev is included in the Docker container for people that care about Microsoft :)</em>
</p>

We have some bug fixes too, especially if you test on Android. You can check the [changelog](https://github.com/sitespeedio/browsertime/blob/main/CHANGELOG.md) to see all changes.

## New sitespeed.io

First off, we have a breaking change if you use the WebPageTest plugin. We moved that to a new repository.

### WebPageTest plugin got a new repository
We moved out the WebPageTest plugin to [a new repository](https://github.com/sitespeedio/plugin-webpagetest). It will still work as before, but you need install the plugin or run the WebPageTest container (```docker run --rm -v "$(pwd)":/sitespeed.io sitespeedio/sitespeed.io:16.0.0-webpagetest https://www.sitespeed.io --plugins.add /webpagetest --webpagetest.key KEY```):

There's a couple of reasons:
1. It's easier to focus on the core functionality with Browsertime. Some people [still](https://twitter.com/drewpost/status/1306206907313598469) think sitespeed.io is built on top of WebPageTest. That is not true. It's built on top of Browsertime, our own engine ([used by Mozilla](https://blog.mozilla.org/performance/2020/12/15/2020-year-in-review/) to test performance regressions). But you can use WebPageTest as complement directly from sitespeed.io as you can with Lighthouse and other tools.
2. [The WebPageTest API library](https://github.com/marcelduran/webpagetest-api) is the 3rd party library that we use that [historically has taken the longest time](https://github.com/marcelduran/webpagetest-api/issues/123) to fix security issues.
3. A [new repository](https://github.com/sitespeedio/plugin-webpagetest) makes it much easier for people at Catchpoint to contribute back to the WebPageTest plugin!
4. I'm [not interested in pushing users to become customers at Catchpoint](https://phabricator.wikimedia.org/T162515). WebPageTest is a good tool but I'm not sure Catchpoint is the company to make it better. Maybe they will prove me wrong :)

### Other changes
There's many many small changes in the new release, checkout the [changelog](https://github.com/sitespeedio/sitespeed.io/blob/main/CHANGELOG.md) for all changes. You can look at a [example run](https://examples.sitespeed.io/16.x/2020-12-21-10-46-45/index.html) or just try out the latest versions. If you use Docker:

~~~bash
docker run --rm -v "$(pwd):/sitespeed.io" sitespeedio/sitespeed.io:{% include version/sitespeed.io.txt  %} https://www.sitespeed.io/
~~~

Or if you use npm, install sitespeed.io globally:

~~~bash
npm install -g sitespeed.io
~~~

Make sure you have the browser you want to use for testing installed (Firefox/Chrome/Edge/Safari) and then run:

~~~bash
sitespeed.io https://www.sitespeed.io/ -b chrome
~~~

### New plugin maintainers welcome
We are looking for new maintainers of the [Lighthouse](https://github.com/sitespeedio/plugin-lighthouse) and [WebPageTest](https://github.com/sitespeedio/plugin-webpagetest) plugin. If you are interested, create an issue in the respectively repository.

## Support sitespeed.io

We are still looking for supporters to support our server setup that makes our tests run. You can help us by [supporting us at Open Collective](https://opencollective.com/sitespeedio)!

## And more in the latest releases
We also done a couple of bug fixes. Checkout the [Browsertime changelog](https://github.com/sitespeedio/browsertime/blob/main/CHANGELOG.md), the [sitespeed.io changelog](https://github.com/sitespeedio/sitespeed.io/blob/main/CHANGELOG.md) and the [Coach changelog](https://github.com/sitespeedio/coach/blob/main/CHANGELOG.md) for the full list. 

/Peter