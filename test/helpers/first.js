'use strict';

var Bluebird = require('bluebird'),
  chai = require('chai'),
  chaiAsPromised = require('chai-as-promised');

chai.use(chaiAsPromised);

chai.should();

Bluebird.longStackTraces();
