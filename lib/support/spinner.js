const ON = '●';
const OFF = ' ';
const BLINK_INTERVAL_MS = 500;

class Spinner {
  constructor({ text = '', isSilent = false, stream = process.stderr } = {}) {
    this.text = text;
    this.color = '';
    this.isSilent = isSilent;
    this.stream = stream;
    this.isTTY = !isSilent && Boolean(stream.isTTY);
    this.on = true;
    this.intervalId = undefined;
    this.lastLineLength = 0;
  }

  start() {
    if (this.isSilent) return this;
    if (this.isTTY) {
      this.intervalId = setInterval(() => this._render(), BLINK_INTERVAL_MS);
      this._render();
    } else {
      this.stream.write(this.text + '\n');
    }
    return this;
  }

  _render() {
    const dot = this.on ? ON : OFF;
    this.on = !this.on;
    const line = `${dot} ${this.text}`;
    const padding = ' '.repeat(Math.max(0, this.lastLineLength - line.length));
    this.stream.write('\r' + line + padding);
    this.lastLineLength = line.length;
  }

  _stop(symbol, finalText) {
    if (this.isSilent) return;
    if (this.intervalId !== undefined) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
    }
    if (this.isTTY) {
      this.stream.write('\r' + ' '.repeat(this.lastLineLength) + '\r');
    }
    this.stream.write(`${symbol} ${finalText ?? this.text}\n`);
  }

  succeed(text) {
    this._stop('✔', text);
  }

  fail(text) {
    this._stop('✖', text);
  }
}

export default function ora(options) {
  return new Spinner(options);
}
