export function shortAsset(url, longVersion) {
  if (longVersion) {
    if (url.length > 100) {
      let shortUrl = url.replace(/\?.*/, '');
      url = shortUrl.slice(0, 80) + '...' + shortUrl.slice(-17);
    }
  } else {
    if (url.length > 40) {
      let shortUrl = url.replace(/\?.*/, '');
      url = shortUrl.slice(0, 20) + '...' + shortUrl.slice(-17);
    }
  }
  return url;
}
