---
layout: default
title: Upload result to Google Cloud Storage (GCS).
description: You can upload the HTML/videos to GCS. Here's how to do that.
keywords: GCS, spaces, do, google cloud storage, configure, sitespeed.io
author: Markus Liljedahl
nav: documentation
category: sitespeed.io
image: https://www.sitespeed.io/img/sitespeed-2.0-twitter.png
twitterdescription: Upload result to GCS.
---
[Documentation]({{site.baseurl}}/documentation/sitespeed.io/) / GCS

# Google Cloud Storage
{:.no_toc}

* Lets place the TOC here
{:toc}

## Setup a GCS bucket
To setup a bucket on GCS you need to have a Google Cloud account.

* [Create one IAM User](https://cloud.google.com/storage/docs/getting-service-account) with the ```Storage Option Admin``` role - you need a IAM user to get the **key** file to be able to upload the result from sitespeed.io.
* [Create a bucket](https://cloud.google.com/storage/docs/creating-buckets) - setup one bucket per server that runs tests (then you are sure there will be no collides and it will be easier when you want to remove tests).
* [Configure your bucket for static website hosting](
https://cloud.google.com/storage/docs/hosting-static-website) - so that you can access the result pages and make sure you add a bucket policy (for access).
* [Add a lifecycle rule](https://cloud.google.com/storage/docs/bucket-lock) - you want to make sure you remove old result pages/videos/screenshots to save money.

Do you need more help? First dive into the [Google Cloud Storage docs](https://cloud.google.com/storage/docs/) then if it doesn't help, [create an issue](https://github.com/sitespeedio/sitespeed.io/issues/new) and we can try to help you.

## sitespeed.io configuration
To push the metrics to GCS you need the **project id**, the **service account key file** and your **bucketname**. You get the ```--gcs.projectID``` from your Google Cloud Platform project and the ```--gcs.key``` from your IAM User. The ```--gcs.bucketname``` is the name you picked for your bucket.

## Using GCS as server

Running on GCS you should also setup a URL to your GCS bucket, make sure that the name of the bucket is same as the domain name and make the content of the bucket publicly readable with ```--gcs.public true```. Or set up [IAM permissions](https://cloud.google.com/storage/docs/access-control/using-iam-permissions) for the bucket. That way the annotation links in Graphite/InfluxDb will appear. You can then go from a result in Grafana to the actual HTML result. That is super useful when you want to understand a regression.

Regardless if you have your own domain or not the ```--resultBaseURL``` option needs to be set and to also include the bucket name. Without a domain and a bucket called ```results``` the resultsBaseURL will be ```--resultBaseURL --resultBaseURL=https://storage.googleapis.com/results```

### Extra options you should use
When you push to GCS there are a couple of extra configurations you should use.

By default the HAR file is bundled in the HTML, because if you run the HTML files locally on your machine, that's the only they can be loaded. But on GCS you want to separate the HAR and the HTML (it will save space). Do that by adding ```--html.fetchHARFiles```.

Then you want to make sure the HAR files is gzipped (to save even more space): ```--gzipHAR```

Screenshots are by default png but you probably want them to be jpg: ```--screenshot.type jpg```.

And then you should also make sure that all the result files (HTML/videos/screenshots) are removed from your local server and only exists on GCS. Add ```--gcs.removeLocalResult```.
