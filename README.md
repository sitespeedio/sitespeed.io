<a href="http://sitespeed.io" target="_blank">Sitespeed.io</a> - how speedy is your site? [![Build Status](https://secure.travis-ci.org/soulgalore/sitespeed.io.png?branch=master)](http://travis-ci.org/soulgalore/sitespeed.io)
=============

Sitespeed.io is a tool that analyzes web sites and give you information of why they are slow and how you can optimize the web performance. Yslow rules in combination with other best practices rules are used. 

What do sitespeed.io do?   
-------
You give sitespeed a start point, the first page on your site, where you want it to start crawl. By default, one level will be crawled, meaning all links (on the same domain as the main page), will be fetched & analyzed. 

The flow looks something like this:

<img src="http://sitespeed.io/img/sitespeed.io-1.2-workflow.png">

More information: <a href="http://sitespeed.io">http://sitespeed.io</a>

Install
-------
<ol>
<li>Install PhantomJs http://phantomjs.org/download.html</li>
<li>Install Java 1.7</li>
<li>Checkout this repository <code>git clone git@github.com:soulgalore/sitespeed.io.git</code></li>
</ol>

How to run
-------
Run the script with a parameter that is the start page of where you want to test
<code>
./sitespeed.io -u http://github.com/
</code>

If you want to crawl deeper than one level, that is the next parameter.
<code>
./sitespeed.io -u http://github.com/ -d 2
</code>

Roadmap
-------
See the issue list.


Mad props
-------
* Marcel Duran for Yslow https://github.com/marcelduran/yslow/  without it sitespeed would be nothing :)
* Ariya Hidayat for PhantomJS https://github.com/ariya/phantomjs
* Mark Otto & Jacob Thornton for Twitter Bootstrap https://github.com/twitter/bootstrap/