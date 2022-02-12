'use strict';

const fs = require('fs'),
  log = require('intel').getLogger('sitespeedio.plugin.budget'),
  path = require('path');

exports.writeJson = function (results, dir) {
  const file = path.join(dir, 'budgetResult.json');
  log.info('Write budget to %s', path.resolve(file));
  fs.writeFileSync(file, JSON.stringify(results, null, 2));
};
