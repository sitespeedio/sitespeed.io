export function addOptions(yargs) {
  yargs
    .option('rsync.host', {
      describe: 'The host.',
      group: 'rsync'
    })
    .option('rsync.destinationPath', {
      describe:
        'The destination path on the remote server where the files will be copied.',
      group: 'rsync'
    })
    .option('rsync.port', {
      default: 22,
      describe: 'The port for ssh when sending the result to another server.',
      group: 'rsync'
    })
    .option('rsync.username', {
      describe:
        'The username. Use username/password or username/privateKey/pem.',
      group: 'rsync'
    })
    .option('rsync.password', {
      describe:
        'The password if you do not use a pem file. Requires sshpass on PATH.',
      group: 'rsync'
    })
    .option('rsync.privateKey', {
      describe: 'Path to the pem file.',
      group: 'rsync'
    })
    .option('rsync.passphrase', {
      describe:
        'The passphrase for the pem file. The rsync plugin cannot supply this non-interactively; load the key into ssh-agent before running.',
      group: 'rsync'
    })
    .option('rsync.removeLocalResult', {
      default: true,
      describe:
        'Remove the files locally when the files has been copied to the other server.',
      group: 'rsync'
    });
}
