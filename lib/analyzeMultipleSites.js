/**
 * Sitespeed.io - How speedy is your site? (http://www.sitespeed.io)
 * Copyright (c) 2014, Peter Hedenskog, Tobias Lidskog
 * and other contributors
 * Released under the Apache 2.0 License
 */
'use strict';
var path = require('path'),
	moment = require('moment'),
	fs = require('fs-extra'),
	async = require('async'),
	EOL = require('os').EOL,
	urlParser = require('url'),
	winston = require('winston'),
	SitesHTMLRenderer = require('./sitesHTMLRenderer'),
	fileHelper = require('./util/fileHelpers'),
	AnalyzeOneSite = require('./analyzeOneSite');

/**
 * Analyze multiple sites
 * @constructor
 */
function AnalyzeMultipleSites(config) {
	this.config = config;
	// store all site data here, use it when parsing and
	// creating the sites HTML file
	this.sites = {};
	this.htmlRenderer = new SitesHTMLRenderer(config);
	this.log = winston.loggers.get('sitespeed.io');
	this.startTime = moment(config.run.date);
}

AnalyzeMultipleSites.prototype.run = function(finishedCb) {

	var self = this;
	var sites = self.config.sites;
	var queue = async.queue(self._setupConfigurationForSite, 1);
	this.log.log('info', 'Analyze ' + sites.length + ' sites');
	sites.forEach(function(site) {
		if (site !== '') {
			queue.push({
				'site': site,
				'runner': self
			}, function() {
				self.log.log('info', 'Finished with site ' + site);
			});
		}
	});

	queue.drain = function() {
		var now = moment();
		self.log.log('info', 'The full site analyze took ' + now.from(self.startTime, true) + ' (' + now.diff(self.startTime,
			'seconds') + ' seconds)');

		if (self.config.html) {
			// we are finished, lets copy all the css/js/image assets and
			// render the specific HTML for showing sites info
			async.parallel({
					copySiteAssets: function(cb) {
						fs.copy(path.join(__dirname, '../assets/'), path.join(self.config.run.absResultDir, '..'), cb);
					},
					renderSites: function(cb) {
						self.htmlRenderer.renderSites(self.sites, cb);
					}
				},
				function(err) {
					if (!err) {
						self.log.log('info', 'Wrote sites result to ' + self.config.run.absResultDir);
					}
					finishedCb(err);
				});
		} else {
			finishedCb(undefined, {'sites': self.sites});
		}
	};
};

AnalyzeMultipleSites.prototype._getDataDir = function(config) {

	// if we have an absolute path, use it, else create it from the command is run
	var startPath = (config.resultBaseDir.charAt(0) === path.sep) ? config.resultBaseDir : path.join(process.cwd(),
		path.sep,
		config.resultBaseDir);

	// if we configured a name for a run use it, else use the date
	if (!config.outputFolderName) {
		config.startFolder = moment(config.run.date).format('YYYY-MM-DD-HH-mm-ss');
	} else {
		config.startFolder = config.outputFolderName;
	}

	// setup the absolute dir where we will store all the data
	config.run.absResultDir = path.join(startPath, 'sites', config.startFolder, config.urlObject ? config.urlObject.hostname :
		path.basename(config.file));

	return path.join(config.run.absResultDir, config.dataDir);
};

AnalyzeMultipleSites.prototype._setupConfigurationForSite = function(args, cb) {

	var config = args.runner.config;
	var self = this;

	// we need to take a sneak peak at the file to fetch the domain of the site
	// TODO remove the sync
	var data = args.site;
	var urls = data.toString().split(',').filter(function(l) {
		return l.length > 0;
	});

	// TODO what's the best logic?
	// if we have a deep of 0, match the exact urls
	if (config.deep < 1) {
		config.urls = urls;
	}
	config.url = urls[0];
	config.urlObject = urlParser.parse(urls[0]);


	var dataDir = args.runner._getDataDir(config);

	fileHelper.createDir(dataDir, function(err) {
		if (err) {
			self.log.log('error', 'Couldn\'t create the data dir:' + dataDir + ' ' + err);
			return cb(err);
		} else {
			var analyzeOneSite = new AnalyzeOneSite(config);
			analyzeOneSite.run(function() {
				// when we are finished store the aggregates data so
				// we can use it to create site info later
				args.runner.sites[config.url] = analyzeOneSite.aggregates;

				cb();
			});
		}
	});
};

module.exports = AnalyzeMultipleSites;
