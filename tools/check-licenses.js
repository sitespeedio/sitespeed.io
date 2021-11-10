#!/usr/bin/env node
/*eslint no-console: 0*/

'use strict';

const checker = require('license-checker');

checker.init(
  {
    start: '.'
  },
  function (err, json) {
    if (err) {
      console.error(err.message);
      process.exit(1);
    } else {
      const incompatibleDependencies = Object.keys(json).filter(packageName => {
        let licenses = json[packageName].licenses;

        if (!Array.isArray(licenses)) licenses = [licenses];

        if (
          licenses
            .filter(
              license =>
                !(
                  license.match(/LGPL/) ||
                  license.match(/MIT/) ||
                  license.match(/BSD/)
                )
            )
            .find(license => license.match(/GPL/))
        )
          return packageName;
      });

      if (incompatibleDependencies.length > 0) {
        console.error(
          'Found packages with incompatible license: ' +
            JSON.stringify(incompatibleDependencies)
        );
        process.exit(1);
      } else {
        console.log(
          'All is well! No packages with an incompatible license found.'
        );
      }
    }
  }
);
