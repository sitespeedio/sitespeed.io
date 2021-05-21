'use strict';

class Content {
  constructor(style) {
    this.style = style;
  }

  getLink(url, name) {
    switch (this.style) {
      case 'html':
        return `<a href="${url}">${name ? name : url}</a>`;
      case 'markdown':
        return `[${name ? name : url}](${url})`;
      default:
        return url;
    }
  }

  getHeading(text) {
    switch (this.style) {
      case 'html':
        return `<h1>${text}</h1>`;
      case 'markdown':
        return `# ${text}`;
      default:
        return text;
    }
  }

  getImage(url, altText) {
    switch (this.style) {
      case 'html':
        return `<img src="${url}"></img>`;
      case 'markdown':
        return `![${altText}](${url})`;
      default:
        return url;
    }
  }

  getHR() {
    switch (this.style) {
      case 'html':
        return `<hr>`;
      case 'markdown':
        return `---`;
      default:
        return '';
    }
  }
}

module.exports = Content;
