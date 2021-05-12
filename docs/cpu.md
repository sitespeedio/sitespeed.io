---
layout: notfound
title: CPU Benchmark - sitespeed.io
permalink: /cpu.html
---
<div class="data"> <div id="cpu"></div>
<a href="https://www.sitespeed.io/"><img src="{{site.baseurl}}/img/powerpuffsitespeed.io.png" class="cent"></a></div>


<script>
    function runCPUBenchmark() {
        const amount = 100000000;
        const startTime = performance.now();
        for ( let i = amount; i > 0; i-- ) {
            // empty
        }
        const time =  Math.round( performance.now() - startTime );
        const cpuDiv = document.getElementById('cpu');
        cpuDiv.innerHTML = '<h1> CPU Benchmark: ' + time + '</h1>';
    }

    document.addEventListener('DOMContentLoaded', function() {
    runCPUBenchmark();
}, false);
</script>