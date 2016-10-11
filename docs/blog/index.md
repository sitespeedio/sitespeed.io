---
layout: default
title: The sitespeed.io blog
description: The team behind sitespeed.io
author: Peter Hedenskog
keywords: sitespeed.io, peter hedenskog, tobias lidskog
nav: blog
---

# Blog

{% for post in site.posts %}
  <img src="{{site.baseurl}}{{ post.authorimage }}" class="photo pull-left" width="100" height="100">

## [{{ post.title }}]({{site.baseurl}}{{ post.url }})

**{{ post.date | date: '%Y' }}-{{ post.date | date: '%m' }}-{{ post.date | date: '%d' }}** -
  {{ post.intro }}

  [>> Read more]({{site.baseurl}}{{ post.url }})

  * * *

{% endfor %}
