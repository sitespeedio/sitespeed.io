const axe = require('axe-core').source;

module.exports = async function runAxe(context) {
  // Insert the axe source
  await context.selenium.driver.executeScript(axe);

  const runOptions = context.options.axe.run
    ? structuredClone(context.options.axe.run)
    : {};
  const configureOptions = context.options.axe
    ? structuredClone(context.options.axe)
    : {};
  delete configureOptions.run;

  if (Object.keys(configureOptions).length > 0) {
    context.log.info('Configure AXE with %j', configureOptions);
  }
  await context.selenium.driver.executeScript(
    `axe.configure(${JSON.stringify(configureOptions)});`,
    'CONFIGURE_AXE'
  );

  if (runOptions) {
    context.log.info('Run AXE with run options %j', runOptions);
  }

  // Get the result from axe
  try {
    const result = await context.selenium.driver.executeAsyncScript(
      `window.axe.run(${JSON.stringify(
        runOptions
      )}).then(arguments[arguments.length - 1]);`,
      'RUNNING_AXE'
    );
    // Use the extras field in Browsertime and pass on the result
    context.result.at(-1).extras.axe = result;
  } catch (error) {
    context.log.error(
      'Could not run the AXE script, no AXE information collected',
      error
    );
  }
};
