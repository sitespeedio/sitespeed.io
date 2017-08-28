# sitespeed.io

[![Build status][travis-image]][travis-url]
[![Downloads][downloads-image]][downloads-url]
[![Docker][docker-image]][docker-url]
[![Stars][stars-image]][stars-url]
[![Changelog #212][changelog-image]][changelog-url]


[Website](https://www.sitespeed.io/) | [Documentation](https://www.sitespeed.io/documentation/) | [Twitter](https://twitter.com/SiteSpeedio)

## Welcome to the wonderful world of web performance!

Using sitespeed.io you can:
* Test your web site against Web Performance best practices using the [Coach](https://github.com/sitespeedio/coach).
* Collect Navigation Timing API, User Timing API and Visual Metrics from Firefox/Chrome using [Browsertime](https://github.com/sitespeedio/browsertime).
* Run your custom-made JavaScript and collect whichever metric(s) you need.
* Test one or multiple pages, across one or many runs to get more-accurate metrics.
* Create HTML-result pages or store the metrics in Graphite.
* Write your own plugins that can do whatever tests you want/need.

See all the latest changes in the [Changelog](https://github.com/sitespeedio/sitespeed.io/blob/master/CHANGELOG.md).

## Examples of what you can do

Checkout our example [dashboard.sitespeed.io](https://dashboard.sitespeed.io/dashboard/db/page-summary)

A summary report in HTML:
<img src="https://raw.githubusercontent.com/sitespeedio/sitespeed.io/master/docs/img/html-summary.png">

Individual page report:
<img src="https://raw.githubusercontent.com/sitespeedio/sitespeed.io/master/docs/img/page.png">

Collected metrics from a URL in Graphite/Grafana:
<img src="https://raw.githubusercontent.com/sitespeedio/sitespeed.io/master/docs/img/grafana-page-summary.png">

Video - easiest using Docker. This gif is optimized, the quality is much better IRL:

<img src="https://raw.githubusercontent.com/sitespeedio/sitespeed.io/master/docs/img/barack.gif">

## Lets try it out

Using Docker (requires 1.10+):

```bash
$ docker run --shm-size=1g --rm -v "$(pwd)":/sitespeed.io sitespeedio/sitespeed.io --video --speedIndex https://www.sitespeed.io/
```

Or install using npm:

```bash
$ npm i -g sitespeed.io
```

Or clone the repo and test the latest changes:

```bash
$ git clone https://github.com/sitespeedio/sitespeed.io.git
$ cd sitespeed.io
$ npm install
$ bin/sitespeed.js --help
$ bin/sitespeed.js http://www.sitespeed.io
```

## I want to help!
We have a [special page](HELP.md) for you!

## Contributors
All the love in the world to our contributors:

[<img alt="mcdado" src="https://avatars2.githubusercontent.com/u/898057?v=4&s=117" width="117">](https://github.com/mcdado)[<img alt="unadat" src="https://avatars3.githubusercontent.com/u/2950381?v=4&s=117" width="117">](https://github.com/unadat)[<img alt="stefanjudis" src="https://avatars3.githubusercontent.com/u/962099?v=4&s=117" width="117">](https://github.com/stefanjudis)[<img alt="shakey2k2" src="https://avatars1.githubusercontent.com/u/5218401?v=4&s=117" width="117">](https://github.com/shakey2k2)[<img alt="lbod" src="https://avatars1.githubusercontent.com/u/733371?v=4&s=117" width="117">](https://github.com/lbod)[<img alt="tollmanz" src="https://avatars3.githubusercontent.com/u/921795?v=4&s=117" width="117">](https://github.com/tollmanz)

[<img alt="laer" src="https://avatars3.githubusercontent.com/u/233972?v=4&s=117" width="117">](https://github.com/laer)[<img alt="pixelsonly" src="https://avatars1.githubusercontent.com/u/1099513?v=4&s=117" width="117">](https://github.com/pixelsonly)[<img alt="pelmered" src="https://avatars2.githubusercontent.com/u/680058?v=4&s=117" width="117">](https://github.com/pelmered)[<img alt="staabm" src="https://avatars2.githubusercontent.com/u/120441?v=4&s=117" width="117">](https://github.com/staabm)[<img alt="alimony" src="https://avatars3.githubusercontent.com/u/331091?v=4&s=117" width="117">](https://github.com/alimony)[<img alt="krukru" src="https://avatars3.githubusercontent.com/u/10072630?v=4&s=117" width="117">](https://github.com/krukru)

[<img alt="AD7six" src="https://avatars0.githubusercontent.com/u/33387?v=4&s=117" width="117">](https://github.com/AD7six)[<img alt="abhagupta" src="https://avatars3.githubusercontent.com/u/825965?v=4&s=117" width="117">](https://github.com/abhagupta)[<img alt="adamstac" src="https://avatars1.githubusercontent.com/u/2933?v=4&s=117" width="117">](https://github.com/adamstac)[<img alt="svetlyak40wt" src="https://avatars2.githubusercontent.com/u/24827?v=4&s=117" width="117">](https://github.com/svetlyak40wt)[<img alt="antonbabenko" src="https://avatars3.githubusercontent.com/u/393243?v=4&s=117" width="117">](https://github.com/antonbabenko)[<img alt="akupila" src="https://avatars0.githubusercontent.com/u/540683?v=4&s=117" width="117">](https://github.com/akupila)

[<img alt="bbvmedia" src="https://avatars2.githubusercontent.com/u/613914?v=4&s=117" width="117">](https://github.com/bbvmedia)[<img alt="bitdeli-chef" src="https://avatars2.githubusercontent.com/u/3092978?v=4&s=117" width="117">](https://github.com/bitdeli-chef)[<img alt="cgoldberg" src="https://avatars0.githubusercontent.com/u/1113081?v=4&s=117" width="117">](https://github.com/cgoldberg)[<img alt="danielsamuels" src="https://avatars0.githubusercontent.com/u/1781176?v=4&s=117" width="117">](https://github.com/danielsamuels)[<img alt="marcbachmann" src="https://avatars3.githubusercontent.com/u/431376?v=4&s=117" width="117">](https://github.com/marcbachmann)[<img alt="EikeDawid" src="https://avatars3.githubusercontent.com/u/638502?v=4&s=117" width="117">](https://github.com/EikeDawid)

[<img alt="emilb" src="https://avatars2.githubusercontent.com/u/86359?v=4&s=117" width="117">](https://github.com/emilb)[<img alt="gehel" src="https://avatars1.githubusercontent.com/u/1415765?v=4&s=117" width="117">](https://github.com/gehel)[<img alt="Ixl123" src="https://avatars2.githubusercontent.com/u/2118956?v=4&s=117" width="117">](https://github.com/Ixl123)[<img alt="jeremy-green" src="https://avatars3.githubusercontent.com/u/1375140?v=4&s=117" width="117">](https://github.com/jeremy-green)[<img alt="jerodsanto" src="https://avatars0.githubusercontent.com/u/8212?v=4&s=117" width="117">](https://github.com/jerodsanto)[<img alt="jjethwa" src="https://avatars0.githubusercontent.com/u/4575316?v=4&s=117" width="117">](https://github.com/jjethwa)

[<img alt="keithamus" src="https://avatars3.githubusercontent.com/u/118266?v=4&s=117" width="117">](https://github.com/keithamus)[<img alt="omegahm" src="https://avatars1.githubusercontent.com/u/178448?v=4&s=117" width="117">](https://github.com/omegahm)[<img alt="schmilblick" src="https://avatars1.githubusercontent.com/u/31208?v=4&s=117" width="117">](https://github.com/schmilblick)[<img alt="rob-m" src="https://avatars2.githubusercontent.com/u/641076?v=4&s=117" width="117">](https://github.com/rob-m)[<img alt="atdt" src="https://avatars0.githubusercontent.com/u/376462?v=4&s=117" width="117">](https://github.com/atdt)[<img alt="matthojo" src="https://avatars1.githubusercontent.com/u/367517?v=4&s=117" width="117">](https://github.com/matthojo)

[<img alt="orjan" src="https://avatars3.githubusercontent.com/u/124032?v=4&s=117" width="117">](https://github.com/orjan)[<img alt="moos" src="https://avatars2.githubusercontent.com/u/233047?v=4&s=117" width="117">](https://github.com/moos)[<img alt="radum" src="https://avatars2.githubusercontent.com/u/46779?v=4&s=117" width="117">](https://github.com/radum)[<img alt="JeroenVdb" src="https://avatars0.githubusercontent.com/u/657797?v=4&s=117" width="117">](https://github.com/JeroenVdb)[<img alt="pborreli" src="https://avatars2.githubusercontent.com/u/77759?v=4&s=117" width="117">](https://github.com/pborreli)[<img alt="jzoldak" src="https://avatars2.githubusercontent.com/u/2338889?v=4&s=117" width="117">](https://github.com/jzoldak)

[<img alt="n3o77" src="https://avatars3.githubusercontent.com/u/321891?v=4&s=117" width="117">](https://github.com/n3o77)[<img alt="stephendonner" src="https://avatars3.githubusercontent.com/u/387249?v=4&s=117" width="117">](https://github.com/stephendonner)


[travis-image]: https://img.shields.io/travis/sitespeedio/sitespeed.io.svg?style=flat-square
[travis-url]: https://travis-ci.org/sitespeedio/sitespeed.io
[stars-url]: https://github.com/sitespeedio/sitespeed.io/stargazers
[stars-image]: https://img.shields.io/github/stars/sitespeedio/sitespeed.io.svg?style=flat-square
[downloads-image]: https://img.shields.io/npm/dt/sitespeed.io.svg?style=flat-square
[downloads-url]: https://npmjs.org/package/sitespeed.io
[docker-image]: https://img.shields.io/docker/pulls/sitespeedio/sitespeed.io.svg
[docker-url]: https://hub.docker.com/r/sitespeedio/sitespeed.io/
[changelog-image]: https://img.shields.io/badge/changelog-%23212-lightgrey.svg?style=flat-square
[changelog-url]: https://changelog.com/212
