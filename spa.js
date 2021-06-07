module.exports = async function(context, commands) {
  commands.meta.setTitle('Test Grafana SPA');
  commands.meta.setDescription(
    'Test the first page, click the timepicker and then choose <b>Last 30 days</b> and measure that page.'
  );
  await commands.measure.start(
    'https://dashboard.sitespeed.io/d/000000064/drilldown?orgId=1',
    'pageTimingMetricsDefault'
  );
  await commands.click.byClassName('toolbar-button css-1t4b87h-toolbar-button');
  await commands.wait.byTime(3000);
  await commands.measure.start('pageTimingMetrics30Days');
  await commands.click.byXpathAndWait(
    '/html/body/grafana-app/div/div/react-container/div/div[1]/div[3]/div/div[1]/div/div/div[1]/div[2]/div[1]/div[2]/div[11]'
  );
  await commands.wait.byTime(5000);
  return commands.measure.stop();
};
