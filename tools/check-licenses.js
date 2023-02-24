#!/usr/bin/env node
/*eslint no-console: 0*/
import { init } from 'license-checker';

init(
  {
    start: '.'
  },
  function (error, json) {
    if (error) {
      console.error(error.message);
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
                  /LGPL/.test(license) ||
                  /MIT/.test(license) ||
                  /BSD/.test(license)
                )
            )
            .some(license => license.match(/GPL/))
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
