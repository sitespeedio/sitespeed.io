var page = require('webpage').create(),
    address, output, size, w, h, agent;


if (phantom.args.length < 4 || phantom.args.length > 5) {
    console.log('Usage: rasterize.js URL filename');
    phantom.exit();
} else {
    address = phantom.args[0];
    output = phantom.args[1];
    w = phantom.args[2];
    h = phantom.args[3];
    agent = phantom.args[4];
       	
    page.viewportSize = { width: w , height: h};
    page.settings.userAgent = agent;  
    page.open(address, function (status) {
	    if (status !== 'success') {
		console.log('Unable to load the address!');
	    } else {
		window.setTimeout(function () {
			page.clipRect = { left: 0, top: 0, width: w, height: h };
			page.render(output);
			phantom.exit();
		    }, 200);
	    }
	});
}