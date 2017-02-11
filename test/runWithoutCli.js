const sitespeed = require('../lib/sitespeed');
const urls = ['https://www.sitespeed.io/'];

function run() {

    sitespeed.run({ urls, browsertime: {iterations: 1} })
	.then((results) => {
		if (results.error) {
		    throw new Error(results.error);
		}
	    })
	.catch((err) => {
		console.error(err);
		process.exit(1);
	    });
}

run();