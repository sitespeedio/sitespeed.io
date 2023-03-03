import { readdir as _readdir } from 'node:fs';
import { promisify } from 'node:util';
import { join } from 'node:path';
const readdir = promisify(_readdir);
import intel from 'intel';
const log = intel.getLogger('sitespeedio.plugin.browsertime');

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
        value: mark.startTime.toFixed(0)
      });
      userTimings++;
      if (userTimings > maxUserTimings) {
        break;
      }
    }
  }

  if (data.pageinfo && data.pageinfo.longTask) {
    for (let longTask of data.pageinfo.longTask) {
      metrics.push({
        metric: 'longTask',
        name: 'CPU Long Task duration',
        value: longTask.startTime.toFixed(0),
        duration: longTask.duration.toFixed(0)
      });
    }
  }

  metrics.push({
    metric: 'fullyLoaded',
    name: 'Fully Loaded',
    value: data.fullyLoaded
  });

  if (data.timings.pageTimings) {
    metrics.push(
      {
        metric: 'domContentLoadedTime',
        name: 'DOM Content Loaded Time',
        value: data.timings.pageTimings.domContentLoadedTime
      },
      {
        metric: 'pageLoadTime',
        name: 'Page Load Time',
        value: data.timings.pageTimings.pageLoadTime
      }
    );
  }

  if (
    data.timings.paintTiming &&
    data.timings.paintTiming['first-contentful-paint']
  ) {
    metrics.push({
      metric: 'first-contentful-paint',
      name: 'First Contentful Paint',
      value: data.timings.paintTiming['first-contentful-paint']
    });
  }

  if (
    data.timings.largestContentfulPaint &&
    data.timings.largestContentfulPaint.renderTime
  ) {
    let name = 'LCP';
    name +=
      data.timings.largestContentfulPaint.tagName === 'IMG'
        ? ' <a href="' +
          data.timings.largestContentfulPaint.url +
          '">&#60;IMG&#62;</a>'
        : ' &#60;' +
          data.timings.largestContentfulPaint.tagName +
          '&#62;' +
          (data.timings.largestContentfulPaint.id === ''
            ? ''
            : ' ' + data.timings.largestContentfulPaint.id);
    metrics.push({
      metric: 'largestContentfulPaint',
      name,
      value: data.timings.largestContentfulPaint.renderTime
    });
  }

  if (data.visualMetrics) {
    metrics.push(
      {
        metric: 'FirstVisualChange',
        name: 'First Visual Change',
        value: data.visualMetrics.FirstVisualChange
      },
      {
        metric: 'LastVisualChange',
        name: 'Last Visual Change',
        value: data.visualMetrics.LastVisualChange
      },
      {
        metric: 'VisualComplete85',
        name: 'Visual Complete 85%',
        value: data.visualMetrics.VisualComplete85
      },
      {
        metric: 'VisualComplete95',
        name: 'Visual Complete 95%',
        value: data.visualMetrics.VisualComplete95
      },
      {
        metric: 'VisualComplete99',
        name: 'Visual Complete 99%',
        value: data.visualMetrics.VisualComplete99
      }
    );
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

  if (data.pageinfo && data.pageinfo.cumulativeLayoutShiftInfo) {
    for (let shift of data.pageinfo.cumulativeLayoutShiftInfo) {
      metrics.push({
        metric: 'layoutshift',
        name: 'Layout Shift ' + shift.score.toFixed(5),
        value: shift.startTime.toFixed(0)
      });
    }
  }
  return metrics.sort((a, b) => a.value - b.value);
}

function findTimings(timings, start, end) {
  return timings.filter(timing => timing.value > start && timing.value <= end);
}
export async function getFilmstrip(
  browsertimeData,
  run,
  dir,
  options,
  fullPath
) {
  let doWeHaveFilmstrip =
    options.browsertime.visualMetrics === true &&
    options.browsertime.videoParams.createFilmstrip === true;

  if (doWeHaveFilmstrip === false) {
    return [];
  }

  const toTheFront = [];

  try {
    let metrics = [];
    if (browsertimeData) {
      metrics = getMetricsFromBrowsertime(browsertimeData);
    }
    const files = await readdir(join(dir, 'data', 'filmstrip', run + ''));
    const timings = [];
    for (let file of files) {
      timings.push({ time: file.replace(/\D/g, ''), file });
    }

    const maxTiming = timings.slice(-1)[0].time;

    // We step 100 ms each step ... but if you wanna show all and the last change is late
    // use 200 ms
    const step =
      maxTiming > 10_000 && options.filmstrip && options.filmstrip.showAll
        ? 200
        : 100;
    let fileName = '';
    for (
      let index = 0;
      index <= Number(maxTiming) + step;
      index = index + step
    ) {
      const entry = findFrame(timings, index);
      const timingMetrics = findTimings(metrics, index - step, index);
      if (
        entry.file !== fileName ||
        timingMetrics.length > 0 ||
        (options.filmstrip && options.filmstrip.showAll)
      ) {
        toTheFront.push({
          time: index / 1000,
          file: fullPath ? fullPath + entry.file : entry.file,
          timings: timingMetrics
        });
      }
      fileName = entry.file;
    }
  } catch (error) {
    log.info('Could not read filmstrip dir', error);
  }
  return toTheFront;
}
