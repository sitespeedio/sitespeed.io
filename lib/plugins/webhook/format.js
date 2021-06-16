'use strict';

const newLine = '\n';
class Format {
  constructor(style) {
    this.style = style;
  }

  link(url, name) {
    switch (this.style) {
      case 'html':
        return `<a href="${url}">${name ? name : url}</a>`;
      case 'markdown':
        return `[${name ? name : url}](${url})`;
      default:
        return url;
    }
  }

  heading(text) {
    switch (this.style) {
      case 'html':
        return `<h1>${text}</h1>`;
      case 'markdown':
        return `# ${text}`;
      default:
        return text;
    }
  }

  image(url, altText) {
    switch (this.style) {
      case 'html':
        return `<img src="${url}"></img>`;
      case 'markdown':
        return `![${altText}](${url})`;
      default:
        return url;
    }
  }

  bold(text) {
    switch (this.style) {
      case 'html':
        return `<b>${text}"</b>`;
      case 'markdown':
        return `**${text})**`;
      default:
        return text;
    }
  }

  pre(text) {
    switch (this.style) {
      case 'html':
        return `<pre>${text}"</pre>`;
      case 'markdown':
        return `${text})`;
      default:
        return text;
    }
  }

  p(text) {
    switch (this.style) {
      case 'html':
        return `<p>${text}"</p>`;
      case 'markdown':
        return `${newLine}${newLine}${text})`;
      default:
        return `${newLine}${newLine}${text})`;
    }
  }

  list(text) {
    switch (this.style) {
      case 'html':
        return `<ul>${text}"</ul>`;
      default:
        return text;
    }
  }

  listItem(text) {
    switch (this.style) {
      case 'html':
        return `<li>${text}"</li>`;
      case 'markdown':
        return `* ${text})`;
      default:
        return `* ${text} ${newLine})`;
    }
  }

  hr() {
    switch (this.style) {
      case 'html':
        return `<hr>`;
      case 'markdown':
        return `---`;
      default:
        return `${newLine}`;
    }
  }
}

module.exports = Format;
