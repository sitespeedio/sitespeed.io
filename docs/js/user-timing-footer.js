if (window.performance && window.performance.mark) {
  window.performance.mark('userTimingFooter');
  window.performance.measure('exampleMeasurement', 'userTimingHeader', 'userTimingFooter');
}
