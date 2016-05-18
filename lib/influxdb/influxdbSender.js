/**
 * Sitespeed.io - How speedy is your site? (http://www.sitespeed.io)
 * Copyright (c) 2014, Peter Hedenskog, Tobias Lidskog
 * and other contributors
 * Released under the Apache 2.0 License
 */
'use strict';
var util = require('../util/util'),
  winston = require('winston');

function InfluxdbSender(host, port, config) {
  this.host = host;
  this.port = port;
  this.config = config;
  this.influxdbDatabase = this.config.influxdbDatabase;
  this.log = winston.loggers.get('sitespeed.io');
}

InfluxdbSender.prototype.send = function(data, cb) {

  var self = this;

  this.log.verbose('Send the following keys to InfluxDB:', data);

  var influx_url='http://' + self.host + ':' + self.port + '/write';

var request = require('request');


request({
    url: influx_url, 
    qs: { db: this.influxdbDatabase, precision: 's' }, 
    method: 'POST',
    headers: {
        'Content-Type': 'text/plain',
    },
    body: data
}, function(error, response, body){
    if(error) {
        console.log(error);
    } else {
        console.log(response.statusCode, body);
    }
});


}
module.exports = InfluxdbSender;
