// Per-directory data file for `_posts/`. Mirrors Jekyll's behaviour of
// extracting the date from the filename and emitting the post under
// `/<title-slug>/`, matching the Jekyll-era `permalink: /:title/` config.
export default {
  layout: 'default',
  nav: 'blog',
  tags: ['posts'],
  // The filename is YYYY-MM-DD-<slug>.md. Strip the date prefix.
  permalink: (data) => {
    const slug = data.page.fileSlug.replace(/^\d{4}-\d{2}-\d{2}-/, '');
    return `/${slug}/`;
  }
};
