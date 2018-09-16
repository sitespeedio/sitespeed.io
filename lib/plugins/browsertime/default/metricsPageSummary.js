'use strict';

module.exports = [
  'statistics.timings.pageTimings',
  'statistics.timings.rumSpeedIndex',
  'statistics.timings.fullyLoaded',
  'statistics.timings.firstPaint',
  'statistics.timings.userTimings',
  'statistics.visualMetrics.SpeedIndex',
  'statistics.visualMetrics.FirstVisualChange',
  'statistics.visualMetrics.VisualComplete85',
  'statistics.visualMetrics.VisualComplete95',
  'statistics.visualMetrics.VisualComplete99',
  'statistics.visualMetrics.LastVisualChange',
  'statistics.visualMetrics.PerceptualSpeedIndex',
  'statistics.visualMetrics.VisualReadiness',
  'statistics.visualMetrics.LargestImage',
  'statistics.visualMetrics.Heading',
  'statistics.visualMetrics.Logo', // Isn't used by default but it is really convinient
  'statistics.custom.*',
  'statistics.console.error',
  'statistics.cpu.categories.*',
  'statistics.cpu.events.*'
];
