'use strict';

const fs = require('fs');
const { promisify } = require('util');
const readdir = promisify(fs.readdir);
const path = require('path');
const log = require('intel').getLogger('sitespeedio.plugin.html');

function findFrame(videoFrames, time) {
  let frame = videoFrames[0];
  for (let currentFrame of videoFrames) {
    if (time >= currentFrame.time) {
      frame = currentFrame;
    } else {
      break;
    }
  }
  return frame;
}

function getMetricsFromBrowsertime(data) {
  const metrics = [];

  if (data.timings.userTimings && data.timings.userTimings.marks) {
    // Some web sites over loads user timings
    // So use only the first ones
    const maxUserTimings = 10;
    let userTimings = 1;
    for (let mark of data.timings.userTimings.marks) {
      metrics.push({
        metric: mark.name,
        value: mark.startTime.toFixed()
      });
      userTimings++;
      if (userTimings > maxUserTimings) {
        break;
      }
    }
  }

  metrics.push({
    metric: 'fullyLoaded',
    name: 'Fully Loaded',
    value: data.fullyLoaded
  });

  if (data.timings.pageTimings) {
    metrics.push({
      metric: 'domContentLoadedTime',
      name: 'DOM Content Loaded Time',
      value: data.timings.pageTimings.domContentLoadedTime
    });
    metrics.push({
      metric: 'pageLoadTime',
      name: 'Page Load Time',
      value: data.timings.pageTimings.pageLoadTime
    });
  }

  if (data.visualMetrics) {
    metrics.push({
      metric: 'FirstVisualChange',
      name: 'First Visual Change',
      value: data.visualMetrics.FirstVisualChange
    });
    metrics.push({
      metric: 'LastVisualChange',
      name: 'Last Visual Change',
      value: data.visualMetrics.LastVisualChange
    });
    metrics.push({
      metric: 'VisualComplete85',
      name: 'Visual Complete 85%',
      value: data.visualMetrics.VisualComplete85
    });
    metrics.push({
      metric: 'VisualComplete95',
      name: 'Visual Complete 95%',
      value: data.visualMetrics.VisualComplete95
    });
    metrics.push({
      metric: 'VisualComplete99',
      name: 'Visual Complete 99%',
      value: data.visualMetrics.VisualComplete99
    });
    if (data.visualMetrics.LargestImage) {
      metrics.push({
        metric: 'LargestImage',
        name: 'Largest Image',
        value: data.visualMetrics.LargestImage
      });
    }
    if (data.visualMetrics.Logo) {
      metrics.push({
        metric: 'Logo',
        name: 'Logo',
        value: data.visualMetrics.Logo
      });
    }
    if (data.visualMetrics.Heading) {
      metrics.push({
        metric: 'Heading',
        name: 'Heading',
        value: data.visualMetrics.Heading
      });
    }
  }
  return metrics.sort((a, b) => a.value - b.value);
}

function findTimings(timings, start, end) {
  return timings.filter(timing => timing.value > start && timing.value <= end);
}
module.exports = {
  async getFilmstrip(browsertimeData, run, dir, options) {
    if (
      !options.browsertime.video ||
      options.browsertime.videoParams.createFilmstrip === false ||
      options.browsertime.videoParams.debug
    ) {
      return [];
    }
    const toTheFront = [];

    try {
      let metrics = [];
      if (browsertimeData) {
        metrics = getMetricsFromBrowsertime(browsertimeData);
      }
      const files = await readdir(
        path.join(dir, 'data', 'video', 'images', run + '')
      );
      const timings = [];
      for (let file of files) {
        timings.push({ time: file.replace(/\D/g, ''), file });
      }

      const maxTiming = timings.slice(-1)[0].time;

      // We step 100 ms each step ... but if you wanna show all and the last change is late
      // use 200 ms
      const step =
        maxTiming > 10000 && (options.filmstrip && options.filmstrip.showAll)
          ? 200
          : 100;
      let fileName = '';
      for (let i = 0; i <= Number(maxTiming) + step; i = i + step) {
        const entry = findFrame(timings, i);
        const timingMetrics = findTimings(metrics, i - step, i);
        if (
          entry.file !== fileName ||
          timingMetrics.length > 0 ||
          (options.filmstrip && options.filmstrip.showAll)
        ) {
          toTheFront.push({
            time: i / 1000,
            file: entry.file,
            timings: timingMetrics
          });
        }
        fileName = entry.file;
      }
    } catch (e) {
      log.error('Could not read filmstrip dir', e);
    }

    return toTheFront;
  }
};
