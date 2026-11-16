export function addOptions(yargs) {
  yargs.option('webhook.url', {
    describe:
      'POST a JSON summary of the run (result URL, Google Web Vitals per page, budget result and errors) to this URL when the run is finished.',
    group: 'Webhook'
  });
}
