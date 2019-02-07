'use strict';
const fs = require('fs');
const { promisify } = require('util');
const readFile = promisify(fs.readFile);

module.exports = async options => {
  const scripts = [];
  for (let file of options._) {
    // We could promise all these in the future
    if (!file.startsWith('http')) {
      try {
        const code = await readFile(file);
        scripts.push({ name: file, code: code });
      } catch (e) {
        // do nada
      }
    }
  }
  return scripts;
};
