// Mimics kramdown's "lone-line IAL applies to the previous block" rule.
// In kramdown, a paragraph that contains only `{: .class}` (or `{:#id}`,
// `{:attr="val"}`, etc.) attaches its attributes to the block that came
// just before it, and is itself dropped from the output.
//
// Example:
//   ![logo](url)
//   {: .img-thumbnail}
//   ->
//   <p class="img-thumbnail"><img alt="logo" src="url"></p>
//
// Our markdown source is preprocessed in eleventy.config.js to strip the
// kramdown-specific leading colon, so by the time this plugin runs the
// IAL paragraph contains a markdown-it-attrs-style payload, e.g.
//   `{.img-thumbnail}`  or  `{.note .note-info}`.
//
// The plugin scans the token stream after parsing and:
//   * detects paragraphs whose entire inline content is `{ ... }`
//   * parses the attribute payload (classes / id / key="value")
//   * merges those attributes into the most recent block-open token
//   * removes the IAL paragraph from the stream

const IAL_LINE = /^\{([^{}]+)\}$/;

function parseIAL(payload) {
  const out = { class: [], id: null, attrs: {} };
  // Tokenise on whitespace, but keep `key="..."` together.
  const re = /\S+="[^"]*"|\S+/g;
  const parts = payload.match(re) || [];
  for (const part of parts) {
    if (part.startsWith('.')) {
      out.class.push(part.slice(1));
    } else if (part.startsWith('#')) {
      out.id = part.slice(1);
    } else {
      const m = part.match(/^([^=]+)="(.*)"$/);
      if (m) {
        out.attrs[m[1]] = m[2];
      } else if (part.includes('=')) {
        const [k, v] = part.split('=');
        out.attrs[k] = v;
      } else {
        out.class.push(part);
      }
    }
  }
  return out;
}

function applyIAL(token, ial) {
  if (ial.class.length) {
    const existing = token.attrGet('class');
    const merged = existing
      ? `${existing} ${ial.class.join(' ')}`
      : ial.class.join(' ');
    token.attrSet('class', merged);
  }
  if (ial.id) token.attrSet('id', ial.id);
  for (const [k, v] of Object.entries(ial.attrs)) {
    token.attrSet(k, v);
  }
}

export default function kramdownBlockAttrs(md) {
  md.core.ruler.after('block', 'kramdown_block_attrs', (state) => {
    const tokens = state.tokens;

    // Walk forwards so indices don't get confusing when we splice.
    let i = 0;
    while (i < tokens.length) {
      const close = tokens[i];
      if (close.type === 'paragraph_close' && i >= 2) {
        const inline = tokens[i - 1];
        const open = tokens[i - 2];
        if (
          inline.type === 'inline' &&
          open.type === 'paragraph_open' &&
          IAL_LINE.test(inline.content.trim())
        ) {
          const payload = inline.content.trim().match(IAL_LINE)[1];
          const ial = parseIAL(payload);

          // Find the preceding block-open token to attach to.
          // Skip any closing tokens (every block ends with a *_close).
          let j = i - 3;
          while (j >= 0 && tokens[j].nesting !== 1) j--;
          if (j >= 0) {
            applyIAL(tokens[j], ial);
            // Remove the three tokens of the IAL paragraph itself.
            tokens.splice(i - 2, 3);
            i -= 2;
            continue;
          }
        }
      }
      i++;
    }
  });
}
