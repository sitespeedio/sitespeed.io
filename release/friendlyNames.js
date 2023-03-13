import friendly from '../lib/support/friendlynames.js';

for (let key of Object.keys(friendly)) {
  for (let tool of Object.keys(friendly[key])) {
    for (let metric of Object.keys(friendly[key][tool])) {
      console.log(tool + '.' + metric);
    }
  }
}
