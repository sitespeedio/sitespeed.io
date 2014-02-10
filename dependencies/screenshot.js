var page = require('webpage').create(),
    address, output, size, w, h, agent, full, cookie;
var resourceWait  = 1e3,
    maxRenderWait = 1e4,
    count         = 0,
    renderTimeout;

if (phantom.args.length < 5 || phantom.args.length > 7) {
    console.log('Usage: screenshot.js URL filename width height user-agent full cookie');
    phantom.exit();
} else {
    address = phantom.args[0];
    output = phantom.args[1];
    w = phantom.args[2];
    h = phantom.args[3];
    agent = phantom.args[4];
    full = phantom.args[5];
    cookie_str = phantom.args[6];
    try{
      cookie = JSON.parse(cookie_str,function(k, v){
        return v;
      });
    } catch (e) {
      console.log('Error - '+ e);
      cookie = undefined;
    }
    if(cookie != undefined) phantom.addCookie(cookie);

    function doClip() {
        if (full != 'true')
                page.clipRect = { left: 0, top: 0, width: w, height: h };
			page.render(output);
			phantom.exit();
    }

    page.onResourceRequested = function (req) {
        count += 1;
        clearTimeout(renderTimeout);
    };
 
    page.onResourceReceived = function (res) {
        if (!res.stage || res.stage === 'end') {
            count -= 1;
	    if (count === 0) {
	        renderTimeout = setTimeout(doClip, resourceWait);
	    }
	}
    }; 
    page.viewportSize = { width: w , height: h};
    page.settings.userAgent = agent;  
    page.open(address, function (status) {
	    if (status !== 'success') {
		console.log('Unable to load the address!');
	    } else {
		window.setTimeout(function (){
            	doClip();
        	}, maxRenderWait);
	    }
	});
}
