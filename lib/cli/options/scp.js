export function addOptions(yargs) {
  yargs
    .option('scp.host', {
      describe: 'The host.',
      group: 'scp'
    })
    .option('scp.destinationPath', {
      describe:
        'The destination path on the remote server where the files will be copied.',
      group: 'scp'
    })
    .option('scp.port', {
      default: 22,
      describe: 'The port for ssh when scp the result to another server.',
      group: 'scp'
    })
    .option('scp.username', {
      describe:
        'The username. Use username/password or username/privateKey/pem.',
      group: 'scp'
    })
    .option('scp.password', {
      describe: 'The password if you do not use a pem file.',
      group: 'scp'
    })
    .option('scp.privateKey', {
      describe: 'Path to the pem file.',
      group: 'scp'
    })
    .option('scp.passphrase', {
      describe: 'The passphrase for the pem file.',
      group: 'scp'
    })
    .option('scp.removeLocalResult', {
      default: true,
      describe:
        'Remove the files locally when the files has been copied to the other server.',
      group: 'scp'
    });
}
