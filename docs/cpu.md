---
layout: notfound
title: CPU Benchmark - sitespeed.io
permalink: /cpu.html
eleventyExcludeFromCollections: true
---
<div class="data"> <div id="cpu"></div>
<a href="https://www.sitespeed.io/"><img src="{{site.baseurl}}/img/powerpuffsitespeed.io.png" class="cent"></a></div>


{% js "cpu" %}{% include js/cpu-benchmark.js %}{% endjs %}
<script src="{% getBundleFileUrl "js", "cpu" %}" defer></script>