# Help
Do you want to make sitespeed.io even better? Here's how you can help out!

## Developers
We love to have more people involved in making sitespeed.io better. We are constantly working on adding more documentation and trying to write more information in the issues so its easier to help out. If there's an [issue](https://github.com/sitespeedio/sitespeed.io/issues) that you want to help out, ping the issue and we'll help you getting started.

Have you already implemented your own [postTask](http://www.sitespeed.io/documentation/#postTasks)? Add it as a [gist](http://gist.github.com/) and show people how you done it.

## Companies
Do you use sitespeed.io in your everyday work? Then we have a perfect proposition for you! Have a hack day with focus on sitespeed.io for your team and contribute back. Pick one the things in the **Help wanted** section. Or maybe there's a function you think is missing? Create it. Contribute back. 

# Help wanted
We have a couple of functions that we have on the wish list but haven't had time to implement. Or even think about implementing.  
## A HAR viewer
We produce [HAR](http://www.softwareishard.com/blog/har-12-spec/) files today but we don't display them. We really like the [SimpleHar](http://rafacesar.github.io/simplehar/) and the old classic [HarViewer](http://www.softwareishard.com/har/viewer/) and we are pretty confident that it is possible to write a configurable HAR viewer that produces SVG and don't use JQuery. We would love to add that new HAR viewer to sitespeed.io and help users to see how the requests are loaded.

## A proxy producing HAR data
We use the ancient [BrowserMobProxy](https://github.com/lightbody/browsermob-proxy ) to get HAR files. It uses Java and there's work for modernizing the next version. But we would love to have a HAR proxy that is built in NodeJS.

## Grunt/Gulp plugins
Help us create a Grunt or Gulp plugin that runs sitespeed.io and integrates the performance budget functionality.

## A NodeJS crawler
We still use our own [Java crawler](https://github.com/sitespeedio/crawler) and we want to get rid off it and use a NodeJS crawler. We have tested out [Simple crawler](https://github.com/cgiffard/node-simplecrawler) but at least the the way of limiting the crawl of how deep it should crawl, doesn't work 100%. Help us fix it and implement Simpel crawler in sitespeed.io (or if you have suggestions for other crawlers).

## Visual love for the Hotlist
One new functionality released in 3.0 is the new **Hotlist** tab where we show things like slowest assets, largest images etc. That page result page need some love!

## New design for www.sitespeed.io
Today we use [Bootstrap](http://getbootstrap.com/) but we want to move away from it. We will start with the documentation site. Help make a super simple and light weight design for us. It needs to be simple and super fast :)

## Output as CSV
One function we had before was outputing all the metrics as CSV. It is still a nice feature for some users, so it would be cool to have it again. You have the issue [here](https://github.com/sitespeedio/sitespeed.io/issues/560)

# Money
> "Can't we just support you with money?" 

We would prefer that you spend your money on people that really needs it, support the [Red Cross](https://www.icrc.org/eng/donations/ways-to-donate/).
