import get from 'lodash.get';
import { getConnectivity } from '../../support/tsdbUtil.js';

function getDeviceType(options) {
  if (options.safari?.ios || options.browsertime?.safari?.ios) return 'ios';
  if (options.android?.enabled || options.browsertime?.android?.enabled)
    return 'android';
  if (options.mobile) return 'mobile';
  return 'desktop';
}

/**
 * Extract a statistics object (median/p90/p99) from a data path.
 * Returns undefined if the path doesn't exist or has no numeric stats.
 */
function stat(data, path) {
  const s = get(data, path);
  if (!s || typeof s !== 'object') return;
  const result = {};
  if (typeof s.median === 'number') result.median = s.median;
  if (typeof s.p90 === 'number') result.p90 = s.p90;
  if (typeof s.rsd === 'number') result.rsd = s.rsd;
  return Object.keys(result).length > 0 ? result : undefined;
}

/**
 * Strip undefined/null/empty-object entries so we don't send empty
 * nested objects to OpenSearch (which would still create mapping entries).
 */
function compact(obj) {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => {
      if (v === undefined || v === null) return false;
      if (
        typeof v === 'object' &&
        !Array.isArray(v) &&
        Object.keys(v).length === 0
      )
        return false;
      return true;
    })
  );
}

function baseDoc(message, options, alias, resultUrls) {
  const doc = {
    '@timestamp': new Date(message.runTime ?? Date.now()).toISOString(),
    url: message.url,
    group: message.group,
    alias: alias?.[message.url],
    browser: options.browser,
    connectivity: getConnectivity(options),
    slug: options.slug,
    deviceType: getDeviceType(options),
    iterations: options.browsertime?.iterations,
    name: options.name
  };
  if (resultUrls?.hasBaseUrl()) {
    doc.resultUrl =
      resultUrls.absoluteSummaryPagePath(message.url, alias?.[message.url]) +
      'index.html';
  }
  return doc;
}

export class OpenSearchDataGenerator {
  constructor(options) {
    this.options = options;
  }

  documentFromMessage(message, alias, resultUrls) {
    switch (message.type) {
      case 'browsertime.pageSummary': {
        return this.fromPageSummary(message, alias, resultUrls);
      }
      case 'browsertime.run': {
        return this.fromRun(message, alias, resultUrls);
      }
      case 'compare.pageSummary': {
        return this.fromCompare(message, alias, resultUrls);
      }
      case 'pagexray.pageSummary': {
        return this.fromPageXray(message, alias, resultUrls);
      }
      case 'coach.pageSummary': {
        return this.fromCoach(message, alias, resultUrls);
      }
      default: {
        return;
      }
    }
  }

  fromPageSummary(message, alias, resultUrls) {
    const d = message.data;

    return compact({
      ...baseDoc(message, this.options, alias, resultUrls),
      type: 'pageSummary',
      timings: compact({
        firstPaint: stat(d, 'statistics.timings.firstPaint'),
        fcp: stat(d, 'statistics.timings.timeToContentfulPaint'),
        lcp: stat(d, 'statistics.timings.largestContentfulPaint.renderTime'),
        ttfb: stat(d, 'statistics.timings.ttfb'),
        fullyLoaded: stat(d, 'statistics.timings.fullyLoaded'),
        loadEventEnd: stat(d, 'statistics.timings.loadEventEnd'),
        timeToInteractive: stat(d, 'statistics.timings.timeToFirstInteractive')
      }),
      visualMetrics: compact({
        speedIndex: stat(d, 'statistics.visualMetrics.SpeedIndex'),
        perceptualSpeedIndex: stat(
          d,
          'statistics.visualMetrics.PerceptualSpeedIndex'
        ),
        firstVisualChange: stat(
          d,
          'statistics.visualMetrics.FirstVisualChange'
        ),
        lastVisualChange: stat(d, 'statistics.visualMetrics.LastVisualChange'),
        visualComplete85: stat(d, 'statistics.visualMetrics.VisualComplete85'),
        visualComplete95: stat(d, 'statistics.visualMetrics.VisualComplete95'),
        visualComplete99: stat(d, 'statistics.visualMetrics.VisualComplete99')
      }),
      googleWebVitals: compact({
        lcp: stat(d, 'statistics.googleWebVitals.largestContentfulPaint'),
        cls: stat(d, 'statistics.googleWebVitals.cumulativeLayoutShift'),
        inp: stat(d, 'statistics.googleWebVitals.interactionToNextPaint'),
        fid: stat(d, 'statistics.googleWebVitals.firstInputDelay')
      }),
      cpu: compact({
        longTasksTotalDuration: stat(
          d,
          'statistics.cpu.longTasks.totalDuration'
        ),
        longTasksCount: stat(d, 'statistics.cpu.longTasks.count')
      }),
      pageInfo: compact({
        cumulativeLayoutShift: stat(
          d,
          'statistics.pageinfo.cumulativeLayoutShift'
        ),
        domElements: stat(d, 'statistics.pageinfo.domElements')
      })
    });
  }

