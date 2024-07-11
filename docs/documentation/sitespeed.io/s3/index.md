---
layout: default
title: Upload result to S3 or Digital Ocean's Spaces.
description: You can upload the HTML/videos to S3 or Digital Ocean's Spaces. Here's how to do that.
keywords: S3, spaces, do, digital ocean, aws, amazon, configure, sitespeed.io
author: Peter Hedenskog
nav: documentation
category: sitespeed.io
image: https://www.sitespeed.io/img/sitespeed-2.0-twitter.png
twitterdescription: Upload result to S3.
---
[Documentation]({{site.baseurl}}/documentation/sitespeed.io/) / S3

# S3
{:.no_toc}

* Lets place the TOC here
{:toc}

You can store the result HTML/images and videos at [Amazon S3](https://aws.amazon.com/s3/) (or S3 compliant storage). That's what we are using for [https://dashboard.sitespeed.io/](https://dashboard.sitespeed.io/). What's good about it is that it is cheap and you can easily control how long time you want to keep you files. And it is not too much work to setup.

## Setup a S3 bucket
To setup a bucket on S3 you need to have a Amazon account. 

* [Create one IAM User](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_users_create.html) and follow [the best practice guide](https://docs.aws.amazon.com/IAM/latest/UserGuide/best-practices.html) - you need a IAM user to get the **key** and **secret** to be able to upload the result from sitespeed.io.
* [Create a bucket](https://docs.aws.amazon.com/AmazonS3/latest/user-guide/create-bucket.html) - setup one bucket per server that runs tests (then you are sure there will be no collides and it will be easier when you want to remove tests).
* [Configure your bucket for static website hosting]( 
https://docs.aws.amazon.com/AmazonS3/latest/user-guide/static-website-hosting.html) - so that you can access the result pages and make sure you add a bucket policy (for access).
* [Add a lifecycle rule](https://docs.aws.amazon.com/AmazonS3/latest/user-guide/create-lifecycle.html) - you want to make sure you remove old result pages/videos/screenshots to save money.
* If you want to show screenshots/videos/use the meta data from S3 in Grafana, you need to make sure that your Grafana instance can access S3 through your browser by setting up correct [CORS](https://docs.aws.amazon.com/AmazonS3/latest/userguide/cors.html).

Here's an example for setting up CORS to give compare.sitespeed.io access rights to get HARs and other files.
 
```JSON
[
    {
        "AllowedHeaders": [],
        "AllowedMethods": [
            "GET"
        ],
        "AllowedOrigins": [
            "https://compare.sitespeed.io"
        ],
        "ExposeHeaders": []
    }
]

```

Do you need more help? First dive into the [AWS S3 docs](https://docs.aws.amazon.com/AmazonS3/latest/gsg/GetStartedWithS3.html) then if it doesn't help, [create an issue](https://github.com/sitespeedio/sitespeed.io/issues/new) and we can try to help you.

## sitespeed.io configuration
To push the metrics to S3 you need the **key**, the **secret** and your **bucketname**. You get the ```--s3.key``` and ```--s3.secret``` from your IAM User. The ```--s3.bucketname``` is the name you picked for your bucket.

Depending on the setup you sometimes want to set the S3 region (```--s3.region``` if you don't use the default one) and the [canned access control](https://docs.aws.amazon.com/AmazonS3/latest/dev/acl-overview.html#canned-acl)  ```--s3.acl``` of the uploaded files (you can setup the access control when you setup the bucket too).


### Extra configuration
You can also pass on all parameters that the official AWS JavaScript SDK uses.

#### Pass parameters to S3 upload
Extra params passed when you do the S3.upload ```--s3.params```. Checkout the [AWS upload property docs](https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#upload-property) for all properties.

Example - set expire to one year: 
```--s3.params.Expires=31536000```

#### Pass extra options when you create the S3 object
Extra options passed when you create the S3 object. Checkout the [S3 Object documentation](https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#constructor-property).

Example - lock to a specific API version
```--s3.options.apiVersion=2006-03-01``` 

## Using S3 as server

Running on S3 you should also setup a URL to your S3 instance(s). That way the annotation links in Graphite/InfluxDb will appear. You can then go from a result in Grafana to the actual HTML result. That is super useful when you want to understand a regression.

For the dashboard we have setup a domain *https://results.sitespeed.io* so when we run we add the following ```--resultBaseURL https://results.sitespeed.io```.

### Extra options you should use
When you push to S3 there are a couple of extra configurations you should use.

By default the HAR file is bundled in the HTML, because if you run the HTML files locally on your machine, that's the only they can be loaded. But on S3 you want to separate the HAR and the HTML (it will save space). Do that by adding ```--html.fetchHARFiles```.

Then you want to make sure the HAR files is gzipped (to save even more space): ```--gzipHAR```

Screenshots are by default png but you probably want them to be jpg: ```--screenshot.type jpg```.

And then you should also make sure that all the result files (HTML/videos/screenshots) are removed from your local server and only exists on S3. Add ```--s3.removeLocalResult```.

As a last thing you should also add `--copyLatestFilesToBase` that will make it possible to view latest screenshot and video in Grafana from S3.

# MinIO
If you want deploy the storage yourself you can use the Open Source [https://min.io](https://min.io). You can deploy that using Docker. You have an example on how you can set that up in [sitespeed.io online test](https://github.com/sitespeedio/onlinetest/blob/main/docker-compose.yml).

# Digital Ocean Spaces
[Digital Ocean Spaces](https://developers.digitalocean.com/documentation/spaces/#aws-s3-compatibility)

Digital Ocean is compatible with the S3 API, so all that is required after setting up your space and acquiring a key and secret is to modify the endpoint that the s3 results are passed to as shown below.

Make sure that your endpoint starts with http/https.

## JSON configuration file
 If the endpoint is not passed this will default to AWS's endpoint. You may safely exclude it for AWS integration. If you use a JSON configuration file you should make sure you add this to get S3 to work:

~~~javascript
{
  ...
  "resultBaseURL": "https://your.bucket.url",
  "gzipHAR": true,
  "html": {
    "fetchHARFiles": true
  },
  "s3": {
     "endpoint": "OPTIONALLY_YOUR_ENDPOINT_FOR_DO_OR_AWS",
     "key": "YOUR_KEY",
     "secret": "YOUR_SECRET",
     "bucketname": "YOUR_BUCKETNAME",
     "removeLocalResult": true
  },
  "screenshot": {
    "type": "jpg"
    }
  }
}
~~~