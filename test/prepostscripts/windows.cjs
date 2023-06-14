module.exports = async function(context, commands) {
	
	// We fetch the selenium webdriver from context
	const webdriver = context.selenium.webdriver;
	const driver = context.selenium.driver;	
		
  try {

    await commands.measure.start('homepage_trial');

	// Navigate to a URL
    await commands.navigate('https://www.emirates.com/ae/english/');

    await commands.measure.stop();
	
   await commands.wait.byTime(2000)
   
   await commands.measure.start('click_on_accept_button');
   await commands.click.byXpathAndWait('//*[@id="onetrust-accept-btns-handlers"]')
   await commands.measure.stop();

  } catch (e) {
  	
	commands.screenshot.take('error_screenshot')	
	
    throw e;
  }
};