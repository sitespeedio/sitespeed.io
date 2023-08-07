---
layout: default
title: Results and examples of what you will get if you run sitespeed.io, browsertime, coach or PageXray.
description: There's a lot of different things and metrics you can get with all the tools, these are some examples.
keywords: sitespeed.io, examples, results, wpo, web performance optimization
nav: examples
image: https://www.sitespeed.io/img/sitespeed-2.0-twitter.png
---

# Examples
{:.no_toc}

* Lets place the TOC here
{:toc}

## sitespeed.io

Sitespeed.io uses Browsertime, the Coach and PageXray to collect and generate the result, so looking at result pages from sitespeed.io will give you a idea of what you can get from all tools. Analysing two pages using Chrome looks like this:

~~~bash
docker run --rm -v "$(pwd):/sitespeed.io" sitespeedio/sitespeed.io:{% include version/sitespeed.io.txt %} -b chrome --cpu https://en.wikipedia.org/wiki/Main_Page https://en.wikipedia.org/wiki/Barack_Obama
~~~

Gives the following [report](https://examples.sitespeed.io/17.x/2021-05-23-07-23-07/). The standard use case for sitespeed.io is to run it continuously and send the data to Graphite/Grafana and create dashboards looking like this:

[![Example dashboard]({{site.baseurl}}/img/examples/dashboard-examples.png)](https://dashboard.sitespeed.io/d/9NDMzFfMk/page-metrics-desktop)
{: .img-thumbnail}
Checkout our [example dashboard](https://dashboard.sitespeed.io/d/9NDMzFfMk/page-metrics-desktop) to see what it looks like to use sitespeed.io to continuously measure performance.

## Browsertime
Browsertime collects metrics using JavaScript and will record the browser window using FFMPEG and produce a JSON file with the metrics collected, a HAR file that describes the request/responses and video and screenshots.

~~~bash
docker run --rm -v "$(pwd)":/browsertime sitespeedio/browsertime:{% include version/browsertime.txt %} https://www.sitespeed.io/
~~~

It will generate a HAR file, a video and a browsertime.json that hold all the metrics.

~~~json
{
    "info": {
        "browsertime": {
            "version": "3.0.0"
        },
        "url": "https://www.sitespeed.io/",
        "timestamp": "2018-05-10T12:31:57+00:00",
        "connectivity": {
            "engine": "external",
            "profile": "native"
        }
    },
    "browserScripts": [
        {
            "browser": {
                "userAgent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/66.0.3359.139 Safari/537.36",
                "windowSize": "1199x893"
            },
            "pageinfo": {
                "documentHeight": 3119,
                "documentSize": {
                    "decodedBodySize": 31087,
                    "encodedBodySize": 8202,
                    "transferSize": 8473
                },
                "documentTitle": "Sitespeed.io - Welcome to the wonderful world of Web Performance",
                "documentWidth": 1184,
                "nextHopProtocol": "h2",
                "responsive": true
            },
            "timings": {
                "firstPaint": 465,
                "fullyLoaded": 819,
                "navigationTiming": {
                    "connectStart": 43,
                    "domComplete": 634,
                    "domContentLoadedEventEnd": 411,
                    "domContentLoadedEventStart": 411,
                    "domInteractive": 411,
                    "domainLookupEnd": 43,
                    "domainLookupStart": 2,
                    "duration": 634,
                    "fetchStart": 2,
                    "loadEventEnd": 634,
                    "loadEventStart": 634,
                    "redirectEnd": 0,
                    "redirectStart": 0,
                    "requestStart": 186,
                    "responseEnd": 403,
                    "responseStart": 400,
                    "secureConnectionStart": 76,
                    "startTime": 0,
                    "unloadEventEnd": 0,
                    "unloadEventStart": 0,
                    "workerStart": 0
                },
                "pageTimings": {
                    "backEndTime": 400,
                    "domContentLoadedTime": 411,
                    "domInteractiveTime": 411,
                    "domainLookupTime": 41,
                    "frontEndTime": 232,
                    "pageDownloadTime": 3,
                    "pageLoadTime": 634,
                    "redirectionTime": 0,
                    "serverConnectionTime": 143,
                    "serverResponseTime": 216
                },
                "paintTiming": {
                    "first-contentful-paint": 465,
                    "first-paint": 465
                },
                "userTimings": {
                    "marks": [],
                    "measures": []
                }
            }
        }
    ],
    "statistics": {
        "pageinfo": {
            "documentHeight": {
                "median": 3119,
                "mean": 3119,
                "mdev": 0,
                "min": 3119,
                "p10": 3119,
                "p90": 3119,
                "p99": 3119,
                "max": 3119
            },
            "documentSize": {
                "decodedBodySize": {
                    "median": 31087,
                    "mean": 31087,
                    "mdev": 0,
                    "min": 31087,
                    "p10": 31087,
                    "p90": 31087,
                    "p99": 31087,
                    "max": 31087
                },
                "encodedBodySize": {
                    "median": 8202,
                    "mean": 8202,
                    "mdev": 0,
                    "min": 8202,
                    "p10": 8202,
                    "p90": 8202,
                    "p99": 8202,
                    "max": 8202
                },
                "transferSize": {
                    "median": 8473,
                    "mean": 8473,
                    "mdev": 0,
                    "min": 8473,
                    "p10": 8473,
                    "p90": 8473,
                    "p99": 8473,
                    "max": 8473
                }
            },
            "documentWidth": {
                "median": 1184,
                "mean": 1184,
                "mdev": 0,
                "min": 1184,
                "p10": 1184,
                "p90": 1184,
                "p99": 1184,
                "max": 1184
            }
        },
        "timings": {
            "firstPaint": {
                "median": 465,
                "mean": 465,
                "mdev": 0,
                "min": 465,
                "p10": 465,
                "p90": 465,
                "p99": 465,
                "max": 465
            },
            "fullyLoaded": {
                "median": 819,
                "mean": 819,
                "mdev": 0,
                "min": 819,
                "p10": 819,
                "p90": 819,
                "p99": 819,
                "max": 819
            },
            "navigationTiming": {
                "connectStart": {
                    "median": 43,
                    "mean": 43,
                    "mdev": 0,
                    "min": 43,
                    "p10": 43,
                    "p90": 43,
                    "p99": 43,
                    "max": 43
                },
                "domComplete": {
                    "median": 634,
                    "mean": 634,
                    "mdev": 0,
                    "min": 634,
                    "p10": 634,
                    "p90": 634,
                    "p99": 634,
                    "max": 634
                },
                "domContentLoadedEventEnd": {
                    "median": 411,
                    "mean": 411,
                    "mdev": 0,
                    "min": 411,
                    "p10": 411,
                    "p90": 411,
                    "p99": 411,
                    "max": 411
                },
                "domContentLoadedEventStart": {
                    "median": 411,
                    "mean": 411,
                    "mdev": 0,
                    "min": 411,
                    "p10": 411,
                    "p90": 411,
                    "p99": 411,
                    "max": 411
                },
                "domInteractive": {
                    "median": 411,
                    "mean": 411,
                    "mdev": 0,
                    "min": 411,
                    "p10": 411,
                    "p90": 411,
                    "p99": 411,
                    "max": 411
                },
                "domainLookupEnd": {
                    "median": 43,
                    "mean": 43,
                    "mdev": 0,
                    "min": 43,
                    "p10": 43,
                    "p90": 43,
                    "p99": 43,
                    "max": 43
                },
                "domainLookupStart": {
                    "median": 2,
                    "mean": 2,
                    "mdev": 0,
                    "min": 2,
                    "p10": 2,
                    "p90": 2,
                    "p99": 2,
                    "max": 2
                },
                "duration": {
                    "median": 634,
                    "mean": 634,
                    "mdev": 0,
                    "min": 634,
                    "p10": 634,
                    "p90": 634,
                    "p99": 634,
                    "max": 634
                },
                "fetchStart": {
                    "median": 2,
                    "mean": 2,
                    "mdev": 0,
                    "min": 2,
                    "p10": 2,
                    "p90": 2,
                    "p99": 2,
                    "max": 2
                },
                "loadEventEnd": {
                    "median": 634,
                    "mean": 634,
                    "mdev": 0,
                    "min": 634,
                    "p10": 634,
                    "p90": 634,
                    "p99": 634,
                    "max": 634
                },
                "loadEventStart": {
                    "median": 634,
                    "mean": 634,
                    "mdev": 0,
                    "min": 634,
                    "p10": 634,
                    "p90": 634,
                    "p99": 634,
                    "max": 634
                },
                "redirectEnd": {
                    "median": 0,
                    "mean": 0,
                    "mdev": 0,
                    "min": 0,
                    "p10": 0,
                    "p90": 0,
                    "p99": 0,
                    "max": 0
                },
                "redirectStart": {
                    "median": 0,
                    "mean": 0,
                    "mdev": 0,
                    "min": 0,
                    "p10": 0,
                    "p90": 0,
                    "p99": 0,
                    "max": 0
                },
                "requestStart": {
                    "median": 186,
                    "mean": 186,
                    "mdev": 0,
                    "min": 186,
                    "p10": 186,
                    "p90": 186,
                    "p99": 186,
                    "max": 186
                },
                "responseEnd": {
                    "median": 403,
                    "mean": 403,
                    "mdev": 0,
                    "min": 403,
                    "p10": 403,
                    "p90": 403,
                    "p99": 403,
                    "max": 403
                },
                "responseStart": {
                    "median": 400,
                    "mean": 400,
                    "mdev": 0,
                    "min": 400,
                    "p10": 400,
                    "p90": 400,
                    "p99": 400,
                    "max": 400
                },
                "secureConnectionStart": {
                    "median": 76,
                    "mean": 76,
                    "mdev": 0,
                    "min": 76,
                    "p10": 76,
                    "p90": 76,
                    "p99": 76,
                    "max": 76
                },
                "startTime": {
                    "median": 0,
                    "mean": 0,
                    "mdev": 0,
                    "min": 0,
                    "p10": 0,
                    "p90": 0,
                    "p99": 0,
                    "max": 0
                },
                "unloadEventEnd": {
                    "median": 0,
                    "mean": 0,
                    "mdev": 0,
                    "min": 0,
                    "p10": 0,
                    "p90": 0,
                    "p99": 0,
                    "max": 0
                },
                "unloadEventStart": {
                    "median": 0,
                    "mean": 0,
                    "mdev": 0,
                    "min": 0,
                    "p10": 0,
                    "p90": 0,
                    "p99": 0,
                    "max": 0
                },
                "workerStart": {
                    "median": 0,
                    "mean": 0,
                    "mdev": 0,
                    "min": 0,
                    "p10": 0,
                    "p90": 0,
                    "p99": 0,
                    "max": 0
                }
            },
            "pageTimings": {
                "backEndTime": {
                    "median": 400,
                    "mean": 400,
                    "mdev": 0,
                    "min": 400,
                    "p10": 400,
                    "p90": 400,
                    "p99": 400,
                    "max": 400
                },
                "domContentLoadedTime": {
                    "median": 411,
                    "mean": 411,
                    "mdev": 0,
                    "min": 411,
                    "p10": 411,
                    "p90": 411,
                    "p99": 411,
                    "max": 411
                },
                "domInteractiveTime": {
                    "median": 411,
                    "mean": 411,
                    "mdev": 0,
                    "min": 411,
                    "p10": 411,
                    "p90": 411,
                    "p99": 411,
                    "max": 411
                },
                "domainLookupTime": {
                    "median": 41,
                    "mean": 41,
                    "mdev": 0,
                    "min": 41,
                    "p10": 41,
                    "p90": 41,
                    "p99": 41,
                    "max": 41
                },
                "frontEndTime": {
                    "median": 232,
                    "mean": 232,
                    "mdev": 0,
                    "min": 232,
                    "p10": 232,
                    "p90": 232,
                    "p99": 232,
                    "max": 232
                },
                "pageDownloadTime": {
                    "median": 3,
                    "mean": 3,
                    "mdev": 0,
                    "min": 3,
                    "p10": 3,
                    "p90": 3,
                    "p99": 3,
                    "max": 3
                },
                "pageLoadTime": {
                    "median": 634,
                    "mean": 634,
                    "mdev": 0,
                    "min": 634,
                    "p10": 634,
                    "p90": 634,
                    "p99": 634,
                    "max": 634
                },
                "redirectionTime": {
                    "median": 0,
                    "mean": 0,
                    "mdev": 0,
                    "min": 0,
                    "p10": 0,
                    "p90": 0,
                    "p99": 0,
                    "max": 0
                },
                "serverConnectionTime": {
                    "median": 143,
                    "mean": 143,
                    "mdev": 0,
                    "min": 143,
                    "p10": 143,
                    "p90": 143,
                    "p99": 143,
                    "max": 143
                },
                "serverResponseTime": {
                    "median": 216,
                    "mean": 216,
                    "mdev": 0,
                    "min": 216,
                    "p10": 216,
                    "p90": 216,
                    "p99": 216,
                    "max": 216
                }
            },
            "paintTiming": {
                "first-contentful-paint": {
                    "median": 465,
                    "mean": 465,
                    "mdev": 0,
                    "min": 465,
                    "p10": 465,
                    "p90": 465,
                    "p99": 465,
                    "max": 465
                },
                "first-paint": {
                    "median": 465,
                    "mean": 465,
                    "mdev": 0,
                    "min": 465,
                    "p10": 465,
                    "p90": 465,
                    "p99": 465,
                    "max": 465
                }
            }
        },
        "visualMetrics": {
            "SpeedIndex": {
                "median": 487,
                "mean": 487,
                "mdev": 0,
                "min": 487,
                "p10": 487,
                "p90": 487,
                "p99": 487,
                "max": 487
            },
            "PerceptualSpeedIndex": {
                "median": 485,
                "mean": 485,
                "mdev": 0,
                "min": 485,
                "p10": 485,
                "p90": 485,
                "p99": 485,
                "max": 485
            },
            "FirstVisualChange": {
                "median": 467,
                "mean": 467,
                "mdev": 0,
                "min": 467,
                "p10": 467,
                "p90": 467,
                "p99": 467,
                "max": 467
            },
            "LastVisualChange": {
                "median": 634,
                "mean": 634,
                "mdev": 0,
                "min": 634,
                "p10": 634,
                "p90": 634,
                "p99": 634,
                "max": 634
            },
            "VisualReadiness": {
                "median": 167,
                "mean": 167,
                "mdev": 0,
                "min": 167,
                "p10": 167,
                "p90": 167,
                "p99": 167,
                "max": 167
            },
            "VisualComplete85": {
                "median": 567,
                "mean": 567,
                "mdev": 0,
                "min": 567,
                "p10": 567,
                "p90": 567,
                "p99": 567,
                "max": 567
            },
            "VisualComplete95": {
                "median": 600,
                "mean": 600,
                "mdev": 0,
                "min": 600,
                "p10": 600,
                "p90": 600,
                "p99": 600,
                "max": 600
            },
            "VisualComplete99": {
                "median": 600,
                "mean": 600,
                "mdev": 0,
                "min": 600,
                "p10": 600,
                "p90": 600,
                "p99": 600,
                "max": 600
            }
        },
        "cpu": {
            "categories": {
                "Scripting": {
                    "median": 9,
                    "mean": 9,
                    "mdev": 0,
                    "min": 9,
                    "p10": 9,
                    "p90": 9,
                    "p99": 9,
                    "max": 9
                },
                "Rendering": {
                    "median": 37,
                    "mean": 37,
                    "mdev": 0,
                    "min": 37,
                    "p10": 37,
                    "p90": 37,
                    "p99": 37,
                    "max": 37
                },
                "Painting": {
                    "median": 3,
                    "mean": 3,
                    "mdev": 0,
                    "min": 3,
                    "p10": 3,
                    "p90": 3,
                    "p99": 3,
                    "max": 3
                },
                "Loading": {
                    "median": 4,
                    "mean": 4,
                    "mdev": 0,
                    "min": 4,
                    "p10": 4,
                    "p90": 4,
                    "p99": 4,
                    "max": 4
                }
            },
            "events": {
                "FireAnimationFrame": {
                    "median": 0,
                    "mean": 0,
                    "mdev": 0,
                    "min": 0,
                    "p10": 0,
                    "p90": 0,
                    "p99": 0,
                    "max": 0
                },
                "FunctionCall": {
                    "median": 0,
                    "mean": 0,
                    "mdev": 0,
                    "min": 0,
                    "p10": 0,
                    "p90": 0,
                    "p99": 0,
                    "max": 0
                },
                "UpdateLayoutTree": {
                    "median": 8,
                    "mean": 8,
                    "mdev": 0,
                    "min": 8,
                    "p10": 8,
                    "p90": 8,
                    "p99": 8,
                    "max": 8
                },
                "UpdateLayerTree": {
                    "median": 1,
                    "mean": 1,
                    "mdev": 0,
                    "min": 1,
                    "p10": 1,
                    "p90": 1,
                    "p99": 1,
                    "max": 1
                },
                "Paint": {
                    "median": 3,
                    "mean": 3,
                    "mdev": 0,
                    "min": 3,
                    "p10": 3,
                    "p90": 3,
                    "p99": 3,
                    "max": 3
                },
                "EventDispatch": {
                    "median": 0,
                    "mean": 0,
                    "mdev": 0,
                    "min": 0,
                    "p10": 0,
                    "p90": 0,
                    "p99": 0,
                    "max": 0
                },
                "ParseHTML": {
                    "median": 4,
                    "mean": 4,
                    "mdev": 0,
                    "min": 4,
                    "p10": 4,
                    "p90": 4,
                    "p99": 4,
                    "max": 4
                },
                "Layout": {
                    "median": 28,
                    "mean": 28,
                    "mdev": 0,
                    "min": 28,
                    "p10": 28,
                    "p90": 28,
                    "p99": 28,
                    "max": 28
                },
                "BlinkGCMarking": {
                    "median": 4,
                    "mean": 4,
                    "mdev": 0,
                    "min": 4,
                    "p10": 4,
                    "p90": 4,
                    "p99": 4,
                    "max": 4
                },
                "ThreadState::performIdleLazySweep": {
                    "median": 1,
                    "mean": 1,
                    "mdev": 0,
                    "min": 1,
                    "p10": 1,
                    "p90": 1,
                    "p99": 1,
                    "max": 1
                },
                "MinorGC": {
                    "median": 4,
                    "mean": 4,
                    "mdev": 0,
                    "min": 4,
                    "p10": 4,
                    "p90": 4,
                    "p99": 4,
                    "max": 4
                }
            }
        }
    },
    "visualMetrics": [
        {
            "SpeedIndex": 487,
            "PerceptualSpeedIndex": 485,
            "FirstVisualChange": 467,
            "LastVisualChange": 634,
            "VisualProgress": "0=0%, 467=82%, 500=82%, 567=94%, 600=99%, 634=100%",
            "VisualReadiness": 167,
            "VisualComplete85": 567,
            "VisualComplete95": 600,
            "VisualComplete99": 600
        }
    ],
    "timestamps": [
        "2018-05-10T12:32:01+00:00"
    ],
    "cpu": [
        {
            "categories": {
                "Scripting": 9.2,
                "Rendering": 36.7,
                "Painting": 2.7,
                "Loading": 3.5
            },
            "events": {
                "FireAnimationFrame": 0.1,
                "FunctionCall": 0.3,
                "UpdateLayoutTree": 7.5,
                "UpdateLayerTree": 1.4,
                "Paint": 2.7,
                "EventDispatch": 0.1,
                "ParseHTML": 3.5,
                "Layout": 27.8,
                "BlinkGCMarking": 3.8,
                "ThreadState::performIdleLazySweep": 0.6,
                "MinorGC": 4.4
            }
        }
    ],
    "errors": [
        []
    ]
}
~~~

## Coach
The coach collect metrics and return advice what you should change to make your page faster. You can run our Docker container or use it directly in NodeJS.

Using Docker you can run the Coach like this:

~~~bash
docker run sitespeedio/coach:{% include version/coach.txt %} https://www.sitespeed.io -b firefox -f json
~~~

And it will generate a JSON that looks something like this:

~~~
{
  "advice": {
    "accessibility": {
      "adviceList": {
        "altImages": {
          "advice": "The page has 3 images that lack alt attribute(s) and 3 of them are unique.",
          "description": "All img tags require an alt attribute. This goes without exception. Everything else is an error. If you have an img tag in your HTML without an alt attribute, add it now. https://www.marcozehe.de/2015/12/14/the-web-accessibility-basics/",
          "id": "altImages",
          "offending": [
            "https://www.sitespeed.io/img/black-logo-120.png",
            "https://www.sitespeed.io/img/fastly2.png",
            "https://www.sitespeed.io/img/digital-ocean.png"
          ],
          "score": 70,
          "tags": [
            "accessibility",
            "images"
          ],
          "title": "Always use an alt attribute on image tags",
          "weight": 5
        },
        "headings": {
          "advice": "The page is missing a h1 and has heading(s) with lower priority.",
          "description": "Headings give your document a logical, easy to follow structure. Have you ever wondered how Wikipedia puts together its table of contents for each article? They use the logical heading structure for that, too! The H1 through H6 elements are unambiguous in telling screen readers, search engines and other technologies what the structure of your document is. https://www.marcozehe.de/2015/12/14/the-web-accessibility-basics/",
          "id": "headings",
          "offending": [
          ],
          "score": 90,
          "tags": [
            "accessibility",
            "html"
          ],
          "title": "Use heading tags to structure your page",
          "weight": 4
        },
        "labelOnInput": {
          "advice": "",
          "description": "Most input elements, as well as the select and textarea elements, need an associated label element that states their purpose. The only exception is those that produce a button, like the reset and submit buttons do. Others, be it text, checkbox, password, radio (button), search etc. require a label element to be present. https://www.marcozehe.de/2015/12/14/the-web-accessibility-basics/",
          "id": "labelOnInput",
          "offending": [
          ],
          "score": 100,
          "tags": [
            "accessibility",
            "form"
          ],
          "title": "Always set labels on inputs in forms",
          "weight": 3
        },
        "landmarks": {
          "advice": "",
          "description": "Landmarks can be article, aside, footer, header, nav or main tag. Adding such landmarks appropriately can help further provide sense to your document and help users more easily navigate it. https://www.marcozehe.de/2015/12/14/the-web-accessibility-basics/",
          "id": "landmarks",
          "offending": [
          ],
          "score": 100,
          "tags": [
            "accessibility",
            "html"
          ],
          "title": "Structure your content by using landmarks",
          "weight": 5
        },
        "neverSuppressZoom": {
          "advice": "",
          "description": "A key feature of mobile browsing is being able to zoom in to read content and out to locate content within a page. http://www.iheni.com/mobile-accessibility-tip-dont-suppress-pinch-zoom/",
          "id": "neverSuppressZoom",
          "offending": [
          ],
          "score": 100,
          "tags": [
            "accessibility"
          ],
          "title": "Don't suppress pinch zoom",
          "weight": 8
        },
        "sections": {
          "advice": "The page doesn't use sections. You could use them to get a better structure of your content.",
          "description": "Section tags should have at least one heading element as a direct descendant.",
          "id": "sections",
          "offending": [
          ],
          "score": 0,
          "tags": [
            "accessibility",
            "html"
          ],
          "title": "Use headings tags within section tags to better structure your page",
          "weight": 0
        },
        "table": {
          "advice": "",
          "description": "Add a caption element to give the table a proper heading or summary. Use th elements to denote column and row headings. Make use of their scope and other attributes to clearly associate what belongs to which. https://www.marcozehe.de/2015/12/14/the-web-accessibility-basics/",
          "id": "table",
          "offending": [
          ],
          "score": 100,
          "tags": [
            "accessibility",
            "html"
          ],
          "title": "Use caption and th in tables",
          "weight": 5
        }
      },
      "score": 94
    },
    "bestpractice": {
      "adviceList": {
        "charset": {
          "advice": "",
          "description": "The Unicode Standard (UTF-8) covers (almost) all the characters, punctuations, and symbols in the world. Please use that.",
          "id": "charset",
          "offending": [
          ],
          "score": 100,
          "tags": [
            "bestpractice"
          ],
          "title": "Declare a charset in your document",
          "weight": 2
        },
        "doctype": {
          "advice": "",
          "description": "The <!DOCTYPE> declaration is not an HTML tag; it is an instruction to the web browser about what version of HTML the page is written in.",
          "id": "doctype",
          "offending": [
          ],
          "score": 100,
          "tags": [
            "bestpractice"
          ],
          "title": "Declare a doctype in your document",
          "weight": 2
        },
        "https": {
          "advice": "",
          "description": "A page should always use HTTPS (https://https.cio.gov/everything/). You also need that for HTTP/2! You can get your free SSL/TLC certificate from https://letsencrypt.org/.",
          "id": "https",
          "offending": [
          ],
          "score": 100,
          "tags": [
            "bestpractice"
          ],
          "title": "Serve your content securely",
          "weight": 10
        },
        "httpsH2": {
          "advice": "",
          "description": "Using HTTP/2 together with HTTPS is the new best practice. If you use HTTPS (you should), you should also use HTTP/2.",
          "id": "httpsH2",
          "offending": [
          ],
          "score": 100,
          "tags": [
            "bestpractice"
          ],
          "title": "Serve your content using HTTP/2",
          "weight": 2
        },
        "language": {
          "advice": "",
          "description": "According to the W3C recommendation you should declare the primary language for each Web page with the lang attribute inside the <html> tag https://www.w3.org/International/questions/qa-html-language-declarations#basics.",
          "id": "language",
          "offending": [
          ],
          "score": 100,
          "tags": [
            "bestpractice"
          ],
          "title": "Declare the language code for your document",
          "weight": 3
        },
        "metaDescription": {
          "advice": "The meta description is too long. It has 232 characters, the recommended max is 155",
          "description": "Use a page description to make the page more relevant to search engines.",
          "id": "metaDescription",
          "offending": [
          ],
          "score": 50,
          "tags": [
            "bestpractice"
          ],
          "title": "Meta description",
          "weight": 5
        },
        "optimizely": {
          "advice": "",
          "description": "Use Optimizely with care because it hurts your performance since Javascript is loaded synchronously inside of the head tag, making the first paint happen later. Only turn on Optimizely (= load the javascript) when you run your A/B tests.",
          "id": "optimizely",
          "offending": [
          ],
          "score": 100,
          "tags": [
            "bestpractice"
          ],
          "title": "Only use Optimizely when you need it",
          "weight": 2
        },
        "pageTitle": {
          "advice": "The title is too long by 4 characters. The recommended max is 60",
          "description": "Use a title to make the page more relevant to search engines.",
          "id": "pageTitle",
          "offending": [
          ],
          "score": 50,
          "tags": [
            "bestpractice"
          ],
          "title": "Page title",
          "weight": 5
        },
        "spdy": {
          "advice": "",
          "description": "Chrome dropped supports for SPDY in Chrome 51, upgrade to HTTP/2 as soon as possible. The page has more users (browsers) supporting HTTP/2 than supports SPDY.",
          "id": "spdy",
          "offending": [
          ],
          "score": 100,
          "tags": [
            "bestpractice"
          ],
          "title": "EOL for SPDY in Chrome",
          "weight": 1
        },
        "url": {
          "advice": "",
          "description": "A clean URL is good for the user and for SEO. Make them human readable, avoid too long URLs, spaces in the URL, too many request parameters, and never ever have the session id in your URL.",
          "id": "url",
          "offending": [
          ],
          "score": 100,
          "tags": [
            "bestpractice"
          ],
          "title": "Have a good URL format",
          "weight": 2
        }
      },
      "score": 85
    },
    "info": {
      "amp": false,
      "browser": "Chrome 62.0.3202.75",
      "connectionType": "h2",
      "documentHeight": 2485,
      "documentTitle": "Sitespeed.io - Welcome to the wonderful world of Web Performance",
      "documentWidth": 1184,
      "domDepth": {
        "avg": 7,
        "max": 10
      },
      "domElements": 253,
      "head": {
        "css": [
        ],
        "jsasync": [
        ],
        "jssync": [
        ]
      },
      "iframes": 0,
      "localStorageSize": 0,
      "metaDescription": "Sitespeed.io is an open source tool that helps you analyse and optimize your website speed and performance, based on performance best practices. Run it locally or use it in your continuous integration. Download or fork it on GitHub!",
      "pageContentSize": "120.9 kB",
      "pageContentTypes": {
        "css": {
          "contentSize": 0,
          "headerSize": 0,
          "requests": 0,
          "transferSize": 0
        },
        "favicon": {
          "contentSize": 6518,
          "headerSize": 0,
          "requests": 1,
          "transferSize": 3041
        },
        "font": {
          "contentSize": 0,
          "headerSize": 0,
          "requests": 0,
          "transferSize": 0
        },
        "html": {
          "contentSize": 28450,
          "headerSize": 0,
          "requests": 1,
          "transferSize": 8524
        },
        "image": {
          "contentSize": 85979,
          "headerSize": 0,
          "requests": 8,
          "transferSize": 87233
        },
        "javascript": {
          "contentSize": 0,
          "headerSize": 0,
          "requests": 0,
          "transferSize": 0
        }
      },
      "pageCookies": {
        "max": 0,
        "median": 0,
        "min": 0,
        "total": 0,
        "values": 10
      },
      "pageDomains": 1,
      "pageExpireStats": {
        "max": "1 year",
        "median": "1 year",
        "min": "10 minutes",
        "total": "9 years",
        "values": "10 seconds"
      },
      "pageLastModifiedStats": {
        "max": "2 weeks",
        "median": "2 weeks",
        "min": "2 weeks",
        "total": "19 weeks",
        "values": "10 seconds"
      },
      "pageRequests": 10,
      "pageTransferSize": "98.8 kB",
      "resourceHints": {
        "dns-prefetch": [
        ],
        "preconnect": [
        ],
        "prefetch": [
        ],
        "prerender": [
        ]
      },
      "responsive": true,
      "scripts": 1,
      "serializedDomSize": 10135,
      "sessionStorageSize": 0,
      "userTiming": {
        "marks": 1,
        "measures": 0
      },
      "windowSize": "1199x893"
    },
    "performance": {
      "adviceList": {
        "assetsRedirects": {
          "advice": "",
          "description": "A redirect is one extra step for the user to download the asset. Avoid that if you want to be fast. Redirects are even more showstoppers on mobile.",
          "id": "assetsRedirects",
          "offending": [
          ],
          "score": 100,
          "tags": [
            "performance"
          ],
          "title": "Avoid doing redirects",
          "weight": 2
        },
        "avoidScalingImages": {
          "advice": "The page has 6 image(s) that are scaled more than 100 pixels. It would be better if those images are sent so the browser don't need to scale them.",
          "description": "It's easy to scale images in the browser and make sure they look good in different devices, however that is bad for performance! Scaling images in the browser takes extra CPU time and will hurt performance on mobile. And the user will download download extra kilobytes (sometime megabytes) of data that could be avoided. Don't do that, make sure you create multiple version of the same image serverside and serve the appropriate one.",
          "id": "avoidScalingImages",
          "offending": [
            "https://www.sitespeed.io/img/sitespeed-logo-2c.png",
            "https://www.sitespeed.io/img/sitespeed.io-logo-large2.png",
            "https://www.sitespeed.io/img/pippi.png",
            "https://www.sitespeed.io/img/logos/coach.png",
            "https://www.sitespeed.io/img/browsertime-ff-chrome.png",
            "https://www.sitespeed.io/img/digital-ocean.png"
          ],
          "score": 40,
          "tags": [
            "performance",
            "image"
          ],
          "title": "Don't scale images in the browser",
          "weight": 5
        },
        "cacheHeaders": {
          "advice": "",
          "description": "The easiest way to make your page fast is to avoid doing requests to the server. Setting a cache header on your server response will tell the browser that it doesn't need to download the asset again during the configured cache time! Always try to set a cache time if the content doesn't change for every request.",
          "id": "cacheHeaders",
          "offending": [
          ],
          "score": 100,
          "tags": [
            "performance",
            "server"
          ],
          "title": "Avoid extra requests by setting cache headers",
          "weight": 30
        },
        "cacheHeadersLong": {
          "advice": "",
          "description": "Setting a cache header is good. Setting a long cache header (at least 30 days) is even better because then it will stay long in the browser cache. But what do you do if that asset change? Rename it and the browser will pick up the new version.",
          "id": "cacheHeadersLong",
          "offending": [
          ],
          "score": 100,
          "tags": [
            "performance",
            "server"
          ],
          "title": "Long cache headers is good",
          "weight": 3
        },
        "compressAssets": {
          "advice": "",
          "description": "In the early days of Internet there where browsers that didn't support compressing (gzipping) text content. They do now. Make sure you compress HTML, JSON, Javascript, CSS and SVG. I will save bytes for the user; making the page load faster and use less bandwidth. ",
          "id": "compressAssets",
          "offending": [
          ],
          "score": 100,
          "tags": [
            "performance",
            "server"
          ],
          "title": "Always compress text content",
          "weight": 8
        },
        "connectionKeepAlive": {
          "advice": "",
          "description": "Use keep alive headers & don't close the connection when we have multiple requests to the same domain. There has been some hacks in the past that suggested closing the connection as fast as possible and create new ones, but shouldn't be applicable anymore.",
          "id": "connectionKeepAlive",
          "offending": [
          ],
          "score": 100,
          "tags": [
            "performance",
            "server"
          ],
          "title": "Don't close a connection that is used multiple times",
          "weight": 5
        },
        "cssPrint": {
          "advice": "",
          "description": "Loading a specific stylesheet for printing slows down the page, even though it is not used. You can include the print styles inside your other CSS file(s) just by using use @media type print.",
          "id": "cssPrint",
          "offending": [
          ],
          "score": 100,
          "tags": [
            "performance",
            "css"
          ],
          "title": "Do not load specific print stylesheets.",
          "weight": 1
        },
        "cssSize": {
          "advice": "",
          "description": "Delivering a massive amount of CSS to the browser is not the best thing you can do, because it means more work for the browser when parsing the CSS against the HTML and that makes the rendering slower. Try to send only the CSS that is used on that page. And make sure to remove CSS rules when they aren't used anymore.",
          "id": "cssSize",
          "offending": [
          ],
          "score": 100,
          "tags": [
            "performance",
            "css"
          ],
          "title": "Total CSS size shouldn't be too big",
          "weight": 5
        },
        "documentRedirect": {
          "advice": "",
          "description": "You should never ever redirect the main document, because it will make the page load slower for the user. Well you should redirect the  user if the user tries to use HTTP and there's a HTTPS version of the page. The coach check for that. :)",
          "id": "documentRedirect",
          "offending": [
          ],
          "score": 100,
          "tags": [
            "performance"
          ],
          "title": "Avoid redirecting the main document",
          "weight": 9
        },
        "fastRender": {
          "advice": "",
          "description": "The critical rendering path is what the browser needs to do to start rendering the page. Every file requested inside of head element will postpone the rendering of the page, because the browser need to do the request. Avoid loading JavaScript synchronously inside of head (you should not need Javascript to render the page), request files from the same domain as the main document (to avoid DNS lookups) and inline CSS or server push for a really fast rendering and short rendering path.",
          "id": "fastRender",
          "offending": [
          ],
          "score": 100,
          "tags": [
            "performance"
          ],
          "title": "Avoid slowing down the critical rendering path",
          "weight": 10
        },
        "favicon": {
          "advice": "",
          "description": "It is easy to make the favicon big but please avoid that, because every browser will download that. And make sure the cache headers is set for long time for the favicon, it is easy to miss since it's another content type.",
          "id": "favicon",
          "offending": [
          ],
          "score": 100,
          "tags": [
            "performance",
            "favicon"
          ],
          "title": "The favicon should be small and cacheable",
          "weight": 1
        },
        "fewFonts": {
          "advice": "",
          "description": "How many fonts do you need on a page for the user to get the message? Fonts can slow down the rendering of content, try to avoid loading too many of them because worst case it can make the text invisible until they are loaded, best case they will flicker the text content when they arrive.",
          "id": "fewFonts",
          "offending": [
          ],
          "score": 100,
          "tags": [
            "performance",
            "font"
          ],
          "title": "Avoid too many fonts",
          "weight": 2
        },
        "fewRequestsPerDomain": {
          "advice": "There are almost no limits on HTTP/2 connections with the number of requests, but it is not completely true. It depends on how they are downloaded. Please check your HAR file, does it look OK?",
          "description": "Browsers have a limit on how many concurrent requests they can do per domain when using HTTP/1. When you hit the limit, the browser will wait before it can download more assets on that domain. So avoid having to many requests per domain.",
          "id": "fewRequestsPerDomain",
          "offending": [
          ],
          "score": 100,
          "tags": [
            "performance",
            "HTTP/1"
          ],
          "title": "Avoid too many requests per domain [HTTP/1]",
          "weight": 5
        },
        "headerSize": {
          "advice": "The page uses an HTTP/2 connection and the headers are sent compressed, that's good. The current coach version cannot say if the size is good or not.",
          "description": "Avoid a lot of cookies and other stuff that makes your headers big when you use HTTP/1 because the headers are not compressed. You will send extra data to the user.",
          "id": "headerSize",
          "offending": [
          ],
          "score": 100,
          "tags": [
            "performance",
            "mobile"
          ],
          "title": "Response headers should't be too big [HTTP/1]",
          "weight": 4
        },
        "imageSize": {
          "advice": "",
          "description": "Avoid having too many large images on page. The images will not affect the first paint of the page but it will eat bandwidth for the user.",
          "id": "imageSize",
          "offending": [
          ],
          "score": 100,
          "tags": [
            "performance",
            "image"
          ],
          "title": "Total image size shouldn't be too big",
          "weight": 5
        },
        "inlineCss": {
          "advice": "The page has inline CSS and uses HTTP/2. Do you have a lot of users with slow connections on the site, it is good to inline CSS when using HTTP/2. If not and your server supports server push, use it to push the CSS files instead.",
          "description": "In the early days of internet inlining CSS was one of the ugliest things you can do. That has changed if you want your page to start rendering fast for your user. Always inline the critical CSS when you use HTTP/1 (avoid doing CSS requests that blocks rendering) and lazy load and cache the rest of the CSS. Using HTTP/2 it is a little more complicated. Does your server support HTTP push? Then maybe that can help. Do you have a lot of users on a slow connection and serving large chunks of HTML? Then it could be better to inline, because some servers always prioritize HTML content over CSS so the user needs to download the HTML first, before the CSS is downloaded.",
          "id": "inlineCss",
          "offending": [
          ],
          "score": 100,
          "tags": [
            "performance",
            "css"
          ],
          "title": "Inline CSS for faster first render on HTTP/1",
          "weight": 7
        },
        "javascriptSize": {
          "advice": "",
          "description": "A lot of JavaScript often means you are downloading more than you need. How complex is the page and what can the user do on the page? Do you use multiple Javascript frameworks?",
          "id": "javascriptSize",
          "offending": [
          ],
          "score": 100,
          "tags": [
            "performance",
            "javascript"
          ],
          "title": "Total JavaScript size shouldn't be too big",
          "weight": 5
        },
        "jquery": {
          "advice": "",
          "description": "There sites out there that uses multiple version of JQuery on the same page. You shouldn't do that because the user will then download extra amount of data that could be avoided. Cleanup the code and make sure you only use one version.",
          "id": "jquery",
          "offending": [
          ],
          "score": 100,
          "tags": [
            "jQuery",
            "performance"
          ],
          "title": "Avoid using more than one jQuery version per page",
          "weight": 4
        },
        "mimeTypes": {
          "advice": "",
          "description": "It's not a great idea to let browsers guess content types (content sniffing), in some cases it can actually be a security risk.",
          "id": "mimeTypes",
          "offending": [
          ],
          "score": 100,
          "tags": [
            "performance",
            "bestpractice"
          ],
          "title": "Avoid using incorrect mime types",
          "weight": 0
        },
        "optimalCssSize": {
          "advice": "",
          "description": "Make CSS responses small to fit into the magic number TCP window size 14.5 kB. The browser can then download the CSS faster and that will make the page start render earlier.",
          "id": "optimalCssSize",
          "offending": [
          ],
          "score": 100,
          "tags": [
            "performance",
            "css"
          ],
          "title": "Make each CSS response small",
          "weight": 3
        },
        "pageSize": {
          "advice": "",
          "description": "Avoid having pages that have transfer size over the wire of more than 2 MB (desktop) and 1 MB (mobile) because that is really big and will hurt performance and will make the page expensive for the user if she/he pays for the bandwidth.",
          "id": "pageSize",
          "offending": [
          ],
          "score": 100,
          "tags": [
            "performance",
            "mobile"
          ],
          "title": "Total page size shouldn't be too big",
          "weight": 3
        },
        "privateAssets": {
          "advice": "",
          "description": "If you set private headers on content, that means that the content are specific for that user. Static content should be able to be cached & used by everyone, avoid setting the cache header to private.",
          "id": "privateAssets",
          "offending": [
          ],
          "score": 100,
          "tags": [
            "performance",
            "server"
          ],
          "title": "Don't use private headers on static content",
          "weight": 5
        },
        "responseOk": {
          "advice": "",
          "description": "Your page you should never request assets that returns a 400 or 500 error. These requests are never cached, they will be done everytime from the browser. If that happens something is broken, please fix it.",
          "id": "responseOk",
          "offending": [
          ],
          "score": 100,
          "tags": [
            "performance",
            "server"
          ],
          "title": "Avoid missing and error requests",
          "weight": 7
        },
        "spof": {
          "advice": "",
          "description": "A page can be stopped to be loaded in the browser, if a single Javascript, CSS and in some cases a font couldn't be fetched or loading really slow (the white screen of death). That is something you really want to avoid. Never load 3rd party components synchronously inside of the head tag.",
          "id": "spof",
          "offending": [
          ],
          "score": 100,
          "tags": [
            "performance",
            "css",
            "js"
          ],
          "title": "Avoid Frontend single point of failures",
          "weight": 7
        },
        "thirdPartyAsyncJs": {
          "advice": "",
          "description": "Use JavaScript snippets that load the JS files asynchronously in order to speed up the user experience and avoid blocking the initial load.",
          "id": "thirdPartyAsyncJs",
          "offending": [
          ],
          "score": 100,
          "tags": [
            "performance",
            "js"
          ],
          "title": "Always load third-party JavaScript asynchronously",
          "weight": 5
        }
      },
      "score": 98
    },
    "score": 95,
    "timings": {
      "firstPaint": 271.0001468658447,
      "fullyLoaded": 288.89500000000004,
      "navigationTimings": {
        "connectEnd": 22,
        "connectStart": 22,
        "domComplete": 271,
        "domContentLoadedEventEnd": 220,
        "domContentLoadedEventStart": 220,
        "domInteractive": 220,
        "domLoading": 204,
        "domainLookupEnd": 22,
        "domainLookupStart": 22,
        "fetchStart": 22,
        "loadEventEnd": 271,
        "loadEventStart": 271,
        "navigationStart": 0,
        "requestStart": 191,
        "responseEnd": 202,
        "responseStart": 199
      },
      "timings": {
        "backEndTime": 199,
        "domContentLoadedTime": 220,
        "domInteractiveTime": 220,
        "domainLookupTime": 0,
        "frontEndTime": 69,
        "pageDownloadTime": 3,
        "pageLoadTime": 271,
        "redirectionTime": 22,
        "serverConnectionTime": 0,
        "serverResponseTime": 11
      },
      "userTimings": {
        "marks": [
          {
            "name": "logoTime",
            "startTime": 270.96500000000003
          }
        ],
        "measures": [
        ]
      }
    }
  },
  "errors": {
  },
  "url": "https://www.sitespeed.io/",
  "version": "1.0.0-alpha1"
}
~~~


## Compare
![Compare two different HAR files]({{site.baseurl}}/img/compare-full.png)
{: .img-thumbnail}

## PageXray

PageXray will convert your HAR file to a new JSON format. If your HAR file is from Browsertime it will pickup some extra info.

Run it locally in NodeJS or in the browser:

~~~bash
pagexray --pretty /path/to/my.har
~~~

Will convert the HAR to the following structure:

```json
[
  {
    "url": "https://www.sitespeed.io/",
    "meta": {
      "browser": {
        "name": "Chrome",
        "version": "60.0.3112.78"
      },
      "startedDateTime": "2017-08-24T18:26:29.077Z",
      "connectivity": "native",
      "title": "Sitespeed.io - Welcome to the wonderful world of Web Performance run 1"
    },
    "finalUrl": "https://www.sitespeed.io/",
    "baseDomain": "www.sitespeed.io",
    "documentRedirects": 0,
    "redirectChain": [],
    "transferSize": 98791,
    "contentSize": 120776,
    "headerSize": 0,
    "requests": 10,
    "missingCompression": 0,
    "httpType": "h2",
    "httpVersion": "HTTP/2.0",
    "contentTypes": {
      "html": {
        "transferSize": 8479,
        "contentSize": 28279,
        "headerSize": 0,
        "requests": 1
      },
      "css": {
        "transferSize": 0,
        "contentSize": 0,
        "headerSize": 0,
        "requests": 0
      },
      "javascript": {
        "transferSize": 0,
        "contentSize": 0,
        "headerSize": 0,
        "requests": 0
      },
      "image": {
        "transferSize": 87309,
        "contentSize": 85979,
        "headerSize": 0,
        "requests": 8
      },
      "font": {
        "transferSize": 0,
        "contentSize": 0,
        "headerSize": 0,
        "requests": 0
      },
      "favicon": {
        "transferSize": 3003,
        "contentSize": 6518,
        "headerSize": 0,
        "requests": 1
      }
    },
    "assets": [],
    "responseCodes": {
      "200": 10
    },
    "firstParty": {},
    "thirdParty": {},
    "domains": {
      "www.sitespeed.io": {
        "transferSize": 98791,
        "contentSize": 120776,
        "headerSize": -10,
        "requests": 10,
        "timings": {
          "blocked": 169,
          "dns": 0,
          "connect": 0,
          "send": 6,
          "wait": 3624,
          "receive": 104
        }
      }
    },
    "expireStats": {
      "min": 600,
      "median": 31536000,
      "max": 31536000,
      "total": 283824600,
      "values": 10
    },
    "lastModifiedStats": {
      "min": 733347,
      "median": 733444,
      "max": 733480,
      "total": 7334359,
      "values": 10
    },
    "cookieStats": {
      "min": 0,
      "median": 0,
      "max": 0,
      "total": 0,
      "values": 10
    },
    "totalDomains": 1,
    "visualMetrics": {
      "FirstVisualChange": 617,
      "SpeedIndex": 625,
      "VisualComplete85": 617,
      "LastVisualChange": 1033,
      "VisualProgress": {
        "0": 0,
        "617": 98,
        "633": 98,
        "667": 98,
        "850": 98,
        "1033": 100
      }
    }
  }
]
```
