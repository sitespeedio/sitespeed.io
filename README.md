# sitespeed.io

[![Build status][travis-image-4]][travis-url]
[![Downloads][downloads-image]][downloads-url]
[![Docker][docker-image]][docker-url]
[![Stars][stars-image]][stars-url]


[Website](https://www.sitespeed.io) | [Documentation](https://www.sitespeed.io/documentation/) | [Twitter](https://twitter.com/SiteSpeedio)

## Welcome to the wonderful world of web performance!

*This branch tracks the development of the upcoming version 4.0 of sitespeed.io.
The current production version is developed in the [master branch](https://github.com/sitespeedio/sitespeed.io).*

Version 4.0 is a ground up rewrite for node.js 4.3 and newer. It builds on all our experience since shipping 3.0 in December 2014,
the first version to use node.js. It's currently under active development, and the feature set is not yet set in stone.
However we're determined to make it the best version of sitespeed.io to date.

Documentation and tests for the upcoming version aren't in place yet. Rest assured, it will be before 4.0 is released.
If you're feeling adventurous and would like to give the new version a spin, try the following (you'll need node.js installed):

```bash
> git clone https://github.com/sitespeedio/sitespeed.io.git
> cd sitespeed.io
> git checkout 4.0
> npm install
> bin/sitespeed.js --help
> bin/sitespeed.js http://www.sitespeed.io
```

[travis-image-4]: https://img.shields.io/travis/sitespeedio/sitespeed.io/4.0.svg?style=flat-square
[travis-url]: https://travis-ci.org/sitespeedio/sitespeed.io/branches
[stars-url]: https://github.com/sitespeedio/sitespeed.io/stargazers
[stars-image]: https://img.shields.io/github/stars/sitespeedio/sitespeed.io.svg?style=flat-square
[downloads-image]: http://img.shields.io/npm/dm/sitespeed.io.svg?style=flat-square
[downloads-url]: https://npmjs.org/package/sitespeed.io
[docker-image]: https://img.shields.io/docker/pulls/sitespeedio/sitespeed.io.svg
[docker-url]: https://hub.docker.com/r/sitespeedio/sitespeed.io/
