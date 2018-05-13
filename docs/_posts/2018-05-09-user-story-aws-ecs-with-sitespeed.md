---
layout: default
title: sitespeed.io on AWS ECS
description: Sitespeed.io users lbod, TJ71 and Dolphsps show us how they are using sitespeed.io on the AWS ECS service.
authorimage: /img/robot-head.png
intro: Sitespeed.io users lbod, TJ71 and Dolphsps show us how they are using sitespeed.io on the AWS ECS service.
keywords: sitespeed.io, sitespeed, AWS, ECS
nav: blog
---

# Running Sitespeed on the AWS ECS Service

## Background

We're users of sitespeed (as well as minor part time committers) and we wanted to feedback to the rest of the community because we do love the software. But also because the developers and community have been so helpful to us we really had to.

In our company we were previously running sitespeed in the cloud on Azure but it was a very simple setup knowing it had a limited lifespan. A single VM, with extended storage and all the containers ran on the same machine using a docker-compose.yml file for services and linux cron jobs to run multiple sites. 4 containers in total (grafana, graphite, sitespeed and I'd added another for nginx doing reverse proxying which was more pain than worth). We also had to manage the VM ourselves, cleaning up containers, volumes, restarts, OS and software currency etc was also painful.

As a learning exercise in AWS we tried to build out a more scalable solution so we could scale concurrent runs of the sitespeed containers if needed. Previously we had so many cron jobs which ran their own site url files, with differing amounts of urls in them it made cron unmanageable (because we couldn't tell when jobs would finish we had to estimate the cron start time of the next jobs), meaning OS starvation. I've seen many different ways to manage this as well as queueing but the AWS ECS service (as well as EC2) are already scalable by default.

## Architecture

We created 2 ECS clusters, one for the web applications (graphite and grafana) and one for the sitespeed container(s).

Here's what I see the architecture ended up as:

![A diagram showing the sitespeed setup we used in AWS with ECS]({{site.baseurl}}/img/sitespeed-aws-ecs-architecture.jpg "AWS Sitespeed setup")
{: .img-thumbnail}

## ECS (Elastic Container Service)

ECS is the service AWS provide for docker container orchestration, they recently announced a 'serverless' version of this named Fargate which we haven't tried yet (there appears to be pros and cons considering sitespeed), at this moment in time it's still only in the `us-east-1` region.

ECS is conceptually split into 3 things

* Cluster - a template to scale EC2 instances which AWS task definitions run in.
* Task definition - a collection of container definitions
* Service - long running task definition(s)

Also worth noting there is an ECS agent [https://github.com/aws/amazon-ecs-agent](https://github.com/aws/amazon-ecs-agent) that runs on your ECS EC2 instances which are orchestrating your containers and you don't run docker commands directly. We've seen some limitations of the ECS agent when trying to do some docker things we needed because of it, however there were workarounds.

### Cluster

A cluster is essentially a template for 0 or more EC2 instances to run ECS task definitions in. EC2 instances are assigned to the clusters and scaling properties can be set/triggered in a few ways (such as OS level metric limits) but can also be automated.

Clusters can also have services, see below.

### Task definition

This is the main part of ECS. Multiple docker images are configured here, as well as AWS configuration for CPU/Memory, Networking modes, environment variables, docker run overrides etc. It's also very much like a template for creating containers, you can override most settings at run time. **What is important to know is that all containers launched from the same task definition can use docker links and named/shared volumes between them**.

##### Container overrides

You can override a task when you run it and one way is the command override you'll see in the AWS ECS web console. It's basically the entry point CMD passed to the docker container. It's messy to deal with the config here e.g. you type in a string for the entry point like

```
/start.sh,urls.txt,--config,config.json,--plugins.remove,html,--plugins.remove,screenshot,--s3.bucketname,bucketname,--s3.removeLocalResult,true ......
```

Unintentional spaces will break argument parsing.

### Services

This is a bit more abstract, it's for long running processes. A service can be assigned to a cluster to start a task definition (or more) and keep them started if it goes down. We decided we only needed it for the web apps cluster (grafana/graphite) because we only need one instance of each running and they should be able to network together..

## Wiring it all together

Because the task definitions on the webapps cluster and the sitespeed cluster can't speak to each other, we added another ELB (Elastic Load Balancer) so we could route traffic with an internal DNS between them. e.g. in our sitespeed `config.json` file we can use

```json
{
    "graphite": {
        "host": "our-internal-elb-hostname"
    etc.....
}
```

That meant we could set the graphite host name to that ELB internal dns name but it's way overkill and added an extra expense to the setup. There are 4 docker networking options in ECS (`bridge`, `host`, `none` and `awsvpc`) and possibly awsvpc solves this (getting rid of the expense of an ELB) but it needs more investigation.

### Volumes

We need persistent storage for both grafana and graphite so we used AWS EBS storage for this. You can create snapshots if needed for backup which is what we've setup. To get the volume mounted onto an instance you have to VM storage mount the volume on the EC2 instance at launch time.

In the ECS task definition you set volume mappings as you normally would for docker volumes, but the mount on the local system still has to be available before tasks (or the ECS agent) start. See below for config.

You need to be careful about cost with EBS too so keep it smaller and scale up if needed.

### Instance start up and scaling groups

We start our EC2 instances in ECS using EC2 scaling groups. The reason we do this is to control both the schedule of when instances are running and how to launch them.

EC2 scaling groups have launch configurations and these are ran on the instance when first created/launched. EC2 AMI instances are throw-away when terminated so you need a consistent way to do extra setup at creation time (worth noting reboots will not reload that config). You can set schedules on scaling groups, we scale up in the morning and scale down to zero at night to terminate the instances.

#### User data

In the launch configuration there's something called _User Data_, it's a scripting option to do that type of bootstrap or setup work. In general, this is a good place to start [https://docs.aws.amazon.com/AmazonECS/latest/developerguide/launch_container_instance.html](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/launch_container_instance.html).

We've added a lot to the 2 main launch config user data, the most bytes are for CloudWatch logging setup. In the sitespeed launch config we run an S3 sync command to a bucket so we can sync configuration for the sitepseed jobs onto the instance e.g.

```
aws s3 sync s3://bucketname/config /var/local/mount/dir/ --delete
```

i.e. these are the url files and config json for sitespeed jobs we want to run.

For the webaps cluster we have to run ECS commands to mount the EBS volume for grafana/graphite

```
aws ec2 attach-volume --volume-id xxxxxxxxxxxxxxxx ..
```

It's about bootstrapping or configuring more specific AWS configuration and you really do have to dig through the docs.

**Another reason is to assign the EC2 instance to the actual ECS cluster**

When an ECS instance is launched like this it has to be assigned to a cluster name you've setup otherwise it's assigned to a default cluster. We do it in the user data e.g.

```
echo ECS_CLUSTER=prod-sitespeed-cluster >> /etc/ecs/ecs.config
```

See [https://docs.aws.amazon.com/AmazonECS/latest/developerguide/ecs-agent-config.html](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/ecs-agent-config.html)

We actually have 6 cluster's in our setup, the extra 4 are dev and staging mirrors for the webapps and sitespeed clusters (prefixed cluster names with dev- and staging-), though they're always switched off.

## S3

We use S3 for loading config onto the containers as well as for viewing of the S3 reports.
We also use it for deployment and changes (using AWS Cloud Formation).

### Reports

Previously in Azure I'd written a simple web page which used an open source calendar widget so we could more easily navigate sites and dates of reports. It was a crude, slow and short term solution considering how it was implemented (nginx indexes returning as json over AJAX to list the site/dates folders, therefore multiple async requests) but it did allow users to browse reports more easily.

It looks something like this:

![An example screenshot of the custom report viewer used for reports.]({{site.baseurl}}/img/ecs-calendar-report-viewer.png "Screenshot of the calendar gui")
{: .img-thumbnail}

I experimented a few ways doing this in Lambda eventually settling on a realistic performant way i.e. writing out a static json file to S3 of the `[site/[dates]]` structure. This is the datasource loaded by the browser to generate the calendar events.

In ECS you don't actually need sitespeed S3 config for key/secret args (`--s3.key` and `--s3.secret`) if you give permission to the ECS IAM role to write to S3. It seems to be inherited from the environment and the S3 client library that sitespeed uses. You can configure a role on the bucket to allow ECS to write to S3 (or make it a bit/lot more securer).

### Config

S3 is used by AWS as default for some services loading configuration such as Cloud Formation templates.

As said above we store our url and config.json files here and we have a Lambda function listening to changes in these files to sync them onto the instances.

We're using Cloud Formation templates to manage changes to the infrastructure too. It's not relevant to sitespeed but it seems a good way to do deployments, you can review the changes as a changeset before deploying.

## What we learned and want to fix

We **want/have** to replace the internal ELB and think it'll save a lot on cost. When you're new to AWS like we were there's a huge amount of services you need to understand to get an efficient architecture.

What we've done is just one of many ways it could have been done and I think there's much more we can do to optimise it. Services like Batch and Lambda sounded possible running a container directly and 'serverless' but we wanted to ensure the task could collect stable metrics. I never saw any docs which made running a container like sitespeed.io serverless, with the resource requirements it has in a stable manner, make sense.

We actually warm up EC2 instances by launching a simple 3 url crawl not long after it starts so images are downloaded and a sitespeed container has run.

### dev/shm

Initially we couldn't set temp storage for the sitespeed container meaning we got OOM errors because of the 64 MB default in docker (for Chrome), there's an ECS launch config workaround for this but they recently announced API support. Currently we're doing this in the user data like this:

```
echo 'OPTIONS="${OPTIONS} --default-shm-size 1G"' >> /etc/sysconfig/docker
```

One of the issues reported is at [https://github.com/aws/amazon-ecs-agent/issues/787](https://github.com/aws/amazon-ecs-agent/issues/787) but you'll see at the end of there's a comment they announced support for it here [https://aws.amazon.com/about-aws/whats-new/2018/03/amazon-ecs-adds-support-for-shm-size-and-tmpfs-parameters/](https://aws.amazon.com/about-aws/whats-new/2018/03/amazon-ecs-adds-support-for-shm-size-and-tmpfs-parameters/) .

AWS is always very much a changing environment, I don't think API's break but they're always adding support for requests from the community.

### Connectivity

I spent a short time trying out `tc` and `throttle`. As said above there are 4 docker networks you can configure. I almost got `tc` working usinng the `host` network but after a few runs it seems it starved AWS traffic and eventually tasks stalled. A ticket was raised for support and they said they'd consider it.
If I could get the time I'd try filtering the IP's at `tc` level, I did see a doc of the core AWS internal IP's which have to be enabled but never bookmarked it.

With `throttle` I had the expected permissions issues but again didn't spend long enough to diagnose.

## **Lambda!!!**

I've intentionally left Lambda to the end. We hadn't considered it much till not long before we went "live". I was trying a workaround for what I thought was bug in sitespeed (S3 reports for different sites onto the same S3 bucket was overwriting files).

We wanted `bucket/[domain/[dates]]` similar to when you run locally so I switched to Lambda thinking it would solve it, from then on Lambda made more sense for several things we wanted to manage.

I see it like the glue between the AWS services and it's very flexible so can be consumed/emitted/reused in different ways. But it's not for everything such as stateful, long running or high concurrency things.

All the AWS services are exposed as API's in each language and made available to the functions so you can `require`, `import` etc in the Lambdas, you can call and interact with all these services.

We haven't figured out local development yet, it's definitely a `[TODO]` for us, mostly I'm testing the functions in the cloud using either the Lambda console test button or doing manual operations in the AWS console to generate real time events from other services. You can use Node.js 6 (as well as other languages Java, C#, Go and Python) so you can use a fair bit of ES6 to minimize the code.

The AWS web console IDE in Lambda (called Cloud 9) is quite feature rich too.

### Our Lambdas

Roughly the events, functions and AWS used APIs look like this:

![A diagram showing the Lambda functions we used for sitespeed in AWS with ECS]({{site.baseurl}}/img/ecs-lambda-calls-example.png "Lambda function calls")
{: .img-thumbnail}

From a sitespeed run point of view we have 3 core functions:

* Run sitespeed.io tasks `runTask`
* Update config files (sitespeed url files, config.json) `syncConfig`
* Write datasource for viewing site report/dates `writeTree`

#### `runTask`

This function listens to AWS Cloud Watch scheduled cron events. You can create the schedules in the AWS ECS web console but it's brittle and easy to make mistakes with overrides. It's more flexible to do it in Cloud Watch where you can call a Lambda function from the event. Creating a simplified API via the Lambda made much more sense in the end too (because you're creating an API in code). The function code is basically calling the [ECS RunTask service](https://docs.aws.amazon.com/AmazonECS/latest/APIReference/API_RunTask.html).

#### `syncConfig`

This function syncs any updated S3 url files or the config.json file onto the EC2 sitespeed.io instances when updated on S3. Firstly we setup a CloudWatch rule to listen to S3 updated and deleted files, this event is configured to execute the Lambda. The function code uses a filter on EC2 instances for running status and cluster name. It then runs an SSM command on those found instances [https://docs.aws.amazon.com/systems-manager/latest/APIReference/API_SendCommand.html](https://docs.aws.amazon.com/systems-manager/latest/APIReference/API_SendCommand.html) running an SSH command on the box, like above mentioned setup we did in the launch config user data `aws s3 sync s3://bucketname/config /var/local/mount/dir/ --delete`

#### `writeTree`

This function writes out a datasource json file to S3 for our custom calendar report widget to read. A CloudWatch rule listens to an ECS task stopped event and runs the Lambda function.

The function code uses `S3.listObjects` to recursively search sites/dates S3 paths. The request `params` has `Delimiter` and `Prefix` properties you can use to filter objects. On the objects returned you can use the `CommonPrefixes` property to do further filtering. I'm sure this can be optimized this further.

#### `backupStorage`

This function takes a snapshot of the EBS volumes we use for Graphite and Grafana. It's a weekly Cloud Event scheduled rule so we can backup/restore if needed. It's very useful if we ever need to roll back as you can take a snapshot at any time, we've not had a use for it yet thankfully.

---

Hopefully anything from this was of some use to you, best regards

/lbod, TJ71 and Dolphsps!
