const axe = require('axe-core').source;

module.exports = async function (context) {
  // Insert the axe source
  await context.selenium.driver.executeScript(axe);

  // Only configure if we have more keys thhan axe.enable
  if (context.options.axe && Object.keys(context.options.axe).length > 1) {
    await context.selenium.driver.executeScript(
      'axe.configure(' + JSON.stringify(context.options.axe) + ');',
      'CONFIGURE_AXE'
    );
  }

  // Get the result from axe
  try {
    const result = await context.selenium.driver.executeAsyncScript(
      'window.axe.run().then(arguments[arguments.length - 1]);',
      'RUNNING_AXE'
    );
    // Use the extras field in Browsertime and pass on the result
    context.result[context.result.length - 1].extras.axe = result;
  } catch (e) {
    context.log.error(
      'Could not run the AXE script, no AXE information collected',
      e
    );
  }
};
