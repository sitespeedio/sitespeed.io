'use strict';

module.exports = function (httpCodes) {
  let data = '';
  for (let code of Object.keys(httpCodes)) {
    if (Number(code) > 399) {
      data += `${code}: ${httpCodes[code]} `;
    }
  }
  return data === '' ? '0' : data;
};
