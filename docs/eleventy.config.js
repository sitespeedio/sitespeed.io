import markdownIt from 'markdown-it';
import markdownItAnchor from 'markdown-it-anchor';
import markdownItAttrs from 'markdown-it-attrs';
import markdownItTocDoneRight from 'markdown-it-toc-done-right';
import { minify } from 'html-minifier-terser';
import { transform as lightningcssTransform } from 'lightningcss';
import { eleventyImageTransformPlugin } from '@11ty/eleventy-img';
import syntaxHighlight from '@11ty/eleventy-plugin-syntaxhighlight';
import fsp from 'node:fs/promises';
import path from 'node:path';

import kramdownBlockAttrs from './_lib/kramdown-block-attrs.js';

const SITE_URL = 'https://www.sitespeed.io';

export default function (eleventyConfig) {
  // ---- Markdown --------------------------------------------------------
  // Keep parity with the kramdown-rendered Jekyll output:
  //  * markdown-it-attrs handles inline IAL  (`...{.class}` on the same line)
  //  * kramdownBlockAttrs is a small custom plugin that mimics kramdown's
  //    "lone-line IAL applies to the previous block" behaviour
  //    (`{: .class}` / `{.class}` sitting on its own line)
  //  * markdown-it-toc-done-right replaces a `[[toc]]` marker with a TOC
  //  * markdown-it-anchor adds id="..." to headings so the TOC links work
  const slugify = (s) =>
    String(s)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

  const md = markdownIt({ html: true, linkify: false, typographer: false })
    .use(markdownItAttrs, {
      leftDelimiter: '{',
      rightDelimiter: '}',
      allowedAttributes: []
    })
    .use(kramdownBlockAttrs)
    .use(markdownItAnchor, {
      slugify,
      level: [2, 3, 4],
      permalink: markdownItAnchor.permalink.linkInsideHeader({
        symbol: '#',
        placement: 'after',
        class: 'anchor',
        ariaHidden: true
      })
    })
    .use(markdownItTocDoneRight, {
      placeholder: '\\[\\[toc\\]\\]',
      listType: 'ul',
      slugify
    });

  eleventyConfig.setLibrary('md', md);

  // Server-side syntax highlighting via Prism. Replaces the runtime
  // prism-1.15.js + autoloader. The plugin amends our markdown-it instance
  // (registered via setLibrary above) so triple-backtick code fences get
  // tokenised at build time. The CSS theme is still served from
  // /css/prism-1.15.css and uses the standard Prism class names.
  eleventyConfig.addPlugin(syntaxHighlight);

  // Eleventy 3 defaults to dynamicPartials: true (the LiquidJS default),
  // which requires quoted include paths. Jekyll/legacy Liquid uses
  // unquoted paths. Turn dynamicPartials off so we can keep the Jekyll
  // syntax: `{% include version/foo.txt %}` and `{% include header.html %}`.
  // jekyllInclude turns on Jekyll-style key=value include parameters
  // (we don't currently rely on these but the option is harmless).
  eleventyConfig.setLiquidOptions({
    dynamicPartials: false,
    jekyllInclude: true,
    strictFilters: false,
    strictVariables: false
  });

  // ---- Source preprocessor ---------------------------------------------
  // Translates kramdown's IAL syntax (`{: .class}`, `{:.class}`,
  // `{:attr="val"}`, `{:toc}`) into syntax our markdown-it pipeline
  // understands, before markdown is parsed. Keeps the .md sources untouched.
  function shimKramdown(content) {
    return content
      .replace(/^[ \t]*\{:toc\}[ \t]*$/gm, '[[toc]]')
      .replace(/\{:\s*([^}]+?)\s*\}/g, '{$1}');
  }

  eleventyConfig.addPreprocessor('kramdown-shim', 'md', (data, content) =>
    shimKramdown(content)
  );

  // ---- Filters ---------------------------------------------------------
  // LiquidJS already covers truncate / replace / strip_html / escape / etc.
  // We only register filters that don't exist (markdownify) or that we
  // want to behave like Jekyll's strftime (date).
  eleventyConfig.addLiquidFilter('date', (date, format) => {
    const d = date instanceof Date ? date : new Date(date);
    if (Number.isNaN(d.getTime())) return '';
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const map = {
      '%Y': String(d.getUTCFullYear()),
      '%m': String(d.getUTCMonth() + 1).padStart(2, '0'),
      '%d': String(d.getUTCDate()).padStart(2, '0'),
      '%H': String(d.getUTCHours()).padStart(2, '0'),
      '%M': String(d.getUTCMinutes()).padStart(2, '0'),
      '%B': months[d.getUTCMonth()]
    };
    if (!format) return d.toISOString();
    return format.replace(/%[YmdHMB]/g, (m) => map[m] ?? m);
  });

  eleventyConfig.addLiquidFilter('markdownify', (str) => {
    if (!str) return '';
    return md.render(shimKramdown(String(str)));
  });

  // jsonify renders to a compact JSON literal, matching Jekyll.
  eleventyConfig.addLiquidFilter('jsonify', (value) => JSON.stringify(value));

  // ---- Shortcodes ------------------------------------------------------
  // Jekyll's `{% include_relative path %}` doesn't exist in LiquidJS.
  // We register it under the same name so existing call-sites keep
  // working, with one small difference: Liquid requires the path to be
  // a quoted string. The five files using it have been updated.
  eleventyConfig.addLiquidShortcode('include_relative', async function (filename) {
    const inputPath = this?.page?.inputPath;
    if (!inputPath) return '';
    const dir = path.dirname(inputPath);
    const fullPath = path.resolve(dir, filename);
    return await fsp.readFile(fullPath, 'utf8');
  });

  // ---- Bundles ---------------------------------------------------------
  // Eleventy 3's built-in bundle. Each template can contribute CSS via
  // `{% css %}…{% endcss %}` and the layout emits the gathered, minified
  // bundle inline in <style>. Lightning CSS does the minification —
  // significantly smaller and faster than html-minifier-terser's CSS
  // pass, and handles modern syntax that the older minifier misparses.
  eleventyConfig.addBundle('css', {
    transforms: [
      function (content) {
        const out = lightningcssTransform({
          filename: 'bundle.css',
          code: Buffer.from(content),
          minify: true,
          // Reasonable browserslist baseline: covers anything not in
          // a museum. Tighten/loosen if you need to support older.
          targets: { chrome: 100 << 16, firefox: 100 << 16, safari: 15 << 16 }
        });
        return out.code.toString();
      }
    ]
  });

  // ---- Images ----------------------------------------------------------
  // Scan rendered HTML for <img> elements that point at local images and
  // rewrite them as <picture> with AVIF + WebP + original-format sources.
  // Adds intrinsic width/height where missing to prevent layout shift,
  // adds loading="lazy" / decoding="async" by default, and writes the
  // optimised assets into _site/img/_optimized/.
  //
  // alt='' is a safety net: the plugin throws on missing `alt` and with
  // failOnError:false the throw leaves the <img> in a half-rewritten state
  // (its src normalised but no <picture> wrapper). Defaulting alt to ''
  // means missing-alt sources still get optimised — the source files
  // should be fixed separately for accessibility.
  eleventyConfig.addPlugin(eleventyImageTransformPlugin, {
    extensions: 'html',
    formats: ['avif', 'webp', 'auto'],
    widths: ['auto'],
    defaultAttributes: {
      loading: 'lazy',
      decoding: 'async',
      alt: ''
    },
    urlPath: '/img/_optimized/',
    outputDir: '_site/img/_optimized/',
    failOnError: false,
    // For multi-width images (the ones using `eleventy:widths`), set the
    // <img> width/height attributes to the smallest variant's intrinsic
    // size — that's the size the image actually occupies in the layout.
    // Defaulting to "largest" lets a HiDPI variant blow up the layout
    // (e.g. team.png becoming 1000x865 in a 500-wide column). Single-
    // variant images (the default `widths: ['auto']`) are unaffected
    // because smallest = largest.
    htmlOptions: {
      fallback: 'smallest'
    }
  });

  // ---- Pass-through ----------------------------------------------------
  // Everything that isn't a template needs to land in _site/ as-is.
  for (const dir of [
    'img',
    'feed',
    'logo',
    '.well-known',
    'testcases'
  ]) {
    eleventyConfig.addPassthroughCopy(dir);
  }
  for (const file of [
    '_headers',
    '_redirects',
    'favicon.ico',
    'robots.txt',
    'google0c83e3facf54325f.html',
    'simple-jekyll-search.min.js',
    'blank.html'
  ]) {
    eleventyConfig.addPassthroughCopy(file);
  }

  // The scripting class API reference is auto-generated by Browsertime's
  // jsdoc step into this directory. The .eleventyignore keeps Eleventy
  // from rendering the .html files through Liquid; this passthrough
  // copies them (and their supporting fonts/scripts/styles/data) into
  // _site as-is so the jsdoc-themed pages keep working.
  eleventyConfig.addPassthroughCopy(
    'documentation/sitespeed.io/scripting/*.html'
  );
  eleventyConfig.addPassthroughCopy(
    'documentation/sitespeed.io/scripting/fonts'
  );
  eleventyConfig.addPassthroughCopy(
    'documentation/sitespeed.io/scripting/scripts'
  );
  eleventyConfig.addPassthroughCopy(
    'documentation/sitespeed.io/scripting/styles'
  );
  eleventyConfig.addPassthroughCopy(
    'documentation/sitespeed.io/scripting/data'
  );

  // ---- Collections -----------------------------------------------------
  // Mirror Jekyll's `_posts` directory into a posts collection. Posts
  // are sorted newest-first; their permalinks are set in
  // `_posts/_posts.11tydata.js` to strip the YYYY-MM-DD- prefix and
  // produce `/<slug>/`, matching the Jekyll `permalink: /:title/` config.
  eleventyConfig.addCollection('posts', (api) =>
    api
      .getFilteredByGlob('_posts/*.md')
      .sort((a, b) => b.date - a.date)
  );

  // ---- HTML minification ----------------------------------------------
  // Replaces the Jekyll `compress` layout. Runs only on .html output so
  // we don't accidentally touch the XML / JSON files. CSS minification
  // is delegated to Lightning CSS (in the bundle transform), so we can
  // turn it off here. If a page fails to minify (typically because the
  // rendered HTML contains a stray `<` that the parser refuses), fall
  // back to the unminified output and log a warning.
  eleventyConfig.addTransform('html-minify', async function (content) {
    if (!this.page.outputPath || !this.page.outputPath.endsWith('.html')) {
      return content;
    }
    try {
      return await minify(content, {
        collapseWhitespace: true,
        conservativeCollapse: true,
        removeComments: true,
        minifyCSS: false,
        minifyJS: true
      });
    } catch (err) {
      console.warn(
        `[html-minify] skipped ${this.page.outputPath}: ${err.message}`
      );
      return content;
    }
  });

  // ---- Globals exposed to templates -----------------------------------
  eleventyConfig.addGlobalData('site', {
    baseurl: '',
    url: SITE_URL,
    time: new Date()
  });

  return {
    dir: {
      input: '.',
      output: '_site',
      includes: '_includes',
      layouts: '_layouts',
      data: '_data'
    },
    // Stick with Liquid (Eleventy default + same as Jekyll) so existing
    // `{% include foo.html %}` and `{{ x | date: '%Y' }}` syntax keeps
    // working with minimal source changes.
    htmlTemplateEngine: 'liquid',
    markdownTemplateEngine: 'liquid',
    templateFormats: ['md', 'liquid', 'html', 'xml', 'json']
  };
}