  fromCompare(message, alias, resultUrls) {
    const d = message.data;

    // Extract a single metric's compare result into a flat, safe shape.
    // We store isSignificant as a boolean (the raw value is cliffsDelta or 0).
    function cm(group, metricName) {
      const m = get(d, `metrics.${group}.${metricName}`);
      if (!m) return;
      return compact({
        isSignificant: m.isSignificant !== 0,
        cliffsDelta:
          typeof m.cliffsDelta === 'number' ? m.cliffsDelta : undefined,
        pValue:
          typeof m.statisticalTestU === 'number'
            ? m.statisticalTestU
            : undefined,
        currentMedian:
          typeof m.current?.median === 'number' ? m.current.median : undefined,
        baselineMedian:
          typeof m.baseline?.median === 'number' ? m.baseline.median : undefined
      });
    }

    // Collect the dotted paths of any metric that is statistically significant.
    const TRACKED = {
      timings: ['ttfb', 'firstContentfulPaint', 'fullyLoaded', 'loadEventEnd'],
      visualMetrics: [
        'SpeedIndex',
        'PerceptualSpeedIndex',
        'FirstVisualChange',
        'LastVisualChange',
        'ContentfulSpeedIndex'
      ],
      googleWebVitals: [
        'largestContentfulPaint',
        'cumulativeLayoutShift',
        'interactionToNextPaint',
        'firstInputDelay'
      ],
      cpu: [
        'totalDuration',
        'tasks',
        'lastLongTask',
        'beforeFirstContentfulPaint',
        'beforeLargestContentfulPaint'
      ],
      renderBlocking: [
        'beforeFCPms',
        'beforeLCPms',
        'beforeFCPelements',
        'beforeLCPelements'
      ]
    };

    const significantMetrics = [];
    for (const [group, names] of Object.entries(TRACKED)) {
      for (const name of names) {
        const m = get(d, `metrics.${group}.${name}`);
        if (m && m.isSignificant !== 0) {
          significantMetrics.push(`${group}.${name}`);
        }
      }
    }

    return compact({
      ...baseDoc(message, this.options, alias, resultUrls),
      type: 'compare',
      iterations: get(d, 'meta.iterations'),
      baselineTimestamp: get(d, 'meta.baseline.timestamp'),
      anySignificant: significantMetrics.length > 0,
      significantMetrics:
        significantMetrics.length > 0 ? significantMetrics : undefined,
      timings: compact({
        ttfb: cm('timings', 'ttfb'),
        fcp: cm('timings', 'firstContentfulPaint'),
        fullyLoaded: cm('timings', 'fullyLoaded'),
        loadEventEnd: cm('timings', 'loadEventEnd')
      }),
      visualMetrics: compact({
        speedIndex: cm('visualMetrics', 'SpeedIndex'),
        perceptualSpeedIndex: cm('visualMetrics', 'PerceptualSpeedIndex'),
        firstVisualChange: cm('visualMetrics', 'FirstVisualChange'),
        lastVisualChange: cm('visualMetrics', 'LastVisualChange'),
        contentfulSpeedIndex: cm('visualMetrics', 'ContentfulSpeedIndex')
      }),
      googleWebVitals: compact({
        lcp: cm('googleWebVitals', 'largestContentfulPaint'),
        cls: cm('googleWebVitals', 'cumulativeLayoutShift'),
        inp: cm('googleWebVitals', 'interactionToNextPaint'),
        fid: cm('googleWebVitals', 'firstInputDelay')
      }),
      cpu: compact({
        totalDuration: cm('cpu', 'totalDuration'),
        tasks: cm('cpu', 'tasks'),
        lastLongTask: cm('cpu', 'lastLongTask'),
        beforeFCP: cm('cpu', 'beforeFirstContentfulPaint'),
        beforeLCP: cm('cpu', 'beforeLargestContentfulPaint')
      }),
      renderBlocking: compact({
        beforeFCPms: cm('renderBlocking', 'beforeFCPms'),
        beforeLCPms: cm('renderBlocking', 'beforeLCPms'),
        beforeFCPelements: cm('renderBlocking', 'beforeFCPelements'),
        beforeLCPelements: cm('renderBlocking', 'beforeLCPelements')
      })
    });
  }

