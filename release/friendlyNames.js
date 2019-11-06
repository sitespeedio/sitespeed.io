'use strict';

const friendly = require('../lib/support/friendlynames');

for (let key of Object.keys(friendly)) {
  for (let tool of Object.keys(friendly[key])) {
    for (let metric of Object.keys(friendly[key][tool])) {
      console.log(tool + '.' + metric);
    }
  }
}
