export function addOptions(yargs) {
  yargs
    .option('api.key', {
      describe: 'The API key to use.',
      group: 'API'
    })
    .option('api.action', {
      describe:
        'The type of API call you want to do: You get add a test and wait for the result, just add a test or get the result. To get the result, make sure you add the id using --api.id',
      default: 'addAndGetResult',
      choices: ['add', 'addAndGetResult', 'get'],
      group: 'API'
    })
    .option('api.hostname', {
      describe: 'The hostname of the API server.',
      group: 'API'
    })
    .option('api.location', {
      describe: 'The location of the test runner that run the test.',
      group: 'API'
    })
    .option('api.silent', {
      describe:
        'Set to true if you do not want to log anything from the communication',
      default: false,
      type: 'boolean',
      group: 'API'
    })
    .option('api.port', {
      describe: 'The port for the API',
      default: 3000,
      group: 'API'
    })
    .option('api.id', {
      describe:
        'The id of the test. Use it when you want to get the test result.',
      type: 'string',
      group: 'API'
    })
    .option('api.label', {
      describe: 'Add a label to your test.',
      type: 'string',
      group: 'API'
    })
    .option('api.priority', {
      type: 'integer',
      describe: 'The priority of the test. Highest priority is 1.',
      group: 'API'
    })
    .option('api.json', {
      describe: 'Output the result as JSON.',
      group: 'API'
    });
}
