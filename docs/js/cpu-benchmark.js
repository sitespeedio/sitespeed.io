function runCPUBenchmark() {
    const amount = 100000000;
    const startTime = performance.now();
    for ( let i = amount; i > 0; i-- ) {
        // empty
    }
    const time =  Math.round( performance.now() - startTime );
    const cpuDiv = document.getElementById('cpu');
    cpuDiv.innerHTML = '<h1> CPU Benchmark: ' + time + '</h1>';

    // navigator.cpuPerformance is the browser's own device rating from the
    // CPU Performance API (https://wicg.github.io/cpu-performance/): a coarse
    // tier from 1 to 4, or 0 when the browser cannot classify the device.
    // Chrome exposes it from version 152; other browsers do not have it yet.
    if ( 'cpuPerformance' in navigator ) {
        const tier = navigator.cpuPerformance;
        const label = tier === 0 ? 'unknown' : tier + ' of 4';
        cpuDiv.innerHTML += '<h1> CPU performance tier: ' + label + '</h1>' +
            '<p>Reported by your browser via the <a href="https://wicg.github.io/cpu-performance/">CPU Performance API</a>, not measured on this page.</p>';
    } else {
        cpuDiv.innerHTML += '<p>Your browser does not expose the <a href="https://wicg.github.io/cpu-performance/">CPU Performance API</a> yet (Chrome 152 and later).</p>';
    }
}

document.addEventListener('DOMContentLoaded', function() {
  runCPUBenchmark();
}, false);
