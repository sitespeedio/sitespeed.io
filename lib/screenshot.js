var page = require('webpage').create(),
  address, output, w, h, agent, full, basicauth, auth;


if (phantom.args.length < 5 || phantom.args.length > 7) {
  console.log('Usage: screenshot.js URL filename width height user-agent full basic:auth');
  phantom.exit();
} else {
  address = phantom.args[0];
  output = phantom.args[1];
  w = phantom.args[2];
  h = phantom.args[3];
  agent = phantom.args[4];
  full = phantom.args[5];
  basicauth = phantom.args[6];

  if (basicauth) {
    auth = basicauth.split(':');
    page.settings.userName = auth[0];
    page.settings.password = auth[1];
  }


  page.viewportSize = {
    width: w,
    height: h
  };
  page.settings.userAgent = agent;
  page.open(address, function(status) {
    if (status !== 'success') {
      console.log('Unable to load the address!');
    } else {
      window.setTimeout(function() {

        if (full !== 'true') {
          page.clipRect = {
            left: 0,
            top: 0,
            width: w,
            height: h
          };
        }
        page.render(output);
        phantom.exit();
      }, 200);
    }
  });
}
