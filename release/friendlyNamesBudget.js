'use strict';

const friendly = require('../lib/support/friendlynames');

console.log('{');
console.log(' "budget": {');
for (let key of Object.keys(friendly)) {
  for (let tool of Object.keys(friendly[key])) {
    console.log('   "' + tool + '": {');
    for (let metric of Object.keys(friendly[key][tool])) {
      console.log('         "' + metric + '": limit,');
    }
    console.log('    },');
  }
}
console.log(' }');
console.log('}');
