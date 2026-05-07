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
