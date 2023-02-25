import { connect } from 'node:net';
import { Sender } from './sender.js';

export class GraphiteSender extends Sender {
  get facility() {
    return 'Graphite';
  }

  bulk(data) {
    this.log(data);

    return new Promise((resolve, reject) => {
      const socket = connect(this.port, this.host, () => {
        socket.write(data);
        socket.end();
        resolve();
      });
      socket.on('error', reject);
    });
  }
}
