Documentation for sitespeed.io
================

The sitespeed.io documentation site, built with [Eleventy](https://www.11ty.dev).

Run locally
-----------

You need Node.js 20 or newer. From `docs/`:

    npm install
    npm run serve

Then open <http://localhost:8080/>.

Build for production
--------------------

    npm run build

Output goes to `docs/_site/`.

Notes
-----

* Templates use Liquid (same syntax as the previous Jekyll setup).
* Markdown is rendered by markdown-it with a small kramdown-IAL shim
  (`docs/_lib/kramdown-block-attrs.js`) so the existing `{: .class}` /
  `{:toc}` / `{:.no_toc}` syntax keeps working.
* Posts live in `_posts/` (filename `YYYY-MM-DD-<slug>.md`); their
  permalinks come from `_posts/_posts.11tydata.js`.
* HTML output is minified by `html-minifier-terser`. CSS is gathered
  via Eleventy's `addBundle('css')`, minified with Lightning CSS, and
  inlined into `<style>`.
* Code blocks are syntax-highlighted at build time with Prism via
  `@11ty/eleventy-plugin-syntaxhighlight` — no client-side JS for
  highlighting.
* `<img>` elements pointing at local images are rewritten to
  `<picture>` with AVIF + WebP + original-format sources by
  `@11ty/eleventy-img`. Optimised assets land in `_site/img/_optimized/`.

The first production build takes ~60 s because it processes ~600
images. Local rebuilds use the cached output and finish in ~2 s.
