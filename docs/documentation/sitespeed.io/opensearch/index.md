---
layout: default
title: Store your metrics in OpenSearch.
description: How to configure OpenSearch to store and query sitespeed.io metrics, and how to visualise them with Grafana or OpenSearch Dashboards.
keywords: opensearch, documentation, web performance, sitespeed.io
nav: documentation
category: sitespeed.io
image: https://www.sitespeed.io/img/sitespeed-2.0-twitter.png
twitterdescription: Store your metrics in OpenSearch.
---

[Documentation]({{site.baseurl}}/documentation/sitespeed.io/) / OpenSearch

# OpenSearch
{:.no_toc}

* Let's place the TOC here
{:toc}

## What is OpenSearch
[OpenSearch](https://opensearch.org/) is an open-source search and analytics engine (a fork of Elasticsearch). sitespeed.io can send performance metrics directly to OpenSearch so you can search, filter, and alert on your web performance data without any external libraries — it uses Node.js built-in `fetch`.

Unlike Graphite, which stores fixed time-series keys, OpenSearch stores full JSON documents. This means you can filter by any combination of fields: URL, browser, connectivity, device type, test name, and more.

## Before you start
You need a running OpenSearch instance (version 2 or later). For local development, use the Docker Compose file included in the repository:

~~~shell
docker compose -f docker/opensearch/docker-compose.yml up -d
~~~

This starts OpenSearch on port 9200.

## Setup
Before the first test run, apply the index templates so OpenSearch knows the exact field types. This prevents [mapping explosion](https://opensearch.org/docs/latest/field-types/mapping-parameters/dynamic/) from unexpected fields.

~~~shell
docker/opensearch/setup.sh                      # localhost:9200
docker/opensearch/setup.sh http://my-host:9200
docker/opensearch/setup.sh http://my-host:9200 user:password
~~~

The script creates five index templates (one per data type). The ISM retention policies are created automatically by the plugin on its first run.

## Send metrics to OpenSearch
Add `--opensearch.host` to any sitespeed.io run:

~~~shell
sitespeed.io https://www.example.com --opensearch.host localhost
~~~

The plugin is activated automatically as soon as any `--opensearch.*` option is present.

### Configuration options

| Option | Default | Description |
|---|---|---|
| `--opensearch.host` | — | OpenSearch host (required) |
| `--opensearch.port` | 9200 | OpenSearch port |
| `--opensearch.index` | sitespeed | Index name prefix |
| `--opensearch.secure` | false | Use HTTPS |
| `--opensearch.username` | — | Username for Basic Auth |
| `--opensearch.password` | — | Password for Basic Auth |
| `--opensearch.includeRuns` | false | Also store per-iteration run data |
| `--opensearch.retentionDays` | 90 | Days to keep summary indices |
| `--opensearch.runRetentionDays` | 7 | Days to keep run-level indices |

### Label a specific run
Use `--name` to attach a label to all documents produced in that run. Useful for marking deployments:

~~~shell
sitespeed.io https://www.example.com --opensearch.host localhost --name "deploy-v2.3"
~~~

You can then filter all documents for that deploy: `name:"deploy-v2.3"`.

## Index structure
Data is stored in date-based indices so each type can have a different retention period. An index named `sitespeed-pagesummary-2026.03.05` contains all page summaries collected on that date.

| Index pattern | Retention | Contents |
|---|---|---|
| `sitespeed-pagesummary-*` | 90 days | Aggregated timings, Core Web Vitals, visual metrics per URL per run |
| `sitespeed-pagexray-*` | 90 days | Transfer sizes, request counts, content types |
| `sitespeed-coach-*` | 90 days | Coach scores (performance, privacy, best practice) |
| `sitespeed-compare-*` | 90 days | Statistical comparison results (current vs baseline) |
| `sitespeed-run-*` | 7 days | Raw per-iteration metrics (opt-in with `--opensearch.includeRuns`) |

All documents share a common set of dimension fields:

~~~
@timestamp   – ISO-8601 timestamp of the test run
url          – The URL that was tested
group        – Domain group (e.g. www.example.com)
alias        – Friendly name for the URL (if set with --urlAlias)
browser      – chrome / firefox / safari / edge
connectivity – cable / 3g / native / …
slug         – Test slug (--slug)
deviceType   – desktop / mobile / android / ios
iterations   – Number of test iterations
name         – Test name (--name), useful for marking deployments
resultUrl    – Link to the HTML result page (requires --resultBaseURL)
~~~

### pagesummary fields
Metric values are stored as `{median, p90, rsd}` objects where `rsd` is the relative standard deviation (coefficient of variation, a measure of run-to-run variability):

~~~
timings.ttfb.median / .p90
timings.fcp.median / .p90
timings.lcp.median / .p90
timings.fullyLoaded.median / .p90
timings.loadEventEnd.median / .p90
visualMetrics.speedIndex.median / .p90
visualMetrics.firstVisualChange.median / .p90
visualMetrics.lastVisualChange.median / .p90
googleWebVitals.lcp.median / .p90
googleWebVitals.cls.median / .p90
googleWebVitals.inp.median / .p90
cpu.longTasksTotalDuration.median / .p90
pageInfo.domElements.median / .p90
~~~

## Retention policies
ISM (Index State Management) policies are created automatically on the first sitespeed.io run. The default retention is 90 days for summaries and 7 days for run data. Change them at any time:

~~~shell
sitespeed.io https://www.example.com \
  --opensearch.host localhost \
  --opensearch.retentionDays 30 \
  --opensearch.runRetentionDays 3
~~~

The policies are updated in OpenSearch on every run (idempotent), so you do not need to restart OpenSearch to pick up changes.

## Grafana
[Grafana](https://grafana.com/) can connect to OpenSearch using the [Grafana OpenSearch plugin](https://grafana.com/grafana/plugins/grafana-opensearch-datasource/). Install it and add an OpenSearch data source pointing to your instance.

A ready-made Grafana dashboard is included at `docker/grafana/provisioning/dashboards/OpenSearch.json`. It is automatically provisioned when using the Docker Compose setup. You can also import it manually via **Dashboards → Import** in Grafana. It shows:

- Core Web Vitals (LCP, CLS, INP) with Good/Needs Improvement/Poor thresholds
- TTFB, FCP, and Fully Loaded timings (median and p90)
- Visual metrics (Speed Index, First/Last Visual Change, Perceptual Speed Index)
- Transfer size and request count (from pagexray data)

Template variables let you select URL, browser, and connectivity profile. Because the data is stored in separate indices, the page weight panels query `sitespeed-pagexray-*` while the timing panels query `sitespeed-pagesummary-*`.

## Querying with OpenSearch Dashboards
If you want to explore raw documents or use the built-in alerting plugin, you can add OpenSearch Dashboards separately. Point it at your OpenSearch instance and create an index pattern for `sitespeed-pagesummary-*` with `@timestamp` as the time field. Use **Discover** to search and filter with Lucene syntax.

### Example queries

Find all runs slower than 3 seconds LCP:
~~~
timings.lcp.median:>3000 AND browser:chrome
~~~

Find all runs for a specific URL using a test name label:
~~~
url:"https://www.example.com/" AND name:"deploy-v2.3"
~~~

Find URLs where the compare plugin detected a significant regression:
~~~
anySignificant:true AND significantMetrics:timings.lcp
~~~

Find pages with high layout shift:
~~~
googleWebVitals.cls.median:>0.1
~~~

### Alerts
OpenSearch Dashboards includes a built-in alerting plugin. You can create a monitor that queries your pagesummary index and sends a notification if LCP median exceeds your threshold. This works without Grafana or any external tool.

Example monitor query (OpenSearch query DSL):
~~~json
{
  "query": {
    "bool": {
      "filter": [
        { "range": { "@timestamp": { "gte": "now-1h" } } },
        { "range": { "timings.lcp.median": { "gt": 2500 } } }
      ]
    }
  }
}
~~~

Pair this with an SNS, Slack, or email destination in the **Alerting** plugin to get notified when performance degrades.

## Run data
By default only the aggregated page summary (median, p90 across all iterations) is stored. To also store each individual iteration, add `--opensearch.includeRuns`:

~~~shell
sitespeed.io https://www.example.com \
  --opensearch.host localhost \
  --opensearch.includeRuns
~~~

Run data is stored in `sitespeed-run-*` and automatically deleted after 7 days (configurable with `--opensearch.runRetentionDays`). Per-run data lets you see outliers and the spread of results within a single test.

## Secure your instance
By default OpenSearch listens on all interfaces. In production, make sure only your sitespeed.io servers can reach it.

If you run OpenSearch with authentication enabled, pass credentials with `--opensearch.username` and `--opensearch.password` (or `--opensearch.secure` for HTTPS).

## Production tips
1. Run `docker/opensearch/setup.sh` once before the first test to apply index templates. Without the templates, OpenSearch will auto-detect field types and may make wrong choices (e.g. treating a numeric field as text).
2. Mount the OpenSearch data directory outside of Docker so metrics survive container restarts:
   `- /data/opensearch:/usr/share/opensearch/data`
3. The ISM plugin is included in the standard OpenSearch distribution. If you use a managed service or a stripped-down image, check that ISM is available. If not, you can manage index lifecycle externally using the date suffix in the index name.
4. Use a dedicated ISM policy for each index pattern if your retention requirements differ from the defaults.
