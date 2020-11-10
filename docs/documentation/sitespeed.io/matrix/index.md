---
layout: default
title: Send messages to Matrix.
description: You can send budget result and errors directly to your Matrix client.
keywords: matrix, elementm messages.
nav: documentation
category: sitespeed.io
image: https://www.sitespeed.io/img/sitespeed-2.0-twitter.png
twitterdescription:
---

[Documentation]({{site.baseurl}}/documentation/sitespeed.io/) / Matrix

# Matrix
{:.no_toc}

* Lets place the TOC here
{:toc}

Send messages to [Matrix](https://matrix.org) [clients](https://matrix.org/clients/) (an open network for secure, decentralized communication). 

With the current version you can send two types of messages: Messages about the [performance budget](/documentation/sitespeed.io/performance-budget/) failing or passing and error messages.


## Configuration

To send messages to Matrix you need to setup  `--matrix.host`, `--matrix.accessToken` and `--matrix.room `. The *host* is you matrix server host, the **accessToken** is the access token for your user (that you can get from using the [Matrix client API](https://matrix.org/docs/guides/client-server-api)) and the **room** is the default room where sitespeed.io will send the messages. 

You can also choose what kind of messages you want to send with `--matrix.messages`. Default is sending both **error** and **budget** messages. If you want to send them to different rooms you can do that with `--matrix.rooms` that route messages to specific rooms. It's easiest to setup Matrix using a configuration file, this is a full example:

~~~json
{
"matrix": {
    "host": "myhost.com",
    "room": "THE_DEFAULT_ROOM",
    "accessToken": "THEVERYLONGTOKEN",
    "rooms": {
      "budget": "THE_ROOM_FOR_BUDGET_MESSAGES",
      "error": "THE_ROOM_FOR_ERROR_MESSAGES"
    }
  }
}
~~~

## Errors

Catching errors makes it easier for you to keep track that your tests is working.

![Example of an error sent to Matrix]({{site.baseurl}}/img/matrix-error.png)
{: .img-thumbnail-center}

## Budget

You will get messages about pages that fully pass your budget:

![Example of the budget passing message]({{site.baseurl}}/img/matrix-budget-passed.png)
{: .img-thumbnail-center}


And pages that fails your budget:

![Example of the budget failing message]({{site.baseurl}}/img/matrix-budget-failing.png)
{: .img-thumbnail-center}