  fromCoach(message, alias, resultUrls) {
    const d = message.data;

    return compact({
      ...baseDoc(message, this.options, alias, resultUrls),
      type: 'coach',
      score: stat(d, 'advice.score'),
      performance: stat(d, 'advice.performance.score'),
      privacy: stat(d, 'advice.privacy.score'),
      bestpractice: stat(d, 'advice.bestpractice.score'),
      info: compact({
        documentHeight: stat(d, 'advice.info.documentHeight'),
        domElements: stat(d, 'advice.info.domElements'),
        domDepth: stat(d, 'advice.info.domDepth'),
        iframes: stat(d, 'advice.info.iframes'),
        scripts: stat(d, 'advice.info.scripts'),
        localStorageSize: stat(d, 'advice.info.localStorageSize')
      })
    });
  }

  fromPageXray(message, alias, resultUrls) {
    const d = message.data;

    function ct(type) {
      return compact({
        transferSize: stat(d, `contentTypes.${type}.transferSize`),
        contentSize: stat(d, `contentTypes.${type}.contentSize`),
        requests: stat(d, `contentTypes.${type}.requests`)
      });
    }

    return compact({
      ...baseDoc(message, this.options, alias, resultUrls),
      type: 'pagexray',
      transferSize: stat(d, 'transferSize'),
      contentSize: stat(d, 'contentSize'),
      requests: stat(d, 'requests'),
      totalDomains: get(d, 'totalDomains'),
      cookies: stat(d, 'cookies'),
      firstParty: compact({
        transferSize: stat(d, 'firstParty.transferSize'),
        contentSize: stat(d, 'firstParty.contentSize'),
        requests: stat(d, 'firstParty.requests')
      }),
      thirdParty: compact({
        transferSize: stat(d, 'thirdParty.transferSize'),
        contentSize: stat(d, 'thirdParty.contentSize'),
        requests: stat(d, 'thirdParty.requests')
      }),
      contentTypes: compact({
        javascript: ct('javascript'),
        css: ct('css'),
        image: ct('image'),
        html: ct('html'),
        font: ct('font'),
        other: ct('other')
      })
    });
  }

  fromRun(message, alias, resultUrls) {
    const d = message.data;

    return compact({
      ...baseDoc(message, this.options, alias, resultUrls),
      type: 'run',
      iteration: message.iteration,
      timings: compact({
        firstPaint: get(d, 'timings.firstPaint'),
        fcp: get(d, 'timings.timeToContentfulPaint'),
        lcp: get(d, 'timings.largestContentfulPaint.renderTime'),
        ttfb: get(d, 'timings.ttfb'),
        fullyLoaded: get(d, 'timings.fullyLoaded'),
        loadEventEnd: get(d, 'timings.loadEventEnd')
      }),
      visualMetrics: compact({
        speedIndex: get(d, 'visualMetrics.SpeedIndex'),
        perceptualSpeedIndex: get(d, 'visualMetrics.PerceptualSpeedIndex'),
        firstVisualChange: get(d, 'visualMetrics.FirstVisualChange'),
        lastVisualChange: get(d, 'visualMetrics.LastVisualChange'),
        visualComplete85: get(d, 'visualMetrics.VisualComplete85'),
        visualComplete95: get(d, 'visualMetrics.VisualComplete95'),
        visualComplete99: get(d, 'visualMetrics.VisualComplete99')
      }),
      googleWebVitals: compact({
        lcp: get(d, 'googleWebVitals.largestContentfulPaint'),
        cls: get(d, 'googleWebVitals.cumulativeLayoutShift'),
        inp: get(d, 'googleWebVitals.interactionToNextPaint'),
        fid: get(d, 'googleWebVitals.firstInputDelay')
      }),
      cpu: compact({
        longTasksTotalDuration: get(d, 'cpu.longTasks.totalDuration'),
        longTasksCount: get(d, 'cpu.longTasks.count')
      }),
      pageInfo: compact({
        cumulativeLayoutShift: get(d, 'pageinfo.cumulativeLayoutShift'),
        domElements: get(d, 'pageinfo.domElements')
      })
    });
  }
}
