# Goal
My goal was to measure web performance automatically every 2 hours and send the data to Grafana Cloud (a paid Grafana service to store your data) and then visualize them in our free Grafana Dashboards.

The stack required:

* AWS EC2
* AWS Lambda
* AWS CloudWatch
* Grafana Cloud
* Grafana Dashboards

The final data flow is like this:

 1. CloudWatch event rule triggers a lambda function `start_instances` every two hours (e.g. 10:00 am)
 2. The Lambda function starts two EC2 instances 
    * Instance A for running sitespeed.io meausurements 
    * Instance B for carbon-relay-ng (to connect to Grafana Cloud)
 3. instance A runs sitespeed.io tests in a docker container automatically **45 seconds after server spinup**
    * sitespeed urls config include multiple endpoints of our production application
    * sitespeed graphite config contains config of the carbon-relay-ng server (instance B)
4. when test is done, sitespeed sends data to carbon-relay-ng instance (Instance B)
5. carbon-relay-ng instance sends data to Grafana Cloud
6. Dashboards have access to Grafana Cloud and poll data when visited

This is basically what we will be doing in this tutorial.