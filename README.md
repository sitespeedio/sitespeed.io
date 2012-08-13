Sitespeed.io - how speedy is your site? [![Build Status](https://secure.travis-ci.org/soulgalore/sitespeed.io.png?branch=master)](http://travis-ci.org/soulgalore/sitespeed.io)
=============

Under construction :)

Sitespeed.io is a tool that analyzes web sites and give you information of why they are slow or at least, how they could be faster. Today yslow rules are used in combination with other best practices. 

What do sitespeed.io do?   
-------
You give sitespeed a start point, the first page on your site, where you want it to start crawl. By default, one level will be crawled, meaning all links (on the same domain as the main page), will be fetched & later analyzed. 

The output is by default HTML. One summary page, that on high level will give you input about your speed of your site. You can also see all the individual pages and their assets.
 
Prerequisites
-------
<ol>
<li>Install PhantomJs http://code.google.com/p/phantomjs/wiki/Installation</li>
<li>Install Java 1.7</li>
<li>Checkout this repository</li>
</ol>

How to run
-------
Run the script with a parameter that is the start page of where you want to test
<code>
./sitespeed.io http://github.com/
</code>

If you want to crawl deeper than one level, that is the next parameter.
<code>
./sitespeed.io http://github.com/ 2
</code>

If your site is behind basic auth, you can fetch it by
<code>
./sitespeed.io http://github.com/hidden/ 1 login password
</code>

Mad props
-------
* Marcel Duran for Yslow https://github.com/marcelduran/yslow/  without it sitespeed would be nothing :)
* Ariya Hidayat for PhantomJS https://github.com/ariya/phantomjs
* Mark Otto & Jacob Thornton for Twitter Bootstrap https://github.com/twitter/bootstrap/