# CHANGELOG - sitespeed.io  (we use [semantic versioning](https://semver.org))

## 26.1.0 - 2022-10-21
### Added
* Update to 0.10.4 co2 and make it possible change model [#3736](https://github.com/sitespeedio/sitespeed.io/pull/3736) and the to 0.11.3 in [#3741](https://github.com/sitespeedio/sitespeed.io/pull/3741)
* Upgraded Docker container to use Chrome, Edge and Firefox 106.
* Show start/end date for collected Crux data [#3740](https://github.com/sitespeedio/sitespeed.io/pull/3740)

### Fixed
* Better explanation for some PageXray metrics [#3743](https://github.com/sitespeedio/sitespeed.io/pull/3743).

## 26.0.1 - 2022-09-27
### Fixed
* Upgrading to [Browsertime 16.17.0](https://github.com/sitespeedio/browsertime/blob/main/CHANGELOG.md#16170---2022-09-27) that contains a fix to collect battery temperature on Android, making it possible to send the data to Graphite again.

## 26.0.0 - 2022-09-23

Hi and welcome to 26.0.0! There's a couple of small fixes and additions and one breaking change. You are only affected by the breaking change if you used to use `--graphite.perIteration` (sending data for all iterations to Graphite) or if you used `--graphite.skipSummary` (do not send summary information). Please read the changed section if you are affected!

When you upgrade to 26.0.0 you will have an easier way of sending data per run to Graphite, there will be a blog post better explaining how you can use it.

### Changed
Sending metrics per run to Graphite:
* The default setup did miss a lot of important performance metrics, so you needed to set them up yourself. That is fixed in this PR.
* There where a lot of data sent from PageXray, third party and the coach per run. That was not smart since those metrics rarely change between runs and take a lot of space. This PR sets default so none of those metrics are sent
* We introduce a limited set of run metrics from Browsertime (visual metrics and Google Web Vitals and a couple of more) that can be used when sending data per run. This will help you keep track of those metrics together with the default median/min/max values. More info coming up. It's enabled by default, disable it with `--browsertime.limitedRunData false`
* Sending data per run to Graphite was broken: We sent a new key per run meaning it will take up a lot of extra space in Graphite. With this fix we send them under the run key. That way we can configure Graphite to keep data under that key that happened every 20 s (or however fast it takes to do one run) and then automatically remove the data after a week.
* Graphite configuration `--graphite.perIteration` and `--graphite.skipSummary` is removed. You can now configure which data to send to Graphite by using `--graphite.messages`. By default we send _pageSummary_ (data summarised per URL) and _summary_ (data summarised per domain). If you want to send _pageSummary_ and _run_ data (data for each run) you can do that with by adding `--graphite.messages run`  `--graphite.messages pageSummary`.
* We removed the possibility to send VisualProgress and videoRecordingStart data to the datasource since that is something you do not need there.
* We updated Grafana and the Graphite container to latest versions. The Graphite container contains _storage-schemas.conf_ configuration that is a good default:
```
[sitespeed_crux]
pattern = ^sitespeed_io\.crux\.
retentions = 1d:1y

[sitespeed_run]
pattern = ^sitespeed_io\.(.*)\.(.*)\.run\.
retentions = 20s:8d

[sitespeed]
pattern = ^sitespeed_io\.
retentions = 30m:40d
```

When you send data per run to Graphite it is stored every 20 second (do not make runs more often than that) and saved for 8 days. If you test many URLs this can still be a lot of data so use https://m30m.github.io/whisper-calculator/ to calculate how much space you need.

See PR [#3721](https://github.com/sitespeedio/sitespeed.io/pull/3721).

### Added
* Checkout the [pre built Raspberry Pi image](https://github.com/sitespeedio/raspberrypi) for running sitespeed.io tests on your Android phone.
* Upgraded to Firefox 105 and Edge 105 in the Docker container.
* Upgraded to Browsertime 16.16.0
* Include --preURL information in the latest storer info [#3729](https://github.com/sitespeedio/sitespeed.io/pull/3729).
### Fixed
* Fix graphite.sendAnnotation option [#3726](https://github.com/sitespeedio/sitespeed.io/pull/3726).
* Show timestamp when each run happens on the run page [#3730](https://github.com/sitespeedio/sitespeed.io/pull/3730).
##  25.11.0 - 2022-09-04
### Added
* Make it possible to configure run options for AXE (before you could only configure configuration options) [#3718](https://github.com/sitespeedio/sitespeed.io/pull/3718). Checkout [how to configure AXE](https://www.sitespeed.io/documentation/sitespeed.io/axe/#configure-axe).* Removed showing if the page is an AMP page (that battle was won a long time ago) and instead show information from the Network information API when its available [#3719](https://github.com/sitespeedio/sitespeed.io/pull/3719).

## 25.10.0 - 2022-08-31
### Added
* Updated to Chrome 105 and Firefox 104 in the Docker container [#3717](https://github.com/sitespeedio/sitespeed.io/pull/3717).

## 25.9.1 - 2022-08-30
### Fixed
* Updated to [Browsertime 16.5.1](https://github.com/sitespeedio/browsertime/blob/main/CHANGELOG.md#16151---2022-08-30) thar makes sure long tasks are measured direct after the test finish. This fixes late long tasks that happens on slow devices caused by Browsertime collecting metrics.
## 25.9.0 - 2022-08-30
### Added
* Updated to Browsertime 16.15.0 that include your Android phones connected wifi name in the result. That is now showed in the runtime settings page.

* Show relative standard deviation on the compare runs page [#3716](https://github.com/sitespeedio/sitespeed.io/pull/3716).

## 25.8.3 - 2022-08-28
### Fixed
* Ooops, it turns out 25.8.2 didn't fix the preWarm issue, it's fixed in [3715](
https://github.com/sitespeedio/sitespeed.io/pull/3715).
## 25.8.2 - 2022-08-26
### Fixed
* Updated Browsertime to 16.14.2 that fixes `--browsertime.preWarmServer` on Android and iOS.
## 25.8.1 - 2022-08-26
### Fixed
* Updated Browsertime to 16.14.1 that adds a guard for null values in rsd (this fixes the warning logs happening in 25.8.0).
## 25.8.0 - 2022-08-26
### Added
* Updated to [Browsertime 16.14.0](https://github.com/sitespeedio/browsertime/blob/main/CHANGELOG.md#16140---2022-08-26). that collects relative standard deviation for metrics and the number of processes that runs on the server when you start a test. 
## 25.7.3 - 2022-08-17
### Fixed
* Upgraded to [Browsertime 16.13.3](https://github.com/sitespeedio/browsertime/blob/main/CHANGELOG.md#16133---2022-08-17) that fixes a bug when setting cookies when navigating in Chrome/Edge when using scripting.

## 25.7.2 - 2022-08-14
### Fixed
* Getting only some data from the CrUX API broke the HTML generation as reported in [#3708](https://github.com/sitespeedio/sitespeed.io/issues/3708) and fixed in [#3709](https://github.com/sitespeedio/sitespeed.io/pull/3709).
* Updated to [Browsertime 16.13.2](https://github.com/sitespeedio/browsertime/blob/main/CHANGELOG.md#16132---2022-08-14) that fixes so the lastCPULong task is not added to the HAR.

## 25.7.1 - 2022-08-10
### Fixed
* The +1 container now uses PSI plugin version 4.1.0 (before 4.0.1).
* Updated to [Browsertime 16.13.1](https://github.com/sitespeedio/browsertime/releases/tag/v16.13.1) that always get the id from the Android phone when you run android tests.
* The latest storer plugin sometimes missed writing Android data to the JSON. Fixed in [#3707](https://github.com/sitespeedio/sitespeed.io/pull/3707).
## 25.7.0 -2022-08-08
### Added
* Updated the Docker container to use Chrome 104 and Edge 104.
* Updated to [Browsertime 16.12.0](https://github.com/sitespeedio/browsertime/releases/tag/v16.12.0) that uses Chromedriver 104.
* Updated to  [Browsertime 16.13.0](https://github.com/sitespeedio/browsertime/releases/tag/v16.13.0) that uses Edgedriver 104 and updated Selenium version.
## 25.6.0 - 2022-08-01
### Added
* Updated to Firefox 103 in the Docker container.
* The +1 container uses Lighthouse 9.6.4.
* Removed videojs and use plain video element to display the video [#3697](https://github.com/sitespeedio/sitespeed.io/pull/3697). This makes the result pages cleaner. 

### Fixed
* Fixed error message when you run Axe and analysisstorer at the same time [#3703](https://github.com/sitespeedio/sitespeed.io/pull/3703).
## 25.5.1 - 2022-07-16
### Fixed
* No change but when 25.5.0 was publsihed Docker had problems so the container was not pushed as reported by [Marco Fontani](https://github.com/mfontani) (thank you!).
## 25.5.0 - 2022-07-14
### Added
* New scp plugin [#3691](https://github.com/sitespeedio/sitespeed.io/pull/3691). The plugin is exprimental and documentation is coming in a couple of releases.

### Fixed
* Upgraded to [Browsertime 16.1.3](https://github.com/sitespeedio/browsertime/releases/tag/v16.11.3) that fixes:
  * If one of the visual elements failed, all failed. Fixed in [#1818](https://github.com/sitespeedio/browsertime/pull/1818).
  * Use buffered long tasks instead of injecting the measurement in the page [#1817](https://github.com/sitespeedio/browsertime/pull/1817).
  * Fixed broken Chromedriver and Geckodriver install on Windows.
* Upgraded NodeJS in the Docker container + updated to latest updated Ubuntu 20.

## 25.4.0 - 2022-07-05
### Added
* Show how many long tasks happens before LCP [#3686](https://github.com/sitespeedio/sitespeed.io/pull/3686) and show when last long task happen [#3687](https://github.com/sitespeedio/sitespeed.io/pull/3687).

### Fixed
* Updated Browsertime with a fix for Geckodriver: when you run sitespeed.io on a Raspberry Pi it will pickup Geckodriver from the PATH.

## 25.3.2 - 2022-06-30
### Fixed
* Another go at fixing the preWarmServer issue [#3683](https://github.com/sitespeedio/sitespeed.io/pull/3683).

## 25.3.1 - 2022-06-29
### Fixed
* Upgraded to [Browsertime 16.11.1](https://github.com/sitespeedio/browsertime/blob/main/CHANGELOG.md#16111---2022-06-29) that fixes the preWarmServer issue reported in [#3682](https://github.com/sitespeedio/sitespeed.io/issues/3682).

## 25.3.0 - 2022-06-28
### Fixed
* Updated to [Browsertime 16.10.1](https://github.com/sitespeedio/browsertime/blob/main/CHANGELOG.md#16101---2022-06-26) that checks that the CDP port is not used before claiming it.

### Added
* Updated to Firefox 102 and Edge 103 in the Docker container.
* Updated to [Browsertime 16.11.0](https://github.com/sitespeedio/browsertime/blob/main/CHANGELOG.md#16110---2022-06-28).

## 25.2.1 - 2022-06-23
### Fixed
* Bug fix for adding custom CSS from plugins, than you [Josh Duncan](https://github.com/josh-lr) for PR [#3679](https://github.com/sitespeedio/sitespeed.io/pull/3679).

## 25.2.0 - 2022-06-22
### Added 
* Updated the Docker container to use Chrome 103.

## 25.1.1 - 2022-06-20
### Fixed
* Upgraded to Browsertime [16.9.1](https://github.com/sitespeedio/browsertime/blob/main/CHANGELOG.md#1691---2022-06-19) that upgraded to Throttle 4 that internally uses `ip route` instead of `route` (one less dependency).
## 25.1.0 - 2022-06-15
### Added
* Updated Browsertime to [16.9.0](https://github.com/sitespeedio/browsertime/blob/main/CHANGELOG.md#1690---2022-06-15) with the following changes:
  * New `wait.byCondition` command. Thank you [Icecold777](https://github.com/Icecold777) for PR [#1803](https://github.com/sitespeedio/browsertime/pull/1803).
  * Collect number of CPU longtasks before largest contentful paint [#1806](https://github.com/sitespeedio/browsertime/pull/1806).
  * Instead of throwing errors and exit the tests if the page hasn't finished loading after 5 minutes, we now gracefully ends the test after 2 minutes (you can change that time with `--maxLoadTime`). That makes more sense than just throwing errors [#1810](https://github.com/sitespeedio/browsertime/pull/1810). 

## 25.0.0 - 2022-06-10

### Changed
`--debug` do not add verbose logging anymore, instead it uses Browsertimes debug mode. You can use [breakpoints](https://www.sitespeed.io/documentation/sitespeed.io/scripting/#breakpoint) to debug your script. You can add breakpoints to your script that will be used when you run in `--debug` mode. At each breakpoint the browser will pause. You can continue by adding `window.browsertime.pause=false;` in your developer console.

Debug mode works in Chrome/Firefox/Edge when running on desktop. It do not work in Docker and on mobile. When you run in debug mode, devtools will be automatically open so you can debug your page.

In debug mode, the browser will pause after each iteration.

[Read the documentation](https://www.sitespeed.io/documentation/sitespeed.io/scripting/#debug) on how to debug sitespeed.io scripts.
### Added
* Added Firefox 101 and Edge 102 in the Docker container.

### Fixed
* Updated to Axe-core 4.2.2 [#3673](https://github.com/sitespeedio/sitespeed.io/pull/3673)

## 24.9.0 - 2022-05-25
### Added
* Updated the Docker container to use Chrome 102 [#3665](https://github.com/sitespeedio/sitespeed.io/pull/3665).

## 24.8.1 - 2022-05-21

### Fixed
* Better fix for getting the correct browser name and version when storing latest run data [#3661](https://github.com/sitespeedio/sitespeed.io/pull/3661).

### Added
* Updated to [Browsertime 16.7.0](https://github.com/sitespeedio/browsertime/blob/main/CHANGELOG.md#1670---2022-05-20) from 16.4.0. With the latest versions we get:
 * Use `--browsertime.videoParams.thumbsize` to set the max size of the filmstrip thumbnails.
 * Interaction to next paint is collected for browsers that supports it (useful for your user journeys)
 * The time when the last CPU long task happens is a new metric, thank you Andy Davies for that idea! 
* You can now use groupAlias directly in a text file [#3655](https://github.com/sitespeedio/sitespeed.io/pull/3655). You can read how in the [updated documentation](https://www.sitespeed.io/documentation/sitespeed.io/configuration/#analyse-by-urls).
* Added an option for using the full Graphite namespace when latest screenshots/video is stored for a test [#3660](https://github.com/sitespeedio/sitespeed.io/pull/3660).
### Fixed
* If you set a user agent for Browsertime, also use it for the crawler [#3652](https://github.com/sitespeedio/sitespeed.io/pull/3652).
* Fix missing browser info when storing latest run data [#3658](https://github.com/sitespeedio/sitespeed.io/pull/3658).

## 24.7.0 - 2022-05-11
### Added
* Updated to [Browsertime 16.4.0](https://github.com/sitespeedio/browsertime/blob/main/CHANGELOG.md#1640---2022-05-11) fixes a bug for LCP in the video and also output when LCP happens in the video.

### Fixed
* Make sure we got CLS from Browsertime when we try to render it [#3650](https://github.com/sitespeedio/sitespeed.io/pull/3650).
## 24.6.0 - 2022-05-10
### Added
* Updated to [Browsertime 16.3.0](https://github.com/sitespeedio/browsertime/blob/main/CHANGELOG.md#1630---2022-05-07) that collects Largest Contentful Paint from the browser (if the browser suppoorts the LCP API).

* Show total download time per domain [#3648](https://github.com/sitespeedio/sitespeed.io/pull/3648).
## 24.5.1 - 2022-05-06
### Fixed
* Reverted to Ubuntu 20 in the Docker container. Ubuntu 22 gave Firefox problems on ARM and we also seen other problems with NodeJS in that container.
* Updated PageXray/Coach Core that include SSL times in the total timings per domain (that was missed before).
* Added more safe check when we miss Crux data.
## 24.5.0 - 2022-05-05
### Added
* Add INP and TTFB to the CRUX metrics [#3645](https://github.com/sitespeedio/sitespeed.io/pull/3645).
* Updated the Chrome USer Experience dashboard to include the new metrics. You can see the dahsboard [here](https://dashboard.sitespeed.io/d/t_bhsNGMk/chrome-user-experience-report) and download the new one from [here](https://github.com/sitespeedio/grafana-bootstrap-docker/blob/main/dashboards/graphite/ChromeUserExperienceReport.json).

### Fixed
* Bumped Browsertime with a new fix release for the upcoming portable visual metrics script.
##  24.4.0 - 2022-05-04
### Added
* Updated to Edge 101 in the Docker container. Updated to latest [Browsertime 16.2.0](https://github.com/sitespeedio/browsertime/blob/main/CHANGELOG.md#1620---2022-05-01) with Edgedriver and Chromedriver 101.
* Updated to Firefox 100 in the Docker container.

### Fixed
* If `--firstParty` do not match any URL, make sure we still show first vs third party [#3643](https://github.com/sitespeedio/sitespeed.io/pull/3643).
* Updated to latest NodeJs in the slim container.

## 24.3.0 - 2022-04-27
### Added
* Updated to Chrome 101 in the Docker container [#3641](https://github.com/sitespeedio/sitespeed.io/pull/3641).

##  24.2.0 - 2022-04-26

### Added
* Updated base Docker image to use Ubuntu 22.04 [#3636](https://github.com/sitespeedio/sitespeed.io/pull/3636).

### Fixed
* Updated dependencies: aws-sdk, cli-color, fs-extra, influx, junit-report-builder and tape [#3640](https://github.com/sitespeedio/sitespeed.io/pull/3640) 

### Tech
* Use Ava for unit testing [#3637](https://github.com/sitespeedio/sitespeed.io/pull/3637)
* Use local HTTP server to speed up GitHub Action tests [#3638](https://github.com/sitespeedio/sitespeed.io/pull/3638).
* Updated dev dependencies [#3639](https://github.com/sitespeedio/sitespeed.io/pull/3639).

## 24.1.0 - 2022-04-22
### Added
* Update Grafana auth settings to allow api token or basic auth, thank you [Vladimir Stepanov](https://github.com/vs-odessa) for PR [#3627](https://github.com/sitespeedio/sitespeed.io/pull/3627).
* Add TTFB to the metrics page [#3630](https://github.com/sitespeedio/sitespeed.io/pull/3630).
* Use latest Coach core with updated PageXray and Third party web [#3629](https://github.com/sitespeedio/sitespeed.io/pull/3629).
* Make it possible to disable annotations for Graphite. Set `--graphite.sendAnnotation false` to disable sending annotations [#3625](https://github.com/sitespeedio/sitespeed.io/pull/3625).
* Show which run that is used in the metrics tab [#3631](https://github.com/sitespeedio/sitespeed.io/pull/3631).
* Updated to [Browsertime 16.1.0](https://github.com/sitespeedio/browsertime/blob/main/CHANGELOG.md#1610---2022-04-20).
### Updated
* Update dependencies: google-cloud/storage, aws-sdk, dayjs, yargs [#3635](https://github.com/sitespeedio/sitespeed.io/pull/3635).

## 24.0.0 - 2022-04-06

### Changed 
* Upgraded to [Browsertime 16.0.0](https://github.com/sitespeedio/browsertime/blob/main/CHANGELOG.md#1600---2022-04-05) that changed how the DNS is flushed. You need to add `--flushDNS` to your conifguration to flush the DNS between runs.

### Added
* Use Firefox 99 and Edge/Edgedriver 100 in the Dockker container.

### Fixed
* Better catch if Visual Metrics fails [#3619](https://github.com/sitespeedio/sitespeed.io/pull/3619)
* Fixed JUnit/alias bug [#3620](https://github.com/sitespeedio/sitespeed.io/pull/3620)
## 23.7.0 - 2022-03-31
### Added
* Updated to Chrome/Chromedriver 100 and [Browsertime 15.4.0](https://github.com/sitespeedio/browsertime/blob/main/CHANGELOG.md#1540---2022-03-30).
* Updated the +1 container to use Lighthouse 9.5.0.
* Updated to [Axe-core 4.4.1](https://github.com/sitespeedio/sitespeed.io/pull/3615).

## 23.6.1 - 2022-03-25
### Fixed
* Fixing text formatting in the JSON from latest run and make sure we display the time with UTC[#3611](https://github.com/sitespeedio/sitespeed.io/pull/3611).
## 23.6.0 - 2022-03-25
### Added
* Various fixes to add more content to the JSON stored from the latest run, making it easier to show more meta data for a run in Grafana [#3607](https://github.com/sitespeedio/sitespeed.io/pull/3607), [#3609](https://github.com/sitespeedio/sitespeed.io/pull/3609) and [#3610](https://github.com/sitespeedio/sitespeed.io/pull/3610).
## 23.5.2 - 2022-03-22
### Fixed
* Updated to latest NodeJS and Ubuntu updates in the Docker container with some security updates[#3306](https://github.com/sitespeedio/sitespeed.io/pull/3606). Also updated the slim container with latest NodeJS.
* Make sure the shrinkwrap file is used when building the container [#3604](https://github.com/sitespeedio/sitespeed.io/pull/3604) and (hopefully) fix so that .dockerignore is not ignored when Github Actions build the containers.

## 23.5.0 - 2022-03-11

### Added
* The -slim Docker container now uses Firefox 98.
* Updated Grafana to latest 8.4.3 in the Docker compose file.
* Updated [Graphite dashboards](https://github.com/sitespeedio/grafana-bootstrap-docker/tree/main/dashboards/graphite) to use Timeseries graphs instead of old "Graph".
* You can use `-o` or `--open` or `--view` to open the result page after you run sitespeed.io on Mac and Linux [#3569](https://github.com/sitespeedio/sitespeed.io/pull/3596). 
* Open the result with `-o` on Linux using xdg-open [#3597](https://github.com/sitespeedio/sitespeed.io/pull/3597).

## 23.4.0 - 2022-03-09
### Added
* Firefox 98 in the Docker container [#3592](https://github.com/sitespeedio/sitespeed.io/pull/3592).
* Added link to each run in the side by side metric page, making it easier to go to the correct run [#3593](https://github.com/sitespeedio/sitespeed.io/pull/3593).

## 23.3.0 - 2022-03-07
### Added
* The +1 container is upgraded to use Lighthouse 9.4.0.
* Updated to [Browsertime 15.3.0](https://github.com/sitespeedio/browsertime/blob/main/CHANGELOG.md#1530---2022-03-07).

## 23.2.0 - 2022-03-05

### Added
* Updated to Chrome and Edge 99 in the Docker container. Updated to Chromedriver and Edgedriver 99 [#3590](https://github.com/sitespeedio/sitespeed.io/pull/3590).
### Fixed
* If you use alias and budget files, the outcome (result budget json and others) should use the alias of the URL instead of the URL [#3582](https://github.com/sitespeedio/sitespeed.io/pull/3582).
* Ignore sustainable.setup messages when storing analysistorer [#3578](https://github.com/sitespeedio/sitespeed.io/pull/3587).

## 23.1.0 - 2022-02-24
### Added
* Updated [Browsertime](https://github.com/sitespeedio/browsertime/blob/main/CHANGELOG.md#1510---2022-02-24) that collect timings from main document. The result includes a field named mainDocumentTimings and contains blocked, dns, connect, send, wait, receive, ssl as long as you get a HAR file from the browser. 

* Show Browsertime version in runtime settings [#3575](https://github.com/sitespeedio/sitespeed.io/pull/3575).

### Fixed
* Updated Chromedriver dependency that fixes installation on Mac M1 and some send keys issues.
## 23.0.1 - 2022-02-21
### Fixed
* Bumped to Browsertime 15.0.1 to make sure connectivity is set only once. In last release it was set in the beginning of the test and for eacch iteration. In practice that doesn't matter but it's very confusing if you check the logs. 
## 23.0.0 - 2022-02-21

### Breaking changes
* In this release we updated to Browsertime 15.0.0 that drops built in support for [TSProxy](https://github.com/WPO-Foundation/tsproxy). The reason to drop TSProxy is that it only works in Python 2 and the sunset for Python 2 was January 1, 2020. If you still need TSProxy you can set it up yourself.

* Browsertime also drop support for getting visual metrics from the trace log. It was added to evaluate if it could be a compliment to the video visual metrics but it was not. Removing it also decreased the number of dependencies in Browsertime.

* Linux/Mac OS will flush the DNS between runs, that means that you can have some changes in DNS lookup time when you upgrade to 23.0.0.

### Fixed
* Fix broken JUnit output. Thank you [rghetu](https://github.com/rghetu) for finding it [#3569](https://github.com/sitespeedio/sitespeed.io/pull/3569).
* When comparing metrics side by side for different runs, mean/median and stddev was sometimes broken for some timing metrics. Fixed with [#3573](https://github.com/sitespeedio/sitespeed.io/pull/3573)

### Added
* Use Browsertime 15.0.0.
* Show alias name in the budget report page [#3572](https://github.com/sitespeedio/sitespeed.io/pull/3572).

## 22.1.2 - 2022-02-09
### Fixed
* Updated to Browsertime 14.21.1 that disables the new Chrome splash screen by default.
## 22.1.1 - 2022-02-08
### Fixed
* The slim container with only Firefox was broken in last release. It's now re-released with Firefox 96 and Firefox 97 coming soon.
## 22.1.0 - 2022-02-08
### Added
* Upgraded to latest Browsertime with Egdedriver 98.
* Upgraded to Edge 98 and Firefox 97 in the (amd64) Docker containers.
## 22.0.0 - 2022-02-07

### Breaking changes
* If you use the Lighthouse plugin there's breaking changes:

In the new version we drop support for the following:
  * Running multiple runs with Lighthouse. 
  * Using scripts to login the user (or whatever you need before you run your tests)
It's a couple of reasons why I remove those features:
* I been looking for a maintainer of the Lighthouse plugin for +1 year and I haven't found one. For me to be able to maintain it I want the plugin to be as simple as possible.
* I deeply regret merging the PR for adding multiple runs for Lighthouse. That PR goes against everything I know about measuring performance. Lighthouse is not built for getting correct performance metrics, it's built to help (Chrome) developers to get insights how they make the page "faster". Lets stick to the basics and keep it possible to get those recommendations from Lighthouse.
* Maybe someday Lighthouse will have support for user journeys, lets wait until that is officially supported and then I can check if it could be used in the plugin.

With the new release we also break how you configure Lighthouse. People has had problem with that since day 1. With the new version we support two new ways to configure Lighthouse:
- By configuration JSON file. `--lighthouse.config config.js`
- By Lightouse flags file. `--lighthouse.flags flag.json`

If you don't need to configure Lightouse you can use the default settings both for desktop and mobile. If you run without any settings, the plugin will use desktop settings. If you run with `--mobile`, `--android` or `--ios` the mobile settings will be used. 

### Added
* Build Docker containers for both amd64 and arm64 to make containers work on Mac M1. The arm container contains Firefox and Chromium. Thank you [whichfinder](https://github.com/whichfinder) and [Radu Micu](https://github.com/radum) for the help! Fixed in PR [#3554](https://github.com/sitespeedio/sitespeed.io/pull/3554).
* When plugins is loaded, there's a new extra last step where we try to load the plugin as a globally installed npm module [#3546](https://github.com/sitespeedio/sitespeed.io/pull/3546).

### Fixed
* Fix so that we do not display the same 3rd party cookie multiple times [#3545](https://github.com/sitespeedio/sitespeed.io/pull/3545).
* Updated Coach Core that includes the latest version of third party web and PageXray that find more fonts without mime type.

## 21.6.1 - 2022-01-24
### Fixed
* Updated to [Browsertime 14.18.1](https://github.com/sitespeedio/browsertime/blob/main/CHANGELOG.md#14181---2022-01-24) that makes the summary metric log message use median (instead of mean) and change a log message level to debug.
## 21.6.0 - 2022-01-24
### Added
* Updated to Edge stable release in the Docker container.
* Remove Crux distribution table and use pie charts instead [#3537](https://github.com/sitespeedio/sitespeed.io/pull/3537)
* Add extra sleep time between Crux calls to make sure to not overload the API limit [#3536](https://github.com/sitespeedio/sitespeed.io/pull/3536).
* Added extra Crux enable command line `--crux.enable` to enable Crux [#3538](https://github.com/sitespeedio/sitespeed.io/pull/3538). Its default value is `true` and you also need to supply the Crux key to run Crux. The reason for the new parameter is that you can now configure the key in your configuration JSON and set the enable to false and then you enable it with the CLI parameter when you actually need to run Crux.
* Show Crux-metrics on the Summary page [#3540](https://github.com/sitespeedio/sitespeed.io/pull/3540).
* Updated summary metrics tables with headings to make it easier to read [#3541](https://github.com/sitespeedio/sitespeed.io/pull/3541).
* Added [Browsertime 14.17.0](https://github.com/sitespeedio/browsertime/blob/main/CHANGELOG.md#14170---2022-01-23) with new Select and click.byName commands. With that Browsertime version you also need to have ffprobe installed when you run Visual Metrics but that should already be installed.
* Added [Browsertime 14.18.0](https://github.com/sitespeedio/browsertime/blob/main/CHANGELOG.md#14180---2022-01-24) with a fix for Firefox [#1698](https://github.com/sitespeedio/browsertime/issues/1698)

## 21.5.0 - 2022-01-14
### Added
* Upgraded to [Browsertime 14.15.0](https://github.com/sitespeedio/browsertime/blob/main/CHANGELOG.md#14150---2022-01-12) that adds support for `--appendToUserAgent` for Chrome/Edge/Firefox. And then Browsertime 14.16.0 that supports Geckodriver for Raspberry Pi.
## 21.4.0 - 2022-01-12
### Added
* Updated to a new build of WebPageReplay in the Docker container
* Updated the Ubuntu base image to latest version and latest NodeJS in the Docketr container.
* Upgraded Browsertime [#3528](https://github.com/sitespeedio/sitespeed.io/pull/3528): 
  * Add support for Humble as connectivity engine for mobile phone testing. Make sure to setup Humble on a Raspberry Pi 4 and the choose engine with --connectivity.engine humble and set the URL to your instance --connectivity.humble.url http://raspberrypi.local:3000. Added in #1691.
* Upgraded to Chrome 97 and Edge 97 in the Docker container.
* Upgraded to Chromedriver 97.
### Fixed
* Updated Chromedriver library that automatically picks up the Chromedriver if it's installed on Raspberry Pi.
## 21.3.0 - 2022-01-01
### Added
* Updated to [Browsertime 14.13.0](https://github.com/sitespeedio/browsertime/blob/main/CHANGELOG.md#14130---2021-12-30) with the following fixes for the user agent:
  * Append text to Chrome/Edge user agent using `--chrome.appendToUserAgent`
  * When you use Chrome/Edge and use a "emulated device" that will use the user agent that you provide using `--userAgent`. Else it will use the user agent from your emulated device setting.
  * You can also use Edge to run emulated mobile with the same settings as Chrome.
## 21.2.2 - 2021-12-23
### Fixed
* Fix the error introduced in 21.2.0 for "Include page summary URL in the result JSON"
[#3525](https://github.com/sitespeedio/sitespeed.io/pull/3525). 

## 21.2.1 - 2021-12-22
### Fixed
* It turns out that Firefox 95 doesn't work with the HAR export trigger and the workaround that worked in Firefox 94 seems to not work in 95 see https://github.com/sitespeedio/browsertime/issues/1671#issuecomment-999412035. That's why we are reverting to Firefox 94 in the Docker containers.
## 21.2.0 - 2021-12-22
### Fixed
* The catching of errors in the queue was broken and reported the error x times (x=number of plugins). Also when we had an error the result JSON was not stored. [#3522](https://github.com/sitespeedio/sitespeed.io/pull/3522).

### Added
* Updated to Firefox 95 and Edge 96 in the Docker container.
* Include page summary URL in the result JSON [#3523](https://github.com/sitespeedio/sitespeed.io/pull/3523).

## 21.1.0 - 2021-12-06
### Added
* Added possibility choose name for storing a result JSON [#3520](https://github.com/sitespeedio/sitespeed.io/pull/3520). We use this for a feature that will be released soon.
## 21.0.1 - 2021-12-01
### Fixed
* Updated Browsertime that logs Chrome document request failures on debug log level instead so that the log is not cluttered.

## 21.0.0 - 2021-12-01

### Changed
* Updated to [Coach Core 7.0.0](https://github.com/sitespeedio/coach-core/blob/main/CHANGELOG.md#700---2021-12-01). This will probably change your Coach score. The new Coach has the following changes:
  * Moved AMP advice to best practice instead of privacy [#67](https://github.com/sitespeedio/coach-core/pull/67).
  * Increased favicon max size advice from 5 to 10 kb [#68](https://github.com/sitespeedio/coach-core/pull/68)
  * Renamed the fastRender advice to avoidRenderBlocking [#73](https://github.com/sitespeedio/coach-core/pull/73)
  * Remove the third party async advice [#74](https://github.com/sitespeedio/coach-core/pull/74)
  * Updated the layout shift advice to use cumulative layout shift [#75](https://github.com/sitespeedio/coach-core/pull/75)
  * Changed id of the Google Tag Manager advice [#79](https://github.com/sitespeedio/coach-core/pull/79)
  * Updated third-party-web to 0.12.6.
  * Use Chrome(ium) render blocking information to know if a request is render blocking or not [#66](https://github.com/sitespeedio/coach-core/pull/66).
  * Report offending JavaScript assets if the JavaScript max limits kicks in [#70](https://github.com/sitespeedio/coach-core/pull/70).
  * New largest contentful paint advice [#76](https://github.com/sitespeedio/coach-core/pull/76).
  * New first contentful paint advice [#77](https://github.com/sitespeedio/coach-core/pull/77).
  * Added TBT in the CPU longtask advice [#80](https://github.com/sitespeedio/coach-core/pull/80).
  * Report content and transfer size for offending URLs [#81](https://github.com/sitespeedio/coach-core/pull/81).
  * Report offending assets with transfer/content size for page size limit [#82](https://github.com/sitespeedio/coach-core/pull/82).
  * Fix cases when JQuery is undefined. Thank you [shubham jajodia](https://github.com/jajo-shubham) for PR [#64](https://github.com/sitespeedio/coach-core/pull/64).
  * A better way to find offending layout shifters. Thank you [shubham jajodia](https://github.com/jajo-shubham) for PR [#65](https://github.com/sitespeedio/coach-core/pull/65).
  * Removed mentions aboout server push [#69](https://github.com/sitespeedio/coach-core/pull/69)
  * Added more information on how to debug CPU advice [#71](https://github.com/sitespeedio/coach-core/pull/71).

* Updated to sustainable plugin core code to [co2 0.8.0](https://github.com/thegreenwebfoundation/co2.js/blob/main/CHANGELOG.md#080---2021-11-28). This include a biug fix to the 1byte model that will lower your co2 score [#3519](https://github.com/sitespeedio/sitespeed.io/pull/3519). 

### Added
* Updated to [Browsertime 14.12.0](https://github.com/sitespeedio/browsertime/blob/main/CHANGELOG.md#14120---2021-11-30) that fixes the [FF 94 HAR issue](https://github.com/sitespeedio/browsertime/issues/1671).
* Updated green domains from the Green Web Foundation [#3513](https://github.com/sitespeedio/sitespeed.io/pull/3513).
* Updated PerfCascade that support chunks when you use Chrome(ium) [#3514](https://github.com/sitespeedio/sitespeed.io/pull/3514).
* Updated to Firefox 94 in the Docker image.

### Fixed
* Added missing summary boxes on start page [#3515](https://github.com/sitespeedio/sitespeed.io/pull/3515).

## 20.6.2 - 2021-11-20
### Fixed
* Updated to [Browsertime 14.10.2](https://github.com/sitespeedio/browsertime/blob/main/CHANGELOG.md#14102---2021-11-20) that disables the Edge/Edgedriver version check.
## 20.6.1 - 2021-11-20
### Fixed
* Updated to [Browsertime 14.10.1](https://github.com/sitespeedio/browsertime/blob/main/CHANGELOG.md#14101---2021-11-19) that disables the Chrome/Chromedriver version check.

## 20.6.0 - 2021-11-17

Note: Do your test fails with Firefox 94? See [Browsertime #1671](https://github.com/sitespeedio/browsertime/issues/1671). Until that is fixed in Firefox, it seems most use cases is fixed by adding a settle time (the browser rest for a while before we start the test). Try with `--browsertime.settleTime 10000` to add a 10 seconds wait time before the test starts.
### Added
* Updated to [Browsertime 14.10.0](https://github.com/sitespeedio/browsertime/blob/main/CHANGELOG.md#14100---2021-11-16) with Chromedriver 96 and Chrome 96 in the Docker container.

## 20.5.0 - 2021-11-09
### Added
* Updated to [Browsertime 14.9.0](https://github.com/sitespeedio/browsertime/blob/main/CHANGELOG.md#1490---2021-11-07) with updated Chrome HAR generator.

### Fixed
* Ignore Influxdb and Grafana setup messages when you use the analysisstorer plugin [#3508](https://github.com/sitespeedio/sitespeed.io/pull/3508).
## 20.4.2 - 2021-11-07
### Fixed
* Updated to AXE core 4.3.5 [#3501](https://github.com/sitespeedio/sitespeed.io/pull/3501).
* Use latest npm in the Docker container [#3502](https://github.com/sitespeedio/sitespeed.io/pull/3502).
* Fixed the bug that caused so that you couldn't use the analyisstorer plugin together with Graphite [#3506](https://github.com/sitespeedio/sitespeed.io/pull/3506).
* Updated to yargs 17.2.1
## 20.4.1 - 2021-10-29
### Fixed
* Reverted the change with npm in the Docker container since it broke both webpagetest and the +1 container installation
## 20.4.0 - 2021-10-29

### Added
* Updated to [Browsertime 14.8.0](https://github.com/sitespeedio/browsertime/blob/main/CHANGELOG.md) with Edgeriver 95.
* Updated to Edge 95 in the Docker container.
* Update to use NodeJS 16 in the Docker container [#3495](https://github.com/sitespeedio/sitespeed.io/pull/3495).
* On Mac OS: Use `--open` or `-o` to open the result in your default browser. Thank you [Johanna Lindh](https://github.com/zhouhana) for the idea! PR [#3493](https://github.com/sitespeedio/sitespeed.io/pull/3493).
* The +1 container now had Lighthouse 8.6.0.

### Fixed
* Removed npm from the Docker container when everything has been installed to fix npm security issues + decrease the size of the container.
## 20.3.1 - 2021-10-21
### Fixed
* Fix to handle integer value Android device serial, thank you [Saurav Kumar](https://github.com/svkrclg) for PR [#3490](https://github.com/sitespeedio/sitespeed.io/pull/3490).
## 20.3.0 - 2021-10-20
### Added
* Updated Browsertime that uses Chromedriver 95.
* Updated Chrome 95 in the Docker container.

## 20.2.0 - 2021-10-14
### Added
* Add support for using cookies when crawling, thank you [dammg](https://github.com/dammg) for PR [#3472](https://github.com/sitespeedio/sitespeed.io/pull/3472).
* [Browsertime 14.6.0](https://github.com/sitespeedio/browsertime/blob/main/CHANGELOG.md#1460---2021-10-13).
* [Use alias in your budget file](https://www.sitespeed.io/documentation/sitespeed.io/performance-budget/#override-per-url-or-alias) [#3479](https://github.com/sitespeedio/sitespeed.io/pull/3479).
* Support for using [User Timing API marks/measures in the budget file](https://www.sitespeed.io/documentation/sitespeed.io/performance-budget/#user-timing-api-metrics) [#3482](https://github.com/sitespeedio/sitespeed.io/pull/3482) and [#3483](https://github.com/sitespeedio/sitespeed.io/pull/3483). 
* Support for [using custom metrics from scripting in your budget](https://www.sitespeed.io/documentation/sitespeed.io/performance-budget/#metrics-from-scripting) [#3484](https://github.com/sitespeedio/sitespeed.io/pull/3484) and [#3486](https://github.com/sitespeedio/sitespeed.io/pull/3486).

### Fixed
* Allow crawler to use cookies, thank you [dammg](https://github.com/dammg) for the PR [#3472](https://github.com/sitespeedio/sitespeed.io/pull/3472) with small fix [#3473](https://github.com/sitespeedio/sitespeed.io/pull/3473).

## 20.1.0 - 2021-10-05
### Added
* Use Firefox 93 in the Docker and the Docker slim container [#3471](https://github.com/sitespeedio/sitespeed.io/pull/3471).
## 20.0.0 - 2021-09-30

Please read the [20.0 blog post](https://www.sitespeed.io/sitespeed.io-20.0/)! 
### Breaking changes
* Before you update to the new version: If you save your metrics to Graphite, have you upgraded those metrics to the new format as introduced in sitespeed.io the **15/4-2021**? If not, please follow the [guide](https://www.sitespeed.io/documentation/sitespeed.io/graphite/#upgrade-to-use-the-test-slug-in-the-namespace) in the documentation. If you haven't done that and still upgrade to sitespeed.io 20 you need to make sure you add `--graphite.addSlugToKey false` to your test else the metrics will be reported under a new key structure. The change was done in [#3434](https://github.com/sitespeedio/sitespeed.io/pull/3434).
* Set [throttle](https://github.com/sitespeedio/throttle) as default connectivity engine if you use Mac or Linux [#3433](https://github.com/sitespeedio/sitespeed.io/pull/3433). This makes it much easier to enable throttling. Our Docker container is not affected by this change.
* There's a new default mobile `--mobile` for Chrome. The new default is Moto G4 (instead of iPhone 6) [#3467](https://github.com/sitespeedio/sitespeed.io/pull/3467).
* When you run your tests on Safari on iOS the Coach is disabled by default [#3468](https://github.com/sitespeedio/sitespeed.io/pull/3468).

### Added
* [Browsertime 14.5.0](https://github.com/sitespeedio/browsertime/blob/main/CHANGELOG.md#1450---2021-09-30) with CSS selector support for the mouse commands.

## 19.6.0 - 2021-09-23
### Added
* Updated to Chrome 94 in the Docker container.
* Upgraded to [Browsertime 14.4.0](https://github.com/sitespeedio/browsertime/blob/main/CHANGELOG.md#1440---2021-09-22) that included Chromedriver 94.
## 19.5.0 - 2021-09-17
### Added
* Updated to Edge 93 in the Docker container.
* Updated to [Browsertime 14.3.0](https://github.com/sitespeedio/browsertime/blob/main/CHANGELOG.md#1430---2021-09-16).
* Updated WebPageReplay to new version [#3642](https://github.com/sitespeedio/sitespeed.io/pull/3462).

## 19.4.2 - 2021-09-08
### Fixed
* Updated the Docker container to use Firefox 92 (instead of beta 92)
* Updated the base Docker container to use a newer updated version of Ubuntu 20.04. See [#3456](https://github.com/sitespeedio/sitespeed.io/issues/3456).
## 19.4.1 - 2021-09-06
### Fixed
* Updated to [Browsertime 14.2.1](https://github.com/sitespeedio/browsertime/blob/main/CHANGELOG.md#1421---2021-09-06).
* Updated to AXE 4.3.3
## 19.4.0 - 2021-09-05

### Added
* Add option to ignore robots.txt when crawling. Use `--crawler.ignoreRobotsTxt true` to ignore. Thank you [dammg](https://github.com/dammg) for PR [#3454](https://github.com/sitespeedio/sitespeed.io/pull/3454)!
* Updated to [Browsertime 14.2.0](https://github.com/sitespeedio/browsertime/releases/tag/v14.2.0).
### Fixed
* If generating a HTML file failed, all generation failed. This fixes that and continue with the next file [#3453](https://github.com/sitespeedio/sitespeed.io/pull/3453).

##  19.3.0 - 2021-09-01
### Added
* Upgraded to [Browsertime 14.1.0](https://github.com/sitespeedio/browsertime/blob/main/CHANGELOG.md#1410---2021-09-01) with Chromedriver 93.
* Added Chrome 93 in the Docker container.

### Fixed
* Upgraded to [Browsertime 14.0.3](https://github.com/sitespeedio/browsertime/blob/main/CHANGELOG.md#1403---2021-08-31).
## 19.2.0 - 2021-08-27
### Added
* Upgraded to AXE core 4.3.2 [#3441](https://github.com/sitespeedio/sitespeed.io/pull/3441). 
* Added stddev/median/mean to the metrics side by side page [#3443](https://github.com/sitespeedio/sitespeed.io/pull/3443).
* Added a generic text that we miss out of many metrics for Safari at the moment [#3442](https://github.com/sitespeedio/sitespeed.io/pull/3442).
* Add option to add friendly name to junit test cases. Use `--budget.friendlyName` to set that.  Thank you [Vishal](https://github.com/vishallanke) for the request. Done in PR [#3448](https://github.com/sitespeedio/sitespeed.io/pull/3448).

### Fixed
* Upgrade PerfCascade that catches if an HAR entry is missing content type [#3445](https://github.com/sitespeedio/sitespeed.io/pull/3445).

## 19.1.0 - 2021-08-20
### Added
* You can now see curated metrics side by side for all runs [#3439](https://github.com/sitespeedio/sitespeed.io/pull/3439).
*  The WebPageTest plugin is using the latest (0.5.0) version of the WebPageTest API.
### Fixed
* Upgraded to [Browsertime 14.0.2](https://github.com/sitespeedio/browsertime/blob/main/CHANGELOG.md#1402---2021-08-20).

## 19.0.0 - 2021-08-13
### Changed
* Updated to [Browsertime 14.0.1](https://github.com/sitespeedio/browsertime/blob/main/CHANGELOG.md#1401---2021-08-12). The new 14 version uses Throttle 3.0 that has change if you use it on Mac OS: Updated Throttle 3.0 that do not set throttling on localhost by default on Mac OS. If you run test against a local server or use WebPageReplay on a Mac, you should add `--browsertime.connectivity.throttle.localhost` to your test and it will work as before.

### Added
* Updated to Edge 92 and Edgedriver 92 in the Docker container.
* Updated to Firefox 92 beta in the Docker container to fix the [devtools slowness bug](https://bugzilla.mozilla.org/show_bug.cgi?id=1712983) that was inroduced in Firefox 90. 

## 18.0.1 - 2021-07-29
### Fixed
* Updated to [Browsertime 13.1.4](https://github.com/sitespeedio/browsertime/blob/main/CHANGELOG.md#1314---2021-07-28).
* Added cli parameter for keeping the original video `--videoParams.keepOriginalVideo`. The functionalty already exists but it wasn't exposed in sitespeed.io [#3430](https://github.com/sitespeedio/sitespeed.io/pull/3430).
* The GPSI-plugin has a fix to catch when first input delay data is missing.
* Fix broken tags for InfluxDB when you get Crux data from the GPSI-plugin. [#3429](https://github.com/sitespeedio/sitespeed.io/pull/3429). Data from the plugin has a testType tag that can have the following values: googleWebVitals, score or crux. Crux data has two more tags: metric and experience.

## 18.0.0 - 2021-07-26
### Breaking changes
* Drop support for NodeJS 10.
* If you use Chrome the `--chrome.timeline` is now true by default (you can remove that from your configuration).

### Added
* Updated the Docker container to use Chrome 92.
* Updated to [Browsertime 13.1.1](https://github.com/sitespeedio/browsertime/blob/main/CHANGELOG.md#1300---2021-07-22) (that uses Chromedriver 92).
* Updated to latest PerfCascade so that the waterfall highlights which request that is the largest contentful paint (if its an image) and show render blocking info (if you use Chrome) [#3407](https://github.com/sitespeedio/sitespeed.io/pull/3407). You can checkout the [documentation](https://www.sitespeed.io/documentation/sitespeed.io/browsers/#render-blocking-information) about where to see the render blocking information.
* Show render blocking info in the Page Xray section [#3246](https://github.com/sitespeedio/sitespeed.io/pull/3426).

### Fixed
* Updated to Coach core 6.4.3
## 17.10.0 - 2021-07-16
### Added
* The Docker containers now contains Firefox 89 again. It seems like there's something with 90 that increase First Visual Change, especially when running in Docker. See [https://phabricator.wikimedia.org/T286761](https://phabricator.wikimedia.org/T286761) and [https://bugzilla.mozilla.org/show_bug.cgi?id=1720843](https://bugzilla.mozilla.org/show_bug.cgi?id=1720843).

## 17.9.0 - 2021-07-16

### Added
* Updated to [Browsertime 12.11.0](https://github.com/sitespeedio/browsertime/blob/main/CHANGELOG.md#12110---2021-07-15).
* Updated to Firefox 90 in the browser container [#3420](https://github.com/sitespeedio/sitespeed.io/pull/3420).
* Update to AXE-core 4.2.3 [#3417](https://github.com/sitespeedio/sitespeed.io/pull/3417).
* Added support for Firefox memory report, turn it on with `--firefox.memoryReport` [#3416](https://github.com/sitespeedio/sitespeed.io/pull/3416)
* The +1 container has been updated to use Lightouse 8.1.0.
## 17.8.3 - 2021-07-06
### Fixed
* Updated to [Coach-core 6.4.2](https://github.com/sitespeedio/coach-core/blob/v6.4.2/CHANGELOG.md#642---2021-07-05).
* Updated to [Browsertime 12.10.0](https://github.com/sitespeedio/browsertime/blob/main/CHANGELOG.md#12100---2021-07-05).

## 17.8.2 - 2021-06-27
### Fixed
* Keep selected tab open across runs. Thank you [Tanishq](https://github.com/amtanq) for PR [#3409](https://github.com/sitespeedio/sitespeed.io/pull/3409).
* Update Docker container to use NodeJS 14.7.1.
* Upgraded to [Browsertime 12.9.3](https://github.com/sitespeedio/browsertime/blob/main/CHANGELOG.md#1293---2021-06-24).
* Updated [Coach-core](https://github.com/sitespeedio/coach-core/blob/main/CHANGELOG.md#641---2021-06-23): Use all headers for Wappalyzer (before only the main document was used) 

## 17.8.1 - 2021-06-10
### Fixed
* Updated Browsertime to [12.9.1](https://github.com/sitespeedio/browsertime/blob/main/CHANGELOG.md#1291---2021-06-09) that fixes the problem with running Safari on iOS. However there are still one bug/problem that needs to be fixed with Safari on iOS: recording a video do not work.

* The docker-compose file now uses Grafana 8.0.0
## 17.8.0 - 2021-06-04
### Added
* New [Browsertime 12.9.0](https://github.com/sitespeedio/browsertime/blob/main/CHANGELOG.md#1290---2021-06-04) that updates Cumulative Layout Shift to the [new defintion](https://web.dev/evolving-cls/).

### Fixed 
* Guard if you try to run Safari simulator in Docker [#3405](https://github.com/sitespeedio/sitespeed.io/pull/3405)

## 17.7.0 - 2021-06-03

### Added
* New [Browsertime 12.8.0](https://github.com/sitespeedio/browsertime/blob/main/CHANGELOG.md#1280---2021-06-02) with Edgedriver 91 and updated to Firefox 89 and Edge 91 in the Docker container [#3404](https://github.com/sitespeedio/sitespeed.io/pull/3404).
* Updated to use [Coach-core 6.4.0](https://github.com/sitespeedio/coach-core/blob/main/CHANGELOG.md#640---2021-06-02) that uses wappalyzer-core 6.6.0 and a bug fix that make sure the private assets and cache header advice only checks GET requests.
* The Lighthouse-plugin was updated to 8.0.0 in the +1 container.
### Fixed
* Catch if visual elements do not produce data (special case for amazon.com) [3402](https://github.com/sitespeedio/sitespeed.io/pull/3402).

* Upgrade to AXE-core 4.2.1 [#3396](https://github.com/sitespeedio/sitespeed.io/pull/3396).

### Tech
* Switch to sass instead of node-sass [#3396](https://github.com/sitespeedio/sitespeed.io/pull/3396).

## 17.6.0 - 3

### Added 
* Updated to [Browsertime 12.7.0](https://github.com/sitespeedio/browsertime/blob/main/CHANGELOG.md#1270---2021-05-26) that fixes the problem with the broken CPU throttling in Chrome.
* Chrome and Chromedriver 91. Edge 90 (Eddge 91 coming later this week) in the Docker container

### Fixed
* Display more information about the visual element that you are measuring [#3394](https://github.com/sitespeedio/sitespeed.io/pull/3394). Checkout the [updated documentation](https://www.sitespeed.io/documentation/sitespeed.io/video/#collect-visual-elements-metrics) on how to measure when elements are displayed in the viewport.
## 17.5.0 - 2021-05-21
### Added
* Make it easier to set up budget for Google Web Vitals [#3386](https://github.com/sitespeedio/sitespeed.io/pull/3386)
* Updated dashboards to in the Docker setup.

### Fixed
* New Browsertime [12.6.1](https://github.com/sitespeedio/browsertime/blob/main/CHANGELOG.md#1261---2021-05-21) that fixes a bug when you use a equals sign in the value field in a cookie.  
* Updated dependencies with install warnings [#3387](https://github.com/sitespeedio/sitespeed.io/pull/3387),

## 17.4.0 - 2021-05-14

### Added
* Updated Browsertime and more love for showing better info from LCP and LS [#3381](https://github.com/sitespeedio/sitespeed.io/pull/3381).
* Updated to Lighthouse 7.4.0 in the plus-1 Docker container.

##  17.3.1 - 2021-05-10
### Fixed

* 17.3.0 introduced a bug copying the same screenshot for multiple pages when you use the lateststorer plugin[#3376](https://github.com/sitespeedio/sitespeed.io/pull/3376).
##  17.3.0 - 2021-05-06
### Added
* Updated to Axe-core [4.2.0](https://github.com/dequelabs/axe-core/blob/develop/CHANGELOG.md#420-2021-04-23).
* Show browser window size in runtime setting when using Android/iPhone [#3362](https://github.com/sitespeedio/sitespeed.io/pull/3362).
* Also copy LS and LCP screenshots when using lateststorer plugin [#3371](https://github.com/sitespeedio/sitespeed.io/pull/3371).
* Added colors (red/yellow/green) to Google Web Vitals summary box, using the same limits as set by Crux   [#3370](https://github.com/sitespeedio/sitespeed.io/pull/3370).
* Updated to latest Browsertime and remake on how to show LCP and LS.

### Fixed
* [Do not show undefined when you only set RTT for throttle](https://github.com/sitespeedio/sitespeed.io/commit/5446a8e11424c8170a42533f0e40cbe28bf8a5c4).
* [Fix test running without connectivity settings](https://github.com/sitespeedio/sitespeed.io/commit/3ac3c2ab6885689b6689c6f2974ae7c256be9faf).

## 17.2.0 - 2021-04-27
### Added 
* Show runtime settings in the HTML [#3359](https://github.com/sitespeedio/sitespeed.io/pull/3359). This makes it easier to see what settings are used. We gonna iterate and add more settings later.

* Upgraded to [Browsertime 12.2.0](https://github.com/sitespeedio/browsertime/blob/main/CHANGELOG.md#1220---2021-04-27).

## 17.1.1 - 2021-04-23
### Fixed
* Updated to latest Browsertime that fixes the missing dev-shm flag for Chrome making running Chrome in Docker crash for some sites see [#3357](https://github.com/sitespeedio/sitespeed.io/issues/3357).
## 17.1.0 - 2021-04-20

### Added
* Updated to Firefox 88 in the Docker containers.
## 17.0.1 - 2021-04-17
### Fixed
* Updated Browsertime to 12.0.1 that fixes the problem with Chrome/Chromedriver 90 that introduced longer time to close the browser than earlier versions, so when trying the next run, the previous browser is not closed, fixed by adding a 2 second sleep time when closing the browser.
## 17.0.0 - 2021-04-15 
Woohoo we shipped 17.0.0! There are many changes and you should read through the full changelog and focus on the new best practise section and breaking changes.
### New best practices
One of the new things in 17 is the support for one extra key in Graphite: the name of the test. Set a computer friendly name of your test by using `--slug`. Then use the slug in the graphite key by adding `--graphite.addSlugToKey` to your run. When you do that change, should also convert your graphite data and your dashboards. The plan is like this:
* In April 2021 you can convert your data and use the slug. You need to add `--graphite.addSlugToKey true` else you will get a log warning that you miss the slug for your test. All default dashboards in sitespeed.io will use the slug, so to use them you should add that new key and convert your data.
* In September 2021 `--graphite.addSlugToKey true` will be set to default, meaning if you haven't upgraded your Graphite data yet, you need to set `--graphite.addSlugToKey false` to be able to run as before.
* In November 2021 the CLI functionality will disappear and you need upgrade your Graphite metrics when you upgrade sitespeed.io. 

You can read how to upgrade in the [documentation](https://www.sitespeed.io/documentation/sitespeed.io/graphite/#upgrade-to-use-the-test-slug-in-the-namespace).

When you have updated you will add one extra parameter to your test: `--copyLatestFilesToBase`. When you have done all these step you are ready for ... using the new dashboards in Grafana with screenshot and video from last run. This is SUPER useful to be able to fast see what's going on. Checkout what it looks like [here](https://dashboard.sitespeed.io/d/000000064/page-metrics-mobile?orgId=1) and [here](https://dashboard.sitespeed.io/d/d-pdqGBGdse/wikipedia-login?orgId=1).

We ship [all new dashboards](https://github.com/sitespeedio/grafana-bootstrap-docker/tree/main/dashboards/graphite) with some extra focus on Google Web Vitals (for sitespeed.io, WebPageTest, Google Page Speed Insights, Lighthouse and CRUX). We understand that these metrics is important for some users so lets focus on them. We also ship a couple new example dahsboards for how to setup user journeys. Documentation for those will come soon.

There's a new version of the Coach with a new super important privacy advice: Make sure you disable Chrome's new FLoC for your site. [Read more about FLoC](https://www.eff.org/deeplinks/2021/03/googles-floc-terrible-idea).

### Breaking changes
* We have changed some of the connectivity profiles, you can see the changes [here](https://github.com/sitespeedio/browsertime/pull/1160/files). This means that if you use 3g connectivity using Throttle, your tests will have a faster TTFB than before. If you wanna hold on to the old settings you can do that by adding `--browsertime.legacyConnectivityProfiles true` to your tests.
* If you have a budget using layoutShift that metric has now been renamed to cumulativeLayoutShift.
* Read [the full list](https://github.com/sitespeedio/browsertime/blob/main/CHANGELOG.md#changed) of other changes in Browsertime.

### What to think about when upgrading
You need to do a plan on when you want to upgrade Graphite to be able to use those new dashboards. You can upgrade to 17.0.0 and continue as before but to be able to use the new things in the dashboards you need to [upgrade your Graphite data](https://www.sitespeed.io/documentation/sitespeed.io/graphite/#upgrade-to-use-the-test-slug-in-the-namespace)).

### Other notable changes
Many thanks to [Inderpartap Singh Cheema](https://github.com/inderpartap) that fixed so that you can use `--chrome.blockDomainsExcept` together with WebPageReplay in the Docker container, so you more easily can focus on the performance disregarding 3rd party marketing scripts.

We have a couple of new metrics that is the delta between TTFB and First Contentful Paint, Largest Contentful paint and First visual change [#1528]((https://github.com/sitespeedio/browsertime/pull/1528)). You can use this if you have unstable TTFB and want to alert on front end metrics. The metrics are automatically sent to Graphite.

Lets continue with all the changes.
### Added
* Updated to [Browsertime 12.0.0](https://github.com/sitespeedio/browsertime/blob/main/CHANGELOG.md#1200---2021-04-15) with the following changes:
  * Display standard deviation instead of the home made median deviation in the cli output [#1529](https://github.com/sitespeedio/browsertime/pull/1529).
  * Renamed layoutShift to the more correct cumulativeLayoutShift. This will is a breaking change if you use that metric. Updates to the new and coming layout shift changes announced by Google will be implemented the coming weeks.
  * Updated Chrome start flags on desktop following [best practices](https://github.com/GoogleChrome/chrome-launcher/blob/master/docs/chrome-flags-for-tools.md) and removing old flags [#1507](https://github.com/sitespeedio/browsertime/pull/1507).
  * Updated Chrome start flags on Android following [best practices](https://github.com/GoogleChrome/chrome-launcher/blob/master/docs/chrome-flags-for-tools.md) and removing old flags [#1506](https://github.com/sitespeedio/browsertime/pull/1506).
  * Finally the "new" connectivity settings are default. You can see the difference in https://github.com/sitespeedio/browsertime/blob/main/lib/connectivity/trafficShapeParser.js#L5-L104. Changed in [#1540](https://github.com/sitespeedio/browsertime/pull/1540). If you wanna run with the legacy setting use `--legacyConnectivityProfiles`. See [#1160](https://github.com/sitespeedio/browsertime/pull/1160) for the original change.
  * The default minimum wait time for waiting if a test is finished is now 8 seconds (instead of 5) [#1542](https://github.com/sitespeedio/browsertime/pull/1542).
  * Fix `--chrome.blockDomainsExcept` when you are using WebPageReplay [#1532](https://github.com/sitespeedio/browsertime/pull/1532). Thank you [Inderpartap Singh Cheema](https://github.com/inderpartap) for the original fix!
  * Make sure gnirehtet is closed on the right device using device id [#1527](https://github.com/sitespeedio/browsertime/pull/1527)
  * Upgraded to GeckoDriver 0.29.1.
  * Updated wpr_cert.pem to a new version for WebPageReplay [#1316](https://github.com/sitespeedio/browsertime/pull/1316).
  * Include Google Web Vitals in the HAR file [#1535](https://github.com/sitespeedio/browsertime/pull/1535).
  * Added 3 seconds wait time for geckoprofiler to start see [#1538](https://github.com/sitespeedio/browsertime/issues/1538) and [#1539](https://github.com/sitespeedio/browsertime/pull/1539)
  * Added a ten seconds wait if getting the HAR from Firefox fails the first time [#1546](https://github.com/sitespeedio/browsertime/pull/1546) fixes [#3346](https://github.com/sitespeedio/sitespeed.io/issues/3346).
  * New metrics: Delta between TTFB and First Contentful Paint, Largest Contentful paint and First visual change [#1528](https://github.com/sitespeedio/browsertime/pull/1528). You can use this if you have unstable TTFB and want to alert on front end metrics. Lets see when other also implement this :)
  * Made it easier for people to get Google Web Vitals. We copy that data under the googleWebVitals namespace in the result JSON [#1521](https://github.com/sitespeedio/browsertime/pull/1521).
  * Added TTFB as a single metric [#1522](https://github.com/sitespeedio/browsertime/pull/1522).
  * New stop watch command [#1512](https://github.com/sitespeedio/browsertime/pull/1512). Measure time by: 
    ```const timer = commands.stopWatch.get('my_timer'); 
       timer.start(); 
      // Do something
      // Stop the timer and add the result to the last tested URL
      timer.stopAndAdd();
    ```
  * Pre test/warm a URL with `--preWarmServer`. Do that to make sure your server has cached everything that is needed before your test [#1515](https://github.com/sitespeedio/browsertime/pull/1515) and [#1516](https://github.com/sitespeedio/browsertime/pull/1516).
  * Collect what HTML element change in cumulative layout shifts [#1534](https://github.com/sitespeedio/browsertime/pull/1534)
  * Added support for recording video on Safari iOS [#1541](https://github.com/sitespeedio/browsertime/pull/1541).
  * New commands: scrolling by Pixels, Lines or Pages forward, back or refresh navigations, create new tabs or windows and switch to them and new mouse events such as context click, single click, double click, click and hold, release, and movement. Thank you [Denis Palmeiro](https://github.com/dpalmeiro) for PR [#1533](https://github.com/sitespeedio/browsertime/pull/1533).
  * Improve proxy configuration support, thank you [Olaf Meeuwissen](https://github.com/paddy-hack) for PR [#1542](https://github.com/sitespeedio/browsertime/pull/1524).
  * Upgraded to Selenium 4.0.0-beta.3 [#1544](https://github.com/sitespeedio/browsertime/pull/1544).
  * Updated to Chrome 90 in the Docker container and Chromedriver 90 as default [#1543](https://github.com/sitespeedio/browsertime/pull/1543).
* Added `--preWarmServer` that makes a request to your web server to fill the server cache before you start your tests.
* Send navigation timings metrics by default to Graphite/Influx [#3316](https://github.com/sitespeedio/sitespeed.io/pull/3316).
* Updated the wpt-plugin to send TBT and CLS to data storage.
* Updated the Lighthouse plugin to send Goggle Web Vitals to data storage.
* Updated to Lighthouse 7.3.0 in the Lighthouse plugin.
* Lighthouse and GPSI plugins published to npm
* Updated the GPSI plugin to send Google Web Vitals to data storage (and show it in the HTML).
* Renamed layouShift to cumulativeLayoutShift
* Send TTFB and Google Web Vitals by default to data storage for Browsertime (making it easier to find them in Influx).

### Fixed
* Updated to [latest aws-sdk](https://github.com/sitespeedio/sitespeed.io/commit/427d69f7de5417fa0fd6e305457c61f4ab634811) , google cloud storage and axe-core 4.1.4 [#3334](https://github.com/sitespeedio/sitespeed.io/pull/3334)
* Updated to latest Coach and PageXray.

## 16.10.3 - 2021-03-17
### Fixed
* Updated to Browsertime 11.6.3 since last version broke getting the netlog on desktop for Chrome.
## 16.10.2 - 2021-03-17
### Fixed
* Added missing download link in the HTML for the Chrome netlog [#3315](https://github.com/sitespeedio/sitespeed.io/pull/3315)
## 16.10.1 - 2021-03-17
### Fixed
* Updated to [Browsertime 11.6.2](https://github.com/sitespeedio/browsertime/blob/main/CHANGELOG.md#1162---2021-03-17) with new Selenium beta 4 and a fix for getting the netlog for Chrome on Android.

## 16.10.0 - 2021-03-11

### Added
* Updated to [Browsertime 11.6.0](https://github.com/sitespeedio/browsertime/blob/main/CHANGELOG.md#1160---2021-03-08) with Chromedriver 89, Edgedriver 89.
* Updated Docker containers to use Chrome 89 and Firefox 86.

### Fixed
* The Lighthouse plugin was upgraded to Lighthouse 7.2.0 and fixed broken support for alias.
* Updated to AXE-core 4.1.3 [#3302](https://github.com/sitespeedio/sitespeed.io/pull/3302).
* More fixes for showing correct screenshots [#3305](https://github.com/sitespeedio/sitespeed.io/pull/3305) and [#3306](https://github.com/sitespeedio/sitespeed.io/pull/3306).
* Updated to Browsertime 11.6.1 that makes sure TSProxy uses Python2 when you run in a Docker container.
## 16.9.2 - 2021-02-24
### Fixed
* Another screenshot fix, to make sure we support whatever image format when we copy the image from the last run [#3290](https://github.com/sitespeedio/sitespeed.io/pull/3290).
## 16.9.1 - 2021-02-24
### Fixed
* The screenshot fix in 16.9.0 introduced an error when you copy latest images to the parent dir (upcoming feature in 17.0). Fixed in [#3288](https://github.com/sitespeedio/sitespeed.io/pull/3288).
## 16.9.0 - 2021-02-24
### Added
* Upgraded to Coach core 6.1 that finds Google reCAPTCHAs [#3284](https://github.com/sitespeedio/sitespeed.io/pull/3284).
* Upgraded to Browsertime 11.5.0 that makes it easier to use gnirehtet [#3281](https://github.com/sitespeedio/sitespeed.io/pull/3281).

### Fixed
* Upgraded to AXE-core 4.1.2 [#3282](https://github.com/sitespeedio/sitespeed.io/pull/3282)
* Screenshots was not shown in the screenshot tab as reported in [#3286](https://github.com/sitespeedio/sitespeed.io/issues/3286) fixed in [#3278](https://github.com/sitespeedio/sitespeed.io/pull/3287).
## 16.8.1 - 2021-02-12
### Fixed
* Avoid sending slug/domain annotation names that collide. Fixed in [#3279](https://github.com/sitespeedio/sitespeed.io/pull/3279) and reported in [#3277](https://github.com/sitespeedio/sitespeed.io/issues/3277).
## 16.8.0 - 2021-02-08
### Added
* Updated Browsertime with the ability to mark a run as a failure. We gonna add more docs and try this ourselves and push it in 17.0 [#3272](https://github.com/sitespeedio/sitespeed.io/pull/3272).
* Updated to latest VideoJS and changed how the video is displayed [#3268](https://github.com/sitespeedio/sitespeed.io/pull/3268).
### Fixed
* The `--addSlugToKey` command introduced 16.3.0 was broken and inserted the slug at the wrong place. Fixed now and we gonna push it and the documentation on how to use it in 17.0 [#3274](https://github.com/sitespeedio/sitespeed.io/pull/3274).

## 16.7.1 - 2021-02-02
### Fixed
* Updated to Browsertime 11.3.1 that open/closes the iOS simulator at the start/end of the test.
## 16.7.0 - 2021-02-01
### Added
* Updated to Browsertime 11.3.0 with better iOS simulator support. There are still some work to do, but you can try it out with `sitespeed.io https://www.wikipedia.org -b safari --safari.useSimulator --safari.deviceUDID YOUR_DEVICE_ID --video --visualMetrics`. List your device ids with `xcrun simctl list devices`.
## 16.6.0 - 2021-01-25
### Added
* Upgraded to Browsertime 11.2.0 with support for listening on events for CDP in scripting.
## 16.5.0 - 2021-01-20
### Added
* Upgraded to Chrome 88 in the Docker container and updated Browsertime that uses Chromedriver 88. Also upgraded Browsertime to 11.1.2 that fixes a bug if Browsertime do not collect any metrics, that broke testing with WebPageReplay.

## 16.4.0 - 2021-01-20
### Added
* Added support for GCS to also upload latest screenshots/video [#3258](https://github.com/sitespeedio/sitespeed.io/pull/3258)-
* Automatically create a result base URL if you upload to GCS (and do not configure one) [#3259](https://github.com/sitespeedio/sitespeed.io/pull/3259).
* Include index.html when we log the link to the S3/GCS result bucket to make it easier to copy/paste [#3260](https://github.com/sitespeedio/sitespeed.io/pull/3260).

### Fixed
* Updated to [Browsertime 11.0.2](https://github.com/sitespeedio/browsertime/releases/tag/v11.0.2) that hopefully fixes the problem when you use an alias in scripting and the URL change between runs.

## 16.3.2 - 2021-01-14
### Fixed
* Make sure the right connectivity name is picked up for the latest copied file. Before the fix using alias for your connectivity didn't work [#3255](https://github.com/sitespeedio/sitespeed.io/pull/3255).
## 16.3.1 - 2021-01-14

### Fixed
* Fixed broken URL in Slack message (if you used an alias) [#3254](https://github.com/sitespeedio/sitespeed.io/pull/3254)
*  Make sure alias from the cli, from file or from script is handled the same way [#3253](https://github.com/sitespeedio/sitespeed.io/pull/3253).
* Added missing slug in annotation [#3251](https://github.com/sitespeedio/sitespeed.io/pull/3251).
* Add missing browser/connectivity name in the latest files [#3249](https://github.com/sitespeedio/sitespeed.io/pull/3249).

## 16.3.0 - 2021-01-13
### Added
There's a couple of new functionality that will have documentation in a week or two. Until then do not use it :)

* You can now use `--addSlugToKey` to add the `--slug` to your Graphite key. It will be appended to your _graphite.namespace.pageSummary_ [#3240](https://github.com/sitespeedio/sitespeed.io/pull/3240).
* New plugin to copy screenshots [#3243](https://github.com/sitespeedio/sitespeed.io/pull/3243) and videos [#3248](https://github.com/sitespeedio/sitespeed.io/pull/3248) as latest for that run.
* Upload latest screenshots/videos to S3 [#3246](https://github.com/sitespeedio/sitespeed.io/pull/3246).
### Fixed
* The HTML links to pages when using alias in a text file was broken as reported in [#3244](https://github.com/sitespeedio/sitespeed.io/issues/3244), fixed in PR [#3245](https://github.com/sitespeedio/sitespeed.io/pull/3245).  
##  16.2.1 - 2021-01-06
### Fixed 
* The new `--graphite.annotationRetentionMinutes` formatted the annotation date wrong, fixed in [#3238](https://github.com/sitespeedio/sitespeed.io/pull/3238).
##  16.2.0 - 2021-01-06
### Fixed
* Update example carbon.conf to disable tags by default and a better retention example [#3229](https://github.com/sitespeedio/sitespeed.io/pull/3229).
* Updated to [Browsertime 11.0.1](https://github.com/sitespeedio/browsertime/blob/main/CHANGELOG.md#1101---2021-01-05) that makes it possible to choose Edge binary.
* Safer check for Crux data if a domain do not exists in Crux [#3234](https://github.com/sitespeedio/sitespeed.io/pull/3234).
### Added
* Skip sending summary information to Graphite using `--graphite.skipSummary` [#3230](https://github.com/sitespeedio/sitespeed.io/pull/3230).
* Collect third party cookie info and send it by default to data storage [#3231](https://github.com/sitespeedio/sitespeed.io/pull/3231).
* Configure your retention policy for your Graphite data, that makes it possible to match annotations and Graphite metrics data points using `--graphite.annotationRetentionMinutes` [#3235](https://github.com/sitespeedio/sitespeed.io/pull/3235). You should probably wait using this until we have updated our documentation.

## 16.1.0 - 2020-12-31
### Added
* Updated to latest (1.1.7-9) Graphite in the Docker compose file and disabled tags by default.

### Fixed
* Using alias from the CLI didn't work correctly since 16.0.0 [#3227](https://github.com/sitespeedio/sitespeed.io/pull/3227).

##  16.0.2 - 2020-12-28
### Fixed
* Fix correct path for filmstrips when you use an alias [#3225](https://github.com/sitespeedio/sitespeed.io/pull/3225). In 16.0.0 the path to screenshots in the film strip was broken in the HTML if you use an alias for a URL.
##  16.0.1 - 2020-12-22
### Fixed
* There was a bug in 16.0.0 if you used an alias for a URL in a script that caused the test to fail. Fixed in [#3222](https://github.com/sitespeedio/sitespeed.io/pull/3222) and [#3223](https://github.com/sitespeedio/sitespeed.io/pull/3223).
##  16.0.0 - 2020-12-21

### Changed
* Moved the WebPageTest plugin to a new repo: https://github.com/sitespeedio/plugin-webpagetest [#3205](https://github.com/sitespeedio/sitespeed.io/pull/3205). If you use WebPageTest either need to install the plugin or run the new WebPageTest container. Read the [updated documentation](https://www.sitespeed.io/documentation/sitespeed.io/webpagetest/).
* The Coach has dropped the accessibility advice. Instead use AXE, enable it with `--axe.enable`.
* We removed RUM-Speed Index.

### Added
* Introducing slug for your test and a new experimental setup [#3203](https://github.com/sitespeedio/sitespeed.io/pull/3203).
* Highlight Google Web Vitals [#3204](https://github.com/sitespeedio/sitespeed.io/pull/3204).
* Clicking on show/hide on the Coach result now also shows the Coach advice description [#3211](https://github.com/sitespeedio/sitespeed.io/pull/3211).
* Add quick links within result pages to make it easier to find metrics [#3213](https://github.com/sitespeedio/sitespeed.io/pull/3213).
* Show image for LCP and Element Timing images [#3216](https://github.com/sitespeedio/sitespeed.io/pull/3216).
* Updated to the [Coach 6.0.0](https://github.com/sitespeedio/coach-core/blob/main/CHANGELOG.md#600---2020-12-18) [#3194](https://github.com/sitespeedio/sitespeed.io/pull/3194):
  * Added Element Timings, Paint Timings and Largest Contentful Paint [#16](https://github.com/sitespeedio/coach-core/pull/16).
  * Added CLS advice [#18](https://github.com/sitespeedio/coach-core/pull/18).
  * Added Long Task advice [#17](https://github.com/sitespeedio/coach-core/pull/17).
  * Added support for HTTP3 [#26](https://github.com/sitespeedio/coach-core/pull/26).
  * New info section where we share info third party statistics from third party web [#29](https://github.com/sitespeedio/coach-core/pull/29).
  * New technology section with where Wappalyzer is used to get info [#28](https://github.com/sitespeedio/coach-core/pull/28).
  * Added advice to avoid third party cookies [#39](https://github.com/sitespeedio/coach-core/pull/39).
  * Upgraded to PageXray 3.0.0 [#38](https://github.com/sitespeedio/coach-core/pull/38).
  * Added advice to avoid fingerprinting [#37](https://github.com/sitespeedio/coach-core/pull/37).
  * Remove RUM Speed Index [#12](https://github.com/sitespeedio/coach-core/pull/12).
  * Remove First Paint and timings calculated from the Navigation Timing API [#15](https://github.com/sitespeedio/coach-core/pull/15).
  * Removed the advice for PUSH [#26](https://github.com/sitespeedio/coach-core/pull/26).
  * Removed the accessibility advice [#32](https://github.com/sitespeedio/coach-core/pull/32). If you are a sitespeed.io use `--axe`. It's better to use AXE-core that gives better advice than the old coach advice.
  * Fully use the third-party-web to know about third parties instead of home grown solution.
  * Testing for JQuery removed the $ reference on the page [#22](https://github.com/sitespeedio/coach-core/pull/22).
* Updated to [Browsertime 11](https://github.com/sitespeedio/browsertime/blob/main/CHANGELOG.md#1100---2020-12-18):
  * Record and keep the browser full screen (including URL bar) [#1435](https://github.com/sitespeedio/browsertime/pull/1435). All metrics should stay the same with this change but the video and the code will be easier :) When we implemented video a long time ago we wanted to cut out the URL bar but it made it harder to keep the video to look ok on different OS. 
  * Say goodbye to RUM Speed Index [#1439](https://github.com/sitespeedio/browsertime/pull/1439).
  * Domain name on disk now uses underscore instead of dots in the name [#1445](https://github.com/sitespeedio/browsertime/pull/1445).
  * Click the Android power button at the start of each test (instead of the home button [#1447](https://github.com/sitespeedio/browsertime/pull/1447).
  * Added a two minute timeout to get Geckoprofiler data [#1440](https://github.com/sitespeedio/browsertime/pull/1440).
  * Made sure HAR stuff respect the skipHar flag [#1438](https://github.com/sitespeedio/browsertime/pull/1438)
  * Fix process ID fetch for Galaxy S5, thank you [Michael Comella](https://github.com/mcomella) for PR [#1449](https://github.com/sitespeedio/browsertime/pull/1449)
  * If a web page timed out in Chrome, we missed to report that as an error, fixed in [#1453](https://github.com/sitespeedio/browsertime/pull/1453).
  * Automatically close "System not responding"-popup on Android if it exists [#1444](https://github.com/sitespeedio/browsertime/pull/1444).
  * Add support using alias from CLI and use alias as folder name on disk [#1443](https://github.com/sitespeedio/browsertime/pull/1443).
  * New option to store a more flat structure on disk converting the path part of the URL to one folder `--storeURLsAsFlatPageOnDisk`[#1450](https://github.com/sitespeedio/browsertime/pull/1450)
  * Updated to Selenium 4.0.0-alpha.8 [#1451](https://github.com/sitespeedio/browsertime/pull/1451).
  * Updated to Edgedriver 87
* Updated to [PageXray 4.0.0](https://github.com/sitespeedio/pagexray/blob/main/CHANGELOG.md#version-400-2020-12-12) that fixes counting cookies.
* Added Edge in the Docker container.
* Upgraded to AXE-core 4.1.1.
* The [GPSI-plugin](https://github.com/sitespeedio/plugin-gpsi) in the plus1 container now batches jobs, sending 10 jobs at a time.
* The [Lighthouse-plugin](https://github.com/sitespeedio/plugin-lighthouse) in the plus1 container uses Lighthouse 7.0.0 (checkout the Lighthouse [changelog](https://github.com/GoogleChrome/lighthouse/releases/tag/v7.0.0) for breaking changes).

### Fixed
* Only show Element Timing and User Scripting section if we have those metrics [#3212](https://github.com/sitespeedio/sitespeed.io/pull/3212).

### Upgrade from 15.X to 16.0
* If you are using the WebPageTest plugin you need to either install it yourself from https://github.com/sitespeedio/plugin-webpagetest or use the (new) WebPageTest container: `docker run --rm -v "$(pwd)":/sitespeed.io sitespeedio/sitespeed.io:16.0.0-webpagetest https://www.sitespeed.io --plugins.add /webpagetest --webpagetest.key KEY`

##  15.9.0 - 2020-11-18
### Added
* Updated to Chrome 87 in the Docker container
* Updated to latest Browsertime with Chromedriver 87.
* Added latest Browsertime [10.9.0](https://github.com/sitespeedio/browsertime/releases/tag/v10.9.0) with fixes for Firefox.

## 15.8.0 - 2020-11-17
### Added 
* Updated to Firefox 83 in the Docker container.
## 15.7.4 - 2020-11-16
### Fixed
* Upgraded Browsertime that reverted Geckodriver to 0.27.0 since there are problems starting Firefox on Android using 0.28.0. 
## 15.7.3 - 2020-11-11
### Fixed
* Upgraded to Browsertime 10.6.5 with a new version of Geckodriver for Firefox.

## 15.7.2 - 2020-11-06
### Fixed
* Filmstrips are only stored to disk if we collect visual metrics using trace so we missed out on a configuration, that made us log error trying to get filmstrips that don't exist[#3188](https://github.com/sitespeedio/sitespeed.io/pull/3188).
* Sending data to Matric sometimes failed when Matrix is overloaded. We now retry three times with a backoff of 5 seconds [#3189](https://github.com/sitespeedio/sitespeed.io/pull/3189).

## 15.7.1 - 2020-11-05
### Fixed
* If a budget fails, log info instead of error [#3185](https://github.com/sitespeedio/sitespeed.io/pull/3185) and use error logs only for technical failures.

## 15.7.0 - 2020-11-05
### Added
* New feature: You can remove data for URLs that pass your budget using `--budget.removePassingResult`. Why do you want to do that? One use case is that you crawl your site with a budget. You test 200 pages and 5 of them fails, then you don't need the video/HTML for all those 195 pages that passed your test. But the data for the URLs that failed are interesting [#3175](https://github.com/sitespeedio/sitespeed.io/pull/3175).

* Send messages to [Matrix](https://matrix.org) [clients](https://matrix.org/clients/). As a start you can send all error messages and/or budget result message. The errors makes it easier for you to keep track that your tests is working. The budget helps you to get reports on pages that fails your budget (blog post coming up). To send messages to Matrix you need to setup  `--matrix.host`, `--matrix.accessToken` and `--matrix.room `.  You can also finetune what messages to send with `--matrix.messages` and `--matrix.rooms`to send route messages to specific rooms. More about that when the documentation is updated [#3086](https://github.com/sitespeedio/sitespeed.io/pull/3086).

### Tech
* We added a new messgage *prepareToRender* that happens after the *summarize* step and before the *render* message in the queue. That way your plugin can do stuff before it renders content. It helps us to make it possible to remove test data for URLs that passes your performance budget [#3172](https://github.com/sitespeedio/sitespeed.io/pull/3172).

* Added a new plugin: The remove plugin. The remove plugin can remove test artifacts for URLs. It is used to remove passing URLs in your budget [3173](https://github.com/sitespeedio/sitespeed.io/pull/3173 ). Support for removing HTML/Slack data for a URL was added in [#3174](https://github.com/sitespeedio/sitespeed.io/pull/3174).

* Updated dependencies: google-cloud/storage, aws-sdk, dayjs, influx and uuid [#3184](https://github.com/sitespeedio/sitespeed.io/pull/3184).

## 15.6.4 - 05
### Fixed
* Upgraded to [Browsertime 10.6.4](https://github.com/sitespeedio/browsertime/blob/main/CHANGELOG.md#1064---2020-10-28).
* Fix how file path is built, follow how we do it in Browsertime [#3171](https://github.com/sitespeedio/sitespeed.io/pull/3171).

## 15.6.3 - 2020-10-27
### Fixed
* Upgraded to [Browsertime 10.6.3](https://github.com/sitespeedio/browsertime/blob/main/CHANGELOG.md#1063---2020-10-26) that fixes the bug of navigating to the same URL twice (or more) in the same

## 15.6.2 - 2020-10-23
### Fixed
* Make sure we catch all possible errors from Browsertime (like Android phones not being connected) and send an error message on the queue [#3170](https://github.com/sitespeedio/sitespeed.io/pull/3170).
* Updated to Browsertime 10.6.2 with better error handling if navigation fails.

## 15.6.1 - 2020-10-21
### Fixed
* Updated to Browsertime 10.6.1.
* Fixed dependencies with security audits that could be automatically fixed.
 
## 15.6.0 - 2020-10-20
### Added 
* Updated to Firefox 82 in the Docker container.
* Updated to [Browsertime 10.6.0](https://github.com/sitespeedio/browsertime/blob/main/CHANGELOG.md#1060---2020-10-20).

### Fixed
* Fixed broken slim container [#3166](https://github.com/sitespeedio/sitespeed.io/pull/3166).

## 15.5.1 - 2020-10-20
### Fixed
* Fixed broken link in meta data and Slack to screenshot [#3163](https://github.com/sitespeedio/sitespeed.io/pull/3163).

## 15.5.0 - 2020-10-15
### Added
* Updated to [Browsertime 10.5.0](https://github.com/sitespeedio/browsertime/blob/main/CHANGELOG.md#1050---2020-10-15) with Edgedriver 86.

## 15.4.1 - 2020-10-13
### Fixed
* Updated to Browsertime 10.4.1 that fixes to that `-vvv` enables trace log level for Marionette when you use Firefox [#1405](https://github.com/sitespeedio/browsertime/pull/1405).

## 15.4.0 - 2020-10-08
### Added
* New Browsertime 10.4.0 with Chromedriver 86 and Chrome 86 in the Docker container.

## 15.3.0 - 2020-10-06
### Added
* Upgraded to [Browsertime 10.3.0](https://github.com/sitespeedio/browsertime/blob/main/CHANGELOG.md#1030---2020-10-03) with the following fixes:
  * Add option to navigate with WebDriver instead of window.location with `--webdriverPageload`. Thank you [Andrew Creskey](https://github.com/acreskeyMoz) for the PR [#1396](https://github.com/sitespeedio/browsertime/pull/1396).
  * Add option for specifying logging format in visualmetrics.py. Thank you [Gregory Mierzwinski](https://github.com/gmierz) for the PR throttl[#1399](https://github.com/sitespeedio/browsertime/pull/1399).
  * Fix bufferSize to proper 100MB default size for Geckoprofiler, thank you [dpalmeiro](https://github.com/dpalmeiro) for the PR [#1394](https://github.com/sitespeedio/browsertime/pull/1394).
  * Max number of tries to check battery temperature on Android to make sure a test doesn't wait forever to run [#1401](https://github.com/sitespeedio/browsertime/pull/1401).

## 15.2.0 - 2020-09-23
### Added
* Firefox 81 in the Docker and Docker slim container.

## 15.1.0 - 2020-09-22
### Added
* Upgraded to [Browsertime 10.1.0](https://github.com/sitespeedio/browsertime/blob/main/CHANGELOG.md#1010---2020-09-22) that reverts the Long Tasks API change in Chrome and add some more love for running tests on Android.

## 15.0.0 - 2020-09-21

The new sitespeed.io 15.0 uses the brand new Browsertime 10! Browsertime mainly included technical changes to make it easier to maintain Browsertime and focus on making Browsertime run faster. We also tried to minimize the run time when you record a video, to make sure your tests run faster and save CPU time. You can [read all about the changes in the changelog](https://github.com/sitespeedio/browsertime/blob/main/CHANGELOG.md#1000---2020-09-20).

### Breaking changes
* If you collect visual metrics, we do not calculate Contentful Speed Index and Perceptual Speed Index by default any more. Turn them on by using `--browsertime.visualMetricsPerceptual` and `--browsertime.visualMetricsContentful`. This will make your testing faster by default.

### Added
* The +1 container now uses Lighthoue 6.3.0 [plugin-lighthoue #61](https://github.com/sitespeedio/plugin-lighthouse/pull/61).

* Upgraded AXE-core to 4.0.2.

## 14.4.0 - 2020-08-27
### Added
* Updated the Docker container to use Chrome 85 and Firefox 80. Updated the slim container to use Firefox 80. 
* Updated to Browsertime 9.4.0 that includes Chromedriver 85.

### Fixed
* Fix so its easier to run Chrome on Android with WebPageReplay [#3134](https://github.com/sitespeedio/sitespeed.io/pull/3134).

## 14.3.2 - 2020-08-24
### Fixed
* Upgraded to [Browsertime 9.3.1](https://github.com/sitespeedio/browsertime/blob/main/CHANGELOG.md#931---2020-08-24) that fixes a bug so that correct mobile emulation settings is set on Chrome, updated Throttle to 2.0.1 and update a couple of other packages. 

## 14.3.1 - 2020-08-24
### Fixed
* Log at info level (not error) when Crux data is missing [#3133](https://github.com/sitespeedio/sitespeed.io/pull/3133).
* Do not log error if you only collect origin data from Crux [#3130](https://github.com/sitespeedio/sitespeed.io/pull/3130).

## 14.3.0 - 2020-08-18
### Fixed
* Fixed broken page weight in the Slack message.
* Fix HTML plugin when using "browsertime.chrome.visualMetricsUsingTrace" - thank you MasonM for the PR [#3125 ](https://github.com/sitespeedio/sitespeed.io/pull/3125).

### Added
* Updated to [Browsertime 9.3.0](https://github.com/sitespeedio/browsertime/blob/main/CHANGELOG.md#930---2020-08-17).
* Updated third-party-web 0.12.2.
* Updated AXE-core to 4.0.1.

## 14.2.3 - 2020-07-31
* Updated to [Browsertime 9.2.1](https://github.com/sitespeedio/browsertime/blob/main/CHANGELOG.md#921---2020-07-31)
* If Visual Metrics was turned on and you trid to add your own columns on the pags page, three Visual Metrics was alwasy added as reported in [#3111](https://github.com/sitespeedio/sitespeed.io/issues/3111) and fixed in PR [#3112](https://github.com/sitespeedio/sitespeed.io/pull/3112).

* np/npm/slow internet glitches made 14.2.2 and 14.2.0 releases broken.

## 14.2.1 - 2020-07-28
### Added
* Updated to Firefox 79 in the Docker slim container and in the default container.
* Add unit to Slack summary, thank you [Lise Bilhaut](https://github.com/lbilhaut) for PR [#3102](https://github.com/sitespeedio/sitespeed.io/pull/3102).
* Let GCS and S3 send a setup message on startup so other plugins knows that they are configured [#3101](https://github.com/sitespeedio/sitespeed.io/pull/3101).

## 14.1.0 - 2020-07-18
### Added
* Updated to Chromedriver and Edgedriver 84. Chrome 84/Firefox 78 in the Docker container [#3089](https://github.com/sitespeedio/sitespeed.io/pull/3089).
* Be less strict about GCS options in respect of ADC. Within Google Cloud, services can make use of Credentials-"Auto Discovery" (ADC). The @google-cloud/storage library supports this and tries an automatic discovery when keyFilename is unset. In an auto-discover scenario projectId is discovered as well so this should also be allowed to not be set. The --gcs.bucketname option could be kept as a (mandatory) signal to use GCS at all. Thank you [Stephan Scheying](https://github.com/scheying) for the PR [#3087](https://github.com/sitespeedio/sitespeed.io/pull/3087)!
* Send the performance budget result in the queue. Look for messages of the type **budget.result**. This will make it easier for plugins (like Slack and Matrix) to post messages about the budget result. [#3085](https://github.com/sitespeedio/sitespeed.io/pull/3085).

### Fixed
* Updated minor versions for dependencies google-cloud/storage, aws-sdk, dayjs, uuid and yargs [#3090](https://github.com/sitespeedio/sitespeed.io/pull/3090).
* Fix low severity issues in dependencies [#3091](https://github.com/sitespeedio/sitespeed.io/pull/3091).

## 14.0.0 - 2020-07-09

Let us celebrate over [10 million downloads](https://hub.docker.com/v2/repositories/sitespeedio/sitespeed.io/) of the sitespeed.io Docker container and release sitespeed.io 14 and Browsertime 9!

Read all about the changes in the [14.0 blog post](https://www.sitespeed.io/sitespeed.io-14.0-browsertime-9.0/).

There are five important new things in the new release:
* New updated Grafana dashboards with all the goodies from [Grafana 7.0](https://grafana.com/docs/grafana/latest/guides/whats-new-in-v7-0/). All Graphite dashboards is updated: sitespeed.io dashboards, WebPageTest and our plus-1 dashboard.
* You can now see **all** screenshots for a run in sitespeed.io! This is super useful when you use scripting to test a user journey. You can take screenshots whenever you need and see the result on the result page, making it even easier then before to know what's going on.
* We have a new section in the documentation: [web performance testing in practice focusing in synthetic testing]({https://www.sitespeed.io/documentation/sitespeed.io/web-performance-testing-in-practice/)! I've think this is the most comprehensive guide to synthetic testing that's out there.
* You can [support us at Open Collective](https://opencollective.com/sitespeedio)! We need money to be able to run our test servers, run tests on mobile devices and use a dedicated bare metal server. Helping us with that will make sure we continue to release a bug free, feature rich Open Source tool!
* You can get CrUx data direct from sitespeed.io (avoid using the +1 container) with the new [crux-plugin](https://www.sitespeed.io/documentation/sitespeed.io/crux/).

### Breaking changes
* If you use the JSON directly from Browsertime, the screenshot data is now an array instead of a string since you can have multiple screenshots in one run. If you use sitespeed.io directly you will not be affected by the change.

* The experimental flag for perIteration metric for Graphite [#3069](https://github.com/sitespeedio/sitespeed.io/pull/3069) has been removed. If you want to send per iteration data to Graphite use ```--graphite.perIteration```.  

### Added
* All dashboards for Graphite has been updated to use Grafana 7.0.0 with a new look and feel. 
* Show all screenshots for a run in a tab [#3045](https://github.com/sitespeedio/sitespeed.io/pull/3045).
* Updated to [Browsertime 9.0.0](https://github.com/sitespeedio/browsertime/blob/main/CHANGELOG.md#900----2020-06-26).
* There's a Chrome User Experience Report plugin bundled in sitespeed.io! Get the CrUx data using ```--crux.key``` and get your key from Google.
* The +1 container uses Lighthouse 6.1.0.

### Fixed
* Set user agent for ```--mobile``` on Chrome [#3046](https://github.com/sitespeedio/sitespeed.io/pull/3046)
* Updated dependencies: axe-core 3.5.5, dayjs 1.8.28, influx 5.5.2, simplecrawler 1.1.9, yargs 15.3.1, Pug 3, AWS 2.701.0, fs-extra 9.0.1, uuid 8.1.0, google-cloud/storage 5.1.1, third party web 0.12.0, cli-color 2.0.0, coach-core, PageXray and Throttle.
* Fixed using LCP in budget [#3074](https://github.com/sitespeedio/sitespeed.io/pull/3074).

## 13.3.2 - 2020-06-18
### Fixed
* Updated the WebPageTest API that has fixed the security dependencies [#3044](https://github.com/sitespeedio/sitespeed.io/pull/3044).


## 13.3.1 - 2020-06-13
### Fixed
* Testing multiple URLs in one script resulted in only one annotation in InfluxDB as reported in [#2998](https://github.com/sitespeedio/sitespeed.io/issues/2998). The problem was (hopefully) that all annotations was sent with the same timestamp. Now the timestamp from the browsertime run for that URL is used. PR [#3038](https://github.com/sitespeedio/sitespeed.io/pull/3038).

## 13.3.0 - 2020-06-04
### Added
* Updated to [Browsertime 8.14.0](https://github.com/sitespeedio/browsertime/blob/main/CHANGELOG.md#8140---2020-06-03) that fixes broken MS Edge support.

### Fixed
* Support the old budget format too in JUnit and Tap [#3022](https://github.com/sitespeedio/sitespeed.io/pull/3022)

## 13.2.0 - 2020-06-02
### Added
* Upgraded to Firefox 77 in the Docker container.

## 13.1.1 - 2020-05-29
### Fixed
* Exit with sitespeed.io exit code when you run WebPageReplay in the Docker container [#3017](https://github.com/sitespeedio/sitespeed.io/pull/3017). 

## 13.1.0 - 2020-05-28
### Added
* Updated the plugin-gpsi in the +1 container to pickup LCP and CLS [plugin-gpsi #26](https://github.com/sitespeedio/plugin-gpsi/pull/26).

## 13.0.3 - 2020-05-27
### Fixed
* Metrics for multiple urls are mixed together, giving incorrect summaries in the Lighthouse plugin. Thank you [Andrew Mee](https://github.com/andrewmee) for the PR [plugin-lighthouse #55](https://github.com/sitespeedio/plugin-lighthouse/pull/55).

## 13.0.2 - 2020-05-27
### Fixed
* Updated to [Browsertime 8.13.1](https://github.com/sitespeedio/browsertime/blob/main/CHANGELOG.md#8131---2020-05-26)
* Make sure errors from the CLI logs errors with "Error:" which makes it easier to act on errors in the log [#3013](https://github.com/sitespeedio/sitespeed.io/pull/3013)

## 13.0.1 - 2020-05-25
### Fixed
* Updated the plugin-lighthouse to run latest Chrome as reported in [plugin-lighthouse #53](https://github.com/sitespeedio/plugin-lighthouse/issues/53).

## 13.0.0 - 2020-05-22
### Added
* Show which HTML tag that is the largest contentful paint in the waterfall [#3001](https://github.com/sitespeedio/sitespeed.io/pull/3001).
* Show the Browsertime xvfb parameters in the CLI help [#3003](https://github.com/sitespeedio/sitespeed.io/pull/3003)
* Generic cleanup to make sure we show FCP/LCP/CLS where we show metrics and converted the old layout shift to cumulative layout shift [#3004](https://github.com/sitespeedio/sitespeed.io/pull/3004)
* Upgraded to Chromedriver 83 and Chrome 83 in the Docker container.
* Upgraded to [Browsertime 8.13.0](https://github.com/sitespeedio/browsertime/blob/main/CHANGELOG.md#8130---2020-05-19).
* The +1 container now uses Lighthouse 6.0.0.
* Upgraded to Grafana 7.0.0 and [updated dashboards](https://github.com/sitespeedio/grafana-bootstrap-docker) to the new layout (and a NEW [plus1 dashboard](https://github.com/sitespeedio/grafana-bootstrap-docker/blob/main/dashboards/graphite/Plus1.json) with metrics from GPSI and Lighthouse).

### Fixed
* Better guards for missing WebPageTest first view data [#3002](https://github.com/sitespeedio/sitespeed.io/pull/3002)
* If you used the old budget format, limits and values wasn't written in the HTML and in the log [#3009](https://github.com/sitespeedio/sitespeed.io/pull/3009).

### Tech 
* Continous work to move out CLI options to respective plugin by [Erick Wilder](https://github.com/erickwilder), thank you!

## 12.11.0 - 2020-05-16
### Added
* Show FCP and LCP in the film strip [#2996](https://github.com/sitespeedio/sitespeed.io/pull/2996)
* Make it possible to configure the threshold for the green/yellow/red boxes on the summary page [2997](https://github.com/sitespeedio/sitespeed.io/pull/2997). Read more in the [documentation](https://www.sitespeed.io/documentation/sitespeed.io/configure-html/#configure-the-thresholds-for-redyellowgreen-summary-boxes).

## 12.10.2 - 2020-05-15
### Fixed
* Make sure we don't add undefined values from the navigation timing API [#2995](https://github.com/sitespeedio/sitespeed.io/pull/2995).

## 12.10.1 - 2020-05-14
### Fixed
* Fixed the bug so that the alias is shown in the HTML [#2994](https://github.com/sitespeedio/sitespeed.io/pull/2994).

## 12.10.0 - 2020-05-12
Some time ago we got [a tweet](https://twitter.com/robnavrey/status/1258063125242314755) about adding the Web Vitals to sitespeed.io. The thing is we always add new metrics as soon as they arrive in Chrome/Firefox/Edge or Safari, so we had those metrics for months. But maybe we don't make it easy for people to see them? We have refactored how we show metrics in the HTML and the CLI output to make it easier for you!

### Added
* Upgraded to [Browsertime 8.12.0](https://github.com/sitespeedio/browsertime/blob/main/CHANGELOG.md#8120---2020-05-12):
  * Run tests with Safari Technology Preview using `--safari.useTechnologyPreview`
  * Make it possible to enable Safe Browsing and Tracking protection for Firefox. Fireefox precerences was messed up before. Set `--firefox.disableSafeBrowsing false --firefox.disableTrackingProtection false` and let the browser settle for 30 seconds to download the lists and they are enabled. In the future we want it to be enabled by default [#1272](https://github.com/sitespeedio/browsertime/pull/1272).
  * Output TBT, CLS and TTFB in the CLI summary when availible [#1276](https://github.com/sitespeedio/browsertime/pull/1276) and per run. Also unify how we output metrics from thee CLI [#1277](https://github.com/sitespeedio/browsertime/pull/1277)
* Upgraded to new build of WebPageReplay in the Docker container [#2982](https://github.com/sitespeedio/sitespeed.io/pull/2982).
* Show the same metrics in the CLI and HTML output per URL [#2989](https://github.com/sitespeedio/sitespeed.io/pull/2989).

### Fixed
* Refactor the Grafana CLI options to make the code cleaner (let options live in the plugin). Thank you [Erick Wilder](https://github.com/erickwilder) for the PR [#2984](https://github.com/sitespeedio/sitespeed.io/pull/2984)

## 12.9.1 - 2020-05-08
### Fixed
* Empty array in custom WPT data caused errors [#2985](https://github.com/sitespeedio/sitespeed.io/issues/2985).

## 12.9.0 - 2020-05-07
### Added
* Upgraded to Firefox 76 in the Docker container (and new Browsertime with also Fifefox upgrade).

## 12.8.1 - 2020-05-05
### Fixed
* Reverted to Python 2 in the Docker container to make TSProxy work again.
* Upgraded to [Browsertime 8.9.1](https://github.com/sitespeedio/browsertime/blob/main/CHANGELOG.md#891---2020-05-05) that many font issues in the video on Android devices.

## 12.8.0 - 2020-05-01
### Added
* Upgraded to Browsertime 8.9.0.
* Show Android and WebPageTest information in the run information of every result page [#2974](https://github.com/sitespeedio/sitespeed.io/pull/2974).

### Fixed
* Another fix to correct alias bugs introduced in 12.7.0 and 12.7.1 [#2977](https://github.com/sitespeedio/sitespeed.io/pull/2977)

## 12.7.1 - 2020-04-29
### Fixed
* 12.7.0 broke sending groups when you used URL alias. Fixed in [#2973](https://github.com/sitespeedio/sitespeed.io/pull/2973).
* Correctly send messages on html.finished message, thank you [Erick Wilder](https://github.com/erickwilder) for the PR[#2971](https://github.com/sitespeedio/sitespeed.io/pull/2971).
* Updated to [Browsertime 8.8.0](https://github.com/sitespeedio/browsertime/blob/main/CHANGELOG.md#880---2020-04-29) that fixes the Firefox error that sometimes happend introduced in 8.7.0.

## 12.7.0 - 2020-04-27
### Added
* Use loadEventEnd for budget, summary box and page summary [#2969](https://github.com/sitespeedio/sitespeed.io/pull/2969).
* Configurable group names. Use `--groupAlias` to assing an alias to a group (that is used in Graphite/InfluxDB). Use one alias per URL. [#2964](https://github.com/sitespeedio/sitespeed.io/pull/2964)
* Upgraded to [Browsertime 8.7.0](https://github.com/sitespeedio/browsertime/blob/main/CHANGELOG.md#870---2020-04-24):
  * Fixed typo in an error message of click.js, fixed in [#1246](https://github.com/sitespeedio/browsertime/pull/1246), thank you [petemyron](https://github.com/petemyron).
  * Mouse focus on element won't be lost at script measurement start, fixed in [#1248](https://github.com/sitespeedio/browsertime/pull/1248). Thank you [Icecold777](https://github.com/Icecold777).
  * With the great merge of Mozillas changes I've missed to make sure the result.json wasn't bloated. [Gregory Mierzwinski](https://github.com/gmierz) fixed this in [#1252](https://github.com/sitespeedio/browsertime/pull/1252) making sure a lot of Firefox internal data isn't included by default. You can still enable that with `--firefox.appconstants`.
  * New command `wait.bySelector(selector, maxTime)` implemented in [#1247](https://github.com/sitespeedio/browsertime/pull/1247).
  * Adding screenshots in scripting is a great feature and one thing that was missing was that the result JSON do not include any references to the screenshots, so tools that uses browsertime, didn't know that they exist. In sitespeed.ios case the screenshots are stored to disk but now shown. [#1245](https://github.com/sitespeedio/browsertime/pull/1245).
  * Automatically collect battery temperature for your Andorid phone. Collect start temperature (before you start to test your page) and stop temperature (when your test stopped) [#1250](https://github.com/sitespeedio/browsertime/pull/1250).
  * Use `--androidBatteryTemperatureLimit` to set a minimum battery temperature limit before you start your test on your Android phone. Temperature is in [Celsius](https://en.wikipedia.org/wiki/Celsius). [#1253](https://github.com/sitespeedio/browsertime/pull/1253).

## 12.6.0 - 2020-04-21
### Added
* Updated to Browsertime 8.6.1 (from 8.5.0) and upgraded the main Docker container to use Ubuntu 20.04 and Python 3. Browsertime also includes [a couple of bug fixes](https://github.com/sitespeedio/browsertime/blob/main/CHANGELOG.md#861---2020-04-16) when running Chrome on Android.

## 12.5.1 - 2020-04-09
### Fixed
* Upgraded from AXE-core 3.5.1 to 3.5.3 in [#2955](https://github.com/sitespeedio/sitespeed.io/pull/2955).
* If you run WebPageTest and Browsertime at the same time, both tools generates PageXray data that could cause wrong values as reported in [#2952](https://github.com/sitespeedio/sitespeed.io/issues/2952), fixed in [#2954](https://github.com/sitespeedio/sitespeed.io/pull/2954).

## 12.5.0 - 2020-04-08
### Added
* Updated to Browsertime 8.5.0 that includes Chromederiver 81.
* Updated the Docker container to use Chrome 81 and Firefox 75.

## 12.4.0 - 2020-04-06
### Added
* Updated to [Browsertime 8.4.0](https://github.com/sitespeedio/browsertime/blob/main/CHANGELOG.md#840---2020-04-03).

## 12.3.1 - 2020-03-26
### Fixed
* Catch URLs that uses U+2013 that breaks Graphite [#2943](https://github.com/sitespeedio/sitespeed.io/pull/2943)
* Upgrade to [Browsertime 8.3.1](https://github.com/sitespeedio/browsertime/blob/main/CHANGELOG.md#831---2020-03-26).

## 12.3.0 - 2020-03-23
### Fixed
* New coach that supports NodeJs 10 again.

### Added
* Send load time for LCP to Graphite/Influx so you can choose between render/start time and use max value in the HTML [#2940](https://github.com/sitespeedio/sitespeed.io/pull/2940).

## 12.2.3 - 2020-03-20
### Fixed 
* Remove videoRecordingStart from the summary [#2935](https://github.com/sitespeedio/sitespeed.io/pull/2935).
* Show CPU geckorprofile link only when you run Firefox [#2931](https://github.com/sitespeedio/sitespeed.io/pull/2931).
* Upgraded to [Browsertime 8.3.0](https://github.com/sitespeedio/browsertime/blob/main/CHANGELOG.md#830---2020-03-20).

## 12.2.2 - 2020-03-16
### Fixed
* Fix correct paths to Google Page Speed Insight budget metrics. This was broken in 12.2.0 when we upgraded to the GPSI format [#2930](https://github.com/sitespeedio/sitespeed.io/pull/2930).
* Aggregating over multiple rules was broken for Axe, fixed by [gfoxCartrawler](https://github.com/gfoxCartrawler) in [#2928](https://github.com/sitespeedio/sitespeed.io/pull/2928).

## 12.2.1 - 2020-03-16
### Fixed
* A little better error handling so if you run on latest NodeJS we catch if one of the HTML tasks fail and better watch for failing runs overall [#2927](https://github.com/sitespeedio/sitespeed.io/pull/2927).
* Fixed the order when you remove a plugin so remove always win agains add. That means that you finally can remove lighthouse or gpsi when your run the plus1 container. Remove with `--plugins.remove /lighthouse` or  `--plugins.remove /gpsi`[#2926](https://github.com/sitespeedio/sitespeed.io/pull/2926).

## 12.2.0 - 2020-03-15
### Added
* Updated the Docker container to use Firefox 74.
* Introduced a new slim container with only Firefox. Look for the version tag + slim `sitespeedio/sitespeed.io:12.2.0-slim`. The container is based on Buster slim and we try to keep it as small as possible. The test runs Firefox headless without XVFB and without FFMPeg/ImageMagick so no Visual Metrics in this container for now  [#2913](https://github.com/sitespeedio/sitespeed.io/issues/2913).
* Cleaned up the dependency tree to make the container (and install) smaller on the default container [#2911](https://github.com/sitespeedio/sitespeed.io/issues/2911).
* Use coach-core instead of coach [#2912](https://github.com/sitespeedio/sitespeed.io/pull/2912).
* Use Browsertime 8.2.0 that removed the sharp dependency and instead uses jimp.
* The GPSI-plugin in the `plus1` container now uses the GPSI backend that uses Lighthouse. New structure of metrics so you will need to update your graphs. See [GPSI #20](https://github.com/sitespeedio/plugin-gpsi/pull/20). Also metrics is tagged by desktop/mobile [#2917](https://github.com/sitespeedio/sitespeed.io/pull/2917) in Graphite/InfluxDB.
* Updated copy and show more total transfer sizes for transparency in the sustainable plugin, thank you Chris Adams [#2909](https://github.com/sitespeedio/sitespeed.io/pull/2909), [#2919](https://github.com/sitespeedio/sitespeed.io/pull/2919) and [#2920](https://github.com/sitespeedio/sitespeed.io/pull/2920). Also updated co2.js to the newest version not using SQLite [#2922](https://github.com/sitespeedio/sitespeed.io/pull/2922)

## 12.1.0 - 2020-03-03
### Added
* Upgraded AXE-core from 3.4.1 -> 3.5.2 [#2879](https://github.com/sitespeedio/sitespeed.io/pull/2879)
* Add budget for first party number of requests and transfer/content size [#2872](https://github.com/sitespeedio/sitespeed.io/pull/2872).
* The new sustainable web plugin developed together with Chris Adams of the Green Web Foundation. Main work in [#2868](https://github.com/sitespeedio/sitespeed.io/pull/2868) and [#2899](https://github.com/sitespeedio/sitespeed.io/pull/2899). Enable it with `--sustainable.enable`.

### Fixed
* Hide internal videoRecordingStart metric [#2883](https://github.com/sitespeedio/sitespeed.io/pull/2883).
* --multi and crawl don't work together and before it was just silently ignored, now you get a message [#2889](https://github.com/sitespeedio/sitespeed.io/pull/2889)
* The cli now verifies that you use NodeJS 10 or higher to run sitespeed.io [#2901](https://github.com/sitespeedio/sitespeed.io/pull/2901), lower version don't work.

## 12.0.1 - 2020-02-07
### Fixed
* Upgraded to [Browsertime 8.0.1](https://github.com/sitespeedio/browsertime/blob/main/CHANGELOG.md#801-2020-02-07) that fixes the broken TSProxy issue. Thank you [Kenrick](https://github.com/kenrick95) for reporting and fixing in PR [#1169](https://github.com/sitespeedio/browsertime/pull/1169).

## 12.0.0 - 2020-02-06

Read about Browsertime 8.0 and sitespeed.io 12.0 in [the blog post](https://www.sitespeed.io/sitespeed.io-12.0-and-browsertime-8.0/) and checkout the [Browsertime changelog](https://github.com/sitespeedio/browsertime/blob/main/CHANGELOG.md#800-2020-02-05) to see all the changes!

### Added
* Browsertime 8.0.0 - this is an massive update with a lot of new things!
* Chrome 80, Chromedriver 80 and Firefox 72.
* Coach 4.4.0.
* Add (back) fast-crc32c for faster upload to GSC - thank you [Radu Micu](https://github.com/radum) for the PR [#2858](https://github.com/sitespeedio/sitespeed.io/pull/2858)
* Upgraded from AXE core 3.4.0 -> [3.4.1](https://github.com/dequelabs/axe-core/blob/develop/CHANGELOG.md#341-2019-12-11).


## 11.9.3 - 2019-12-19
### Fixed
* Upgraded to Browsertime 7.8.2 that fixes the Firefox Window Recorder.
* Upgraded to Browsertime 7.8.3 that fixes `--videoParams.debug` so that you easily can get a video of your scripting.

## 11.9.2 - 2019-12-16
### Fixed
* Upgraded to Browsertime 7.8.1:
  * More sane logging if getting the HTML/body content for Chrome fails [#1036](https://github.com/sitespeedio/browsertime/pull/1036).
  * Finally remove all calls to detect portal in Firefox when you use `--firefox.mozillaProPreferences` [#1035](https://github.com/sitespeedio/browsertime/pull/1035).

## 11.9.1 - 2019-12-16
### Fixed
* Running WebPageReplay in Docker didn't respect the `--config` flag. Fixed in [#2826](https://github.com/sitespeedio/sitespeed.io/pull/2826).

## 11.9.0 - 2019-12-16
### Added
* Send number of DOM elements by default to storage [#2823](https://github.com/sitespeedio/sitespeed.io/pull/2823)
* Upgraded to Browsertime 7.8.0:
  * There's a new waot command in scripting `await commands.wait.byPageToComplete()` that waits for the configured page complete check to run. This is useful if you are running your own Selenium scripts and navigate through JavaScript and wants to wait for the page to finish loading [#1024](https://github.com/sitespeedio/browsertime/pull/1024).
  * Take a screenshot from a script `await commands.screenshot.take('name')`. The screenshot is stored on disk for that page and in later releases it will be included in the result JSON file [#1032](https://github.com/sitespeedio/browsertime/pull/1032).
  * A little safer check when getting the alias for page in scripting [#1031](https://github.com/sitespeedio/browsertime/pull/1031)
  * When getting content for a page to include in the HAR, we used to fail hard on first failure for Chrome. Now we catch that and try with the next response [#1029](https://github.com/sitespeedio/browsertime/pull/1029).
  * Android testing was broken since 7.6.1 with the setting of user preferences that Android on Chrome don't support [#1034](https://github.com/sitespeedio/browsertime/pull/1034).

### Fixed
* Propagate more setting to WebPageReplay record session [#2825](https://github.com/sitespeedio/sitespeed.io/pull/2825)

## 11.8.1 - 2019-12-13
### Fixed
* Catch if Visual Elements fail. When it failed our statistics was broken [#2824](https://github.com/sitespeedio/sitespeed.io/pull/2824).

## 11.8.0 - 2019-12-12
### Added
* Upgraded to Chrome and Chromedriver 79 [#1025](https://github.com/sitespeedio/browsertime/pull/1025).
* Upgraded the Coach to match Chromedriver version.

### Fixed
* Upgraded to Browsertime 7.7.1 that catches errors in Visual Elements.

## 11.7.2 - 2019-12-10
### Fixed
* Updated to Browsertime 7.6.1 that removes the save password popup for Chrome.

## 11.7.1 - 2019-12-10
### Fixed
* A bug was introduced in budget when calculating HTTP Errors that caused content/transfer size budgets fail [#2819](https://github.com/sitespeedio/sitespeed.io/pull/2819).

## 11.7.0 - 2019-12-07
### Added
* Updated Browsertime to 7.6.0:
  * Disable safe browsing per default for Firefox. Enable it with `---browsertime.firefox.disableSafeBrowsing false`[#1029](https://github.com/sitespeedio/browsertime/pull/1019).
  * Disable traffic to detect portal for Firefox when you use `---browsertime.firefox.mozillaProPreferences` [#1202](https://github.com/sitespeedio/browsertime/pull/1020).

## 11.6.0 - 2019-12-06
### Added
* Added Firefox 71 in the Docker container.
* New Browsertime 7.5.0 with the added Firefox preferences from the Mozilla Performance Team to get as stable metrics as possible. Enable it with `--browsertime.firefox.mozillaProPreferences` [#1016](https://github.com/sitespeedio/browsertime/pull/1016).

## 11.5.1 - 2019-12-05
## Fixed
* The CPU pug template was broken if you disabled the third party plugin [#2816](https://github.com/sitespeedio/sitespeed.io/pull/2816).

## 11.5.0 - 2019-12-05
### Fixed
* Verify that `--crawl.depth` is set if you set other crawl parameters [#2807](https://github.com/sitespeedio/sitespeed.io/pull/2807).
* The Lighthouse plugin catches if Lighthouse fails to run test [#45](https://github.com/sitespeedio/plugin-lighthouse/pull/45).
* Display First Input Delay and First Input Duration [#2812](https://github.com/sitespeedio/sitespeed.io/pull/2812)

### Added
* Upgraded to Browsertime 7.4.2:
  * Collect number of DOM elements as a part of the page info for each run [#1000](https://github.com/sitespeedio/browsertime/pull/1000).
  * Configure how often to check for the pageCompleteCheck. Default is every 200 ms, and it happens after the load event end (using the default pageLoadStrategy). Set it with `--browsertime.pageCompleteCheckPollTimeout`(value in ms) [#998](https://github.com/sitespeedio/browsertime/pull/998).
  * Added missing pageLoadStrategy option in the CLI. The option worked but no visible cli help for it [#1001](https://github.com/sitespeedio/browsertime/pull/1001).
  * Do not load the Browsertime WebExtention for Chrome (it is not used anymore) and make it possible for Firefox to disable to use it with `--browsertime.firefox.disableBrowsertimeExtension`. 
  * Added configurable settle time for the browser to rest after the browser is open and before the tests starts to run. Use `--browsertime.timeToSettle` in ms [#1003](https://github.com/sitespeedio/browsertime/pull/1003).
  * Calculate FID instead of just report it [#1005](https://github.com/sitespeedio/browsertime/pull/1005)
  * You can now run ADB shell directly from your user script [#1007](https://github.com/sitespeedio/browsertime/pull/1007). Use `commands.android.shell('')`.
  * Add your own metrics from your script. The metrics will be in the result JSON and statistics will be calculated for that metric. Use `commands.measure.add(name, value)` or `commands.measure.addObject(object)` if you want to add multiple metrics. Documentation coming soon [#1011](https://github.com/sitespeedio/browsertime/pull/1011)
  * Remove and simplify old code when running with pageLoadStrategy none. Introducing `--pageCompleteCheckStartWait` - The time in ms to wait for running the page complete check for the first time. Use this when you have a pageLoadStrategy set to none. [#1008](https://github.com/sitespeedio/browsertime/pull/1008)
  * Better guards when calculating Visual Metrics [#1006](https://github.com/sitespeedio/browsertime/pull/1006).
  * Fix for the using the Window recorder in Firefox 72. Thank you [Barret Rennie](https://github.com/brennie) for the PR [#995](https://github.com/sitespeedio/browsertime/pull/995).
  * Catch if Contentful Speed Index fails [#1014](https://github.com/sitespeedio/browsertime/pull/1014).

## 11.4.0 - 2019-11-26
## Added
* Added `--grafana.annotationTitle`,  `--grafana.annotationMessage`,  `--grafana.annotationTag` and  `--grafana.annotationScreenshot` to follow the same structure for Grafana annotations as Graphite annotations [#2798](https://github.com/sitespeedio/sitespeed.io/pull/2798).
* The +1 container was updated to Lighthouse 5.6 + PR to make it possible to configure puppeteer [#39](https://github.com/sitespeedio/plugin-lighthouse/pull/39) so you don't need to run in headless mode.

### Fixed
* Show Long Tasks information in the HTML when you configure only Long Tasks (before you also needed the trace log) [#2802](https://github.com/sitespeedio/sitespeed.io/pull/2802).
* Testing multiple URLs was broken for Lighthouse in the +1 container since 11.3.0. Fixed in [#43](https://github.com/sitespeedio/plugin-lighthouse/pull/43).

## 11.3.0 - 2019-11-22
### Added
* Added the sitespeed.io version and browser version in the title of the annotation tag of Graphite and Grafana [#2791](https://github.com/sitespeedio/sitespeed.io/pull/2791), [#2792](https://github.com/sitespeedio/sitespeed.io/pull/2792) and [#2793](https://github.com/sitespeedio/sitespeed.io/pull/2793).
* Updated to Browsertime 7.2.2: 
  * There was a bug introduced in 7.0.0 that made navigation fail on Safari [#997](https://github.com/sitespeedio/browsertime/pull/997).
  * Get phone and Android version from the phone [#991](https://github.com/sitespeedio/browsertime/pull/991).
  * Take care of the case when a page overwrites the document.URL [#992](https://github.com/sitespeedio/browsertime/pull/992).
  * Stop the video recording when the test finished and not after we collected all JavaScript metrics [#994](https://github.com/sitespeedio/browsertime/pull/994).
* Lighthouse in the +1 container now supports multiple iterations (running Lighthouse multiple times for the same URL) PR by [Dawid Grela](https://github.com/tengremlin) - [#36](https://github.com/sitespeedio/plugin-lighthouse/pull/36).

### Fixed
* Link for first and largest contentful help text [#2785](https://github.com/sitespeedio/sitespeed.io/pull/2785)
* The +1 container was missing the fixes to make it easier to turn of video and visual metrics when running the container [#2789](https://github.com/sitespeedio/sitespeed.io/pull/2789)
* The WebPageTest Page Timing dashboard was missing the location field in the annotations (you could see both Firefox and Chrome runs even though you only choose on) and it was missing a line for render.
* Using `--mobile` together with WebPageReplay didn't respect the mobile settings, causing 404 for some URLs when testing Wikipedia on mobile [#2795](https://github.com/sitespeedio/sitespeed.io/pull/2795).

## 11.2.0## - 2019-11-14
### Added
* Updated to Browsertime 7.1.0 that add Total Blocking Time and Max Potential First Input Delay when you use Chrome with `--cpu`. One dashboard updated, the result pages displayes the new metrics.

## 11.1.0 - 2019-11-13

### Added
* Use include pattern in URLs when crawling with `--crawler.include`, thank you [Samuli Reijonen](https://github.com/SamuliR) for the PR [#2763](https://github.com/sitespeedio/sitespeed.io/pull/2763).
* Added support for adding errors to the queue that isn't specific to a URL [#2772](https://github.com/sitespeedio/sitespeed.io/pull/2772).
* Show FID metrics if we have it [#2781](https://github.com/sitespeedio/sitespeed.io/pull/2781) and [#2782](https://github.com/sitespeedio/sitespeed.io/pull/2782).

### Fixed
* The timestamp on the page summary was wrong: it showed when all tests started instead of the time of the first run as reported in [#2766](https://github.com/sitespeedio/sitespeed.io/issues/2766) and fixed in [#2768](https://github.com/sitespeedio/sitespeed.io/pull/2768).
* If uploading to S3 or GCS fails, the exit code will be an error and you can see that it failed in the HTML [#2774](https://github.com/sitespeedio/sitespeed.io/pull/2774).
* A safer check when generating pages HTML page if something went wrong earlier in the run [#2778](https://github.com/sitespeedio/sitespeed.io/pull/2778)
* Upgraded to [Browsertime 7.0.2](https://github.com/sitespeedio/browsertime/blob/main/CHANGELOG.md#702---2019-11-13)

## 11.0.0 -  2019-11-07
### Changed
* Finally there's a fix for that the Docker container run sitespeed.io as root, generating otput owned by root as in [#1459](https://github.com/sitespeedio/sitespeed.io/issues/1459). The fix by [Mason Malone](https://github.com/MasonM) pickup the user of the output directory and uses that user. Thank you again [Mason Malone](https://github.com/MasonM) for the PR [#2710](https://github.com/sitespeedio/sitespeed.io/pull/2710).

### Fixed
* Fixed so that you can disable video/visual metrics in your configuration json in Docker as reported in [#2692](https://github.com/sitespeedio/sitespeed.io/issues/2692) fixed by PR [#2715](https://github.com/sitespeedio/sitespeed.io/pull/2715).
* Fixed so that running AXE when testing multiple URLs works in scripting (reported in [#2754](https://github.com/sitespeedio/sitespeed.io/issues/2754)). Fixed in [#2755](https://github.com/sitespeedio/sitespeed.io/pull/2755).

### Added
* Make it possible to configure which data to show in the columns as in [#200](1https://github.com/sitespeedio/sitespeed.io/issues/2001), fixed in PR [#2711](https://github.com/sitespeedio/sitespeed.io/pull/2711). Thank you [thapasya-m](https://github.com/thapasya-m) for the PR!
* Chrome/ChromeDriver 78 and Firefox 70.
* Use AXE in budget [#2718](https://github.com/sitespeedio/sitespeed.io/pull/2718).
* Upgraded to Axe Core 3.4.0 [#2723](https://github.com/sitespeedio/sitespeed.io/pull/2723).
* Added contentSize to budget [#2721](https://github.com/sitespeedio/sitespeed.io/pull/2721).
* You can now configure which summary boxes (which metric) you can see on the start page. Thank you [thapasya-m](https://github.com/thapasya-m) for the PR [#2736](https://github.com/sitespeedio/sitespeed.io/pull/2736)!
* Upgraded to [Browsertime 7.0.0](https://github.com/sitespeedio/browsertime/blob/main/CHANGELOG.md#700---2019-11-02):
  * Changed a couple of Firefox settings to follow the Mozilla teams downstream version [#965](https://github.com/sitespeedio/browsertime/pull/965).
  * Added Contentful speed index is a new SI metric developed by Bas Schouten at Mozilla which uses edge detection to calculate the amount of "content" that is visible on each frame, thank you [dpalmeiro](https://github.com/dpalmeiro) for the PR [#976](https://github.com/sitespeedio/browsertime/pull/976).
  * Firefox 67 and above has a built-in window recorder ([bug 1536174](https://bugzilla.mozilla.org/show_bug.cgi?id=1536174)) that is able to dump PNG images of each frame that is painted to the window. This can be enabled and disabled in the browser console, or through the chrome context with selenium webdriver. This PR introduces a new privileged API that is able to execute JS in the chrome context, as well as support for generating a variable rate MP4 using the output images from the window recorder. The motivation for this work was to introduce a low-overhead video recorder that will not introduce performance disturbances during page loads. Thank you [dpalmeiro](https://github.com/dpalmeiro) for the PR [#978](https://github.com/sitespeedio/browsertime/pull/978). You can try it out with `--video --firefox.windowRecorder`
  * There's a new way to set variance on your connectivity. At the moment you can only do that when you are using Throttle as engine. You can try it out with `--connectivity.variance 2` - that means the latency will have a variance of 2% between runs. Let us try this out and get back about later on [#973](https://github.com/sitespeedio/browsertime/pull/973). Original idea from Emery Berger.
  * Some URLs failed because of that the document.title was an image, as reported in [#979](https://github.com/sitespeedio/browsertime/issues/979) and fixed in [#980](https://github.com/sitespeedio/browsertime/pull/980).
  * Hide sudo log when using Docker [#971](https://github.com/sitespeedio/browsertime/pull/971).
  * Better log message if the Browser fails to start, thank you [Mason Malone](https://github.com/MasonM) for the PR [#962](https://github.com/sitespeedio/browsertime/pull/962).

## 10.3.2 -  2019-10-18
### Fixed
* Changed the InfluxDB annotation log to log on debug level instead of info.
* The wrong HAR was viewed in the HTML result if you used `--html.fetchHARFiles` and tested multiple pages [#2704](https://github.com/sitespeedio/sitespeed.io/pull/2704).
* If a pug template fail to render, log the template name and the data passed on [#2709](https://github.com/sitespeedio/sitespeed.io/pull/2709)

## 10.3.1 -  2019-10-17
### Fixed
* If a page had a HTTP error, we logged all the requests, but we should only log the ones with a HTTP status code > 399. Fixed in [#2702](https://github.com/sitespeedio/sitespeed.io/pull/2702)

## 10.3.0 -  2019-10-16
### Added
* Include filmstrip data (path to screenshots and metrics) in the HAR file [#2695](https://github.com/sitespeedio/sitespeed.io/issues/2695)
* Your budget can now fail if you have any HTTP ERRORS on your page [#2691](https://github.com/sitespeedio/sitespeed.io/pull/2691). Thank you [thapasya-m](https://github.com/thapasya-m) for the PR!
* Allow filtering run iteration metrics, thank you [Kevin Lakotko](https://github.com/kevinlacotaco) for the PR [#2697](https://github.com/sitespeedio/sitespeed.io/pull/2697).
* Update indexed keys with names for user timing and asssets when you collect metric per iteration in Graphite. Thank you [Kevin Lakotko](https://github.com/kevinlacotaco) for the PR [#2701](https://github.com/sitespeedio/sitespeed.io/pull/2701).
* New Browsertime with Geckodriver 0.26.0
* New Coach 4.1.0 that collect meta generator info.

## 10.2.0 - 2019-10-07
### Added
* Added stdev to metrics sent to InfluxDB [#2678](https://github.com/sitespeedio/sitespeed.io/pull/2678).
* Simplify running Safari on ios devices by only using `--safari.ios` [#2666](https://github.com/sitespeedio/sitespeed.io/pull/2666).
* Show ios device type in the HTML (iPhone/iPad) when you set the device type [#2667](https://github.com/sitespeedio/sitespeed.io/pull/2667).
* [New and updated dashboards in Grafana](https://github.com/sitespeedio/grafana-bootstrap-docker) for Graphite/InfluxDB and for WebPageTest.
* Add a link to your result to compare with `--html.compareURL` [#2680](https://github.com/sitespeedio/sitespeed.io/pull/2680).
* New PerfCascade with a button to easy copy response content [#2690](https://github.com/sitespeedio/sitespeed.io/pull/2690).
* There's experimental suuport for sending data per run to Graphite `--graphite.experimental.perIteration`, thank you [Kevin Lakotko](https://github.com/kevinlacotaco) for the PR [#2679](https://github.com/sitespeedio/sitespeed.io/pull/2679). This can change in the near future so only use it if you really know what you are doing :) Also as a normal user sending data to Graphite, you don't this functionallity, using pageSummary should be ebough.


### Fixed
* There was a bug that caused faulty docs for running axe. Use `--axe.enable`
to run Axe! [#2676](https://github.com/sitespeedio/sitespeed.io/pull/2676).
* Set correct tag for CPU Long Tasks in InfluxDB [#2677](https://github.com/sitespeedio/sitespeed.io/pull/2677)
* Handle float numbers in statistics, thank you [tengremlin](https://github.com/tengremlin) for the PR [#2675](https://github.com/sitespeedio/sitespeed.io/pull/2675).
* Upgraded to Yargs 14.2.0 that fixes so you can extend config.json files in multiple steps. Before only on step worked.
* Upgraded to Browsertime [6.1.3](https://github.com/sitespeedio/browsertime/blob/main/CHANGELOG.md#browsertime-changelog) that fixes the TSProxy bug.
* Testing localhost broke the third party plugins. Fixed in the new Coach and in sitespeed.io [#2689](https://github.com/sitespeedio/sitespeed.io/pull/2689).
* Upgraded to the Coach 4.0.2.

## 10.1.1 - 2019-10-01
### Fixed
* Fix so that if we have the filmstrip from the Chrome trace log, those images should be used in the filmstrip view [#2661](https://github.com/sitespeedio/sitespeed.io/pull/2661)
* Fix resultBaseURL as env variable as reported by MasonM in [#2663](https://github.com/sitespeedio/sitespeed.io/issues/2663) fixed in [#2664](https://github.com/sitespeedio/sitespeed.io/pull/2664).
* Upgraded to Browsertime 6.1.1 that fixes SpeedLine visual metrics to numbers instead of strings.

## 10.1.0 - 2019-09-25
### Added
* WebPageTest: send standard deviation for some of the timing metrics by default [#2656](https://github.com/sitespeedio/sitespeed.io/pull/2656).
* Updated Browsertime to 6.1.0:
  * Get the first input in Chrome (useful for user journeys) [#948](https://github.com/sitespeedio/browsertime/pull/948).
  * Removed settings for enabling LayoutInstabilityAPI in Chrome (is on by default in Chrome 77) [#949](https://github.com/sitespeedio/browsertime/pull/949.
  * Fixed a bug for Chrome when you couldn't send more that one request header [#950](https://github.com/sitespeedio/browsertime/pull/950).
  * Empty long task after you collect them.
* Updated dashboards: New WebPageTest dashboard showing standartd deviation: https://github.com/sitespeedio/grafana-bootstrap-docker/blob/main/dashboards/graphite/WebPageTestDeviation.json and updated page timing metrics dashboard for sitespeed.io so you can just use the drowdown to see the standard deviation for different metrics https://github.com/sitespeedio/grafana-bootstrap-docker/blob/main/dashboards/graphite/PageTimingMetrics.json

##  10.0.3 - 2019-09-24
### Fixed
* Updated to Browsertime 6.0.4
  * Upgraded TSProxy to 1.5 [#945](https://github.com/sitespeedio/browsertime/pull/945) see [TSProxy issue #20](https://github.com/WPO-Foundation/tsproxy/issues/20) for more details.
  * Upgraded to latest Chrome-har with extra guard if a response is missing respone data.
* Fix so --script can take a directory as input as Browsertime [#2651](https://github.com/sitespeedio/sitespeed.io/pull/2651). Thank you [Sumeet Rohra](https://github.com/sumeetrohra) for the PR.
* Removed the alias --connectivity for -c because it broke the configuration JSON [#2649](https://github.com/sitespeedio/sitespeed.io/pull/2649)
* Running WebPageReplay using --mobile used to record in desktop size and replay in mobile. That is fixed now in [#2654](https://github.com/sitespeedio/sitespeed.io/pull/2654)
* InfluxDB and Grafana used wrong tags in annotations if you used WebPageTest. Fixed in [#2644](https://github.com/sitespeedio/sitespeed.io/pull/2644)

##  10.0.2 - 2019-09-14
### Fixed
* Removed the fast-crc32c dependency for the GCS plugin to make sitespeed.io work on NodeJS 12 [#2634](https://github.com/sitespeedio/sitespeed.io/pull/2634). Thank you [Radu Micu](https://github.com/radum) for the PR!

* Updated to Browsertime 6.0.3 that fixes broken proxy handling, flicker of the timer in the video, and Chrome trace log problems that missed responses.

### Tech
* Small refactor of code [#2641](https://github.com/sitespeedio/sitespeed.io/pull/2641) and [#2639](https://github.com/sitespeedio/sitespeed.io/pull/2639) thank you [Sumeet Rohra](https://github.com/sumeetrohra).

## 10.0.1 - 2019-09-12
### Fixed
* Updated Browsetime with stable ChromeDriver (instead of beta), do not show First Paint for Safari, and fixing getting long task data if you first navigate and then measure a URL. See the [Browsertime changelog](https://github.com/sitespeedio/browsertime/blob/main/CHANGELOG.md#601---2019-09-12) for all the info.

## 10.0.0 - 2019-09-11
### Added
* Updated to Firefox 69 and Chrome 77 in the Docker container.
* Collext Axe violations for summary and detailed summary [#2622](https://github.com/sitespeedio/sitespeed.io/pull/2622). Read more in the [documentation](https://www.sitespeed.io/documentation/sitespeed.io/axe/).
* Added new metrics for slacking errors/warnings: firstPaint, visualComplete85, lastVisualChange, fullyLoaded (and fixed broken fullyLoaded) [#2611](https://github.com/sitespeedio/sitespeed.io/pull/2611).
* Show the top 20 largest assets on the PageXray tab [#2583](https://github.com/sitespeedio/sitespeed.io/pull/2583)
* Show the transfer size of assets (not only content size) in the toplists in the HTML [#2560](https://github.com/sitespeedio/sitespeed.io/pull/2560)
* You can now test your pages using Axe: `--axe.enable` - The test will run after all other metrics are collected and will add some extra time to your total run test time [#2571](https://github.com/sitespeedio/sitespeed.io/pull/2571). You can see all axe information in the new tab.
* Limited support for using Safari. You need Catalina + iOS 13 to run Safari on your phone/tablet. Read more in the [documentation](https://www.sitespeed.io/documentation/sitespeed.io/browsers/#safari).
* Send FirstMeaningfulPaint by default to Graphite/InfluxDb [#2559](https://github.com/sitespeedio/sitespeed.io/pull/2559)
* [Updated dashboards](https://github.com/sitespeedio/grafana-bootstrap-docker) with a new annotation (for sitespeed.io changes) and fixed WebPageTest dashboards to work with annotations.
* Upgraded to [Browsertime 6.0.0](https://github.com/sitespeedio/browsertime/blob/main/CHANGELOG.md).
  * Upgraded to Ubuntu Disco in the Docker container [#908](https://github.com/sitespeedio/browsertime/pull/908).
  * Use [TSProxy](https://github.com/WPO-Foundation/tsproxy) to throttle the connection. You should use TSProxy when you run on Kubernetes. Use it by `--connectivity.engine tsproxy`. We used to have support years ago but it never worked good on Mac/Linux so we dropped it. But it works now so we added it back [#891](https://github.com/sitespeedio/browsertime/pull/891).
  * You can now add your own metrics directly from your script (or post script) using *context.result.extras*. More info coming [#917](https://github.com/sitespeedio/browsertime/pull/917)
  And some new things coming in Chrome:
  * Using Chrome 77 (or later) you will now get a layout shift score (in percentage), see https://web.dev/layout-instability-api. [#905](https://github.com/sitespeedio/browsertime/pull/905).
  * Get LargestContentfulPaint in Chrome 77 (or later) [#906](https://github.com/sitespeedio/browsertime/pull/906).
  * Get ElementTimings in Chrome 77 (or later) [#921](https://github.com/sitespeedio/browsertime/pull/921). All elements needs to have a unique identifier for this to work correctly.
  * There's an alternative to collect Visual Metrics using the Chrome trace log, using [SpeedLine](https://github.com/paulirish/speedline) implemented in [#876](https://github.com/sitespeedio/browsertime/pull/876). Using video give more accurate metrics (at least in our testing) but maybe it could help running on Chrome on Android and add less overhead than recording a video. You can enable it with:  `--cpu --chrome.visualMetricsUsingTrace --chrome.enableTraceScreenshots`

### Fixed
* Guard against broken WPT multi-step runs [#2621](https://github.com/sitespeedio/sitespeed.io/pull/2621).
* Multiple bug fixes for the Slack plugin: Show the correct connectivity, always have a red color when we have an error and fixed bug when comparing metrics (we compare with median) [#2610](https://github.com/sitespeedio/sitespeed.io/pull/2610).
* Only using number as an alias for connectivity should be ok [#2612](https://github.com/sitespeedio/sitespeed.io/pull/2612).
* Unified how to log the options object, so that Browsertime and sitespeed.io follow the same standard. You can now log your options/configuration with `--verbose` that is super helpful when you need to debug configuration issues [#2588](https://github.com/sitespeedio/sitespeed.io/pull/2588).
* Sending metrics to InfluxDB was broken because of a bug in how we get the connectivity name. Fixed in [#2587](https://github.com/sitespeedio/sitespeed.io/pull/2587).
* HTML fix for showing the script in the result HTML [#2597](https://github.com/sitespeedio/sitespeed.io/pull/2597).
* Running a script, testing multiple different domains, having aliases made data in Graphite sent under the wrong group/domain. Fixed in [#25###92](https://github.com/sitespeedio/sitespeed.io/pull/2592)
* Fixed annotations tag when using WebPageTest. Before the correct values was not sent. With the fix you can use the annotations on you WebPageTest dashboard [2602](https://github.com/sitespeedio/sitespeed.io/pull/2602).
* Add WebPageTest screenshot in annotation if you use WebPageTest without Browsertime [#2603](https://github.com/sitespeedio/sitespeed.io/pull/2603) and [#2605](https://github.com/sitespeedio/sitespeed.io/pull/2605)
* Link to WebPageTest HAR in the annotation if you run WebPageTest standalone [#2609](https://github.com/sitespeedio/sitespeed.io/pull/2609).

### Changed
* Upgraded to yargs 14.1.0 that deep merge configuration files when you extend another configuration [#2626](https://github.com/sitespeedio/sitespeed.io/pull/2626)
* To store the log to file you need to now add `--logToFile` to your run. This makes sense that you need to make an active choice to store the log file[#2606](https://github.com/sitespeedio/sitespeed.io/pull/2606).
* Using `--debug`now set the log level to verbose instead of just logging the message queue. To log the message queue use `--debugMessages` [#2607](https://github.com/sitespeedio/sitespeed.io/pull/2607).

### Tech
* Updated dev dependencies and yargs, @google-cloud/storage, aws-sdk, dayjs, findup, fs-extra, influx, juni-report-builder, p-limit, pug, simplecrawler and tape.

##  9.8.1 - 2019-08-03
### Fixed
* Upgraded to Browsertime 5.7.3 that fixes a bug introduced in Browsertime 5.6.0 (sitespeed.io 9.7.0) that made it impossible to set multiple cookies when using Chrome [#910](https://github.com/sitespeedio/browsertime/pull/910).

##  9.8.0 - 2019-08-01

### Added
* We updated the Docker container to use Chrome 76 and swicthed to ChromeDriver 76. We had some issues with Chrome 76 (or ChromeDriver) that increased number of times we got errors converting the Chrome trace log because of missing navigationStart events (see [#902](https://github.com/sitespeedio/browsertime/issues/902)) on our test servers. But that seems fixed with [#904](https://github.com/sitespeedio/browsertime/pull/904).

## 9.7.0 - 2019-07-29

In this release we moved functionality for Chrome from our [browser extension](https://github.com/sitespeedio/browsertime-extension) to the devtools protocol instead, so that the same functionality also works in Chrome on Android. Read the [changelog for Browsertime for all changes](https://github.com/sitespeedio/browsertime/blob/main/CHANGELOG.md#560----2019-07-27).

### Fixed
* You can now use `--android` to run tests on Android phones (the same way as on Browsertime) [#2544](https://github.com/sitespeedio/sitespeed.io/pull/2544).

### Added
* Upgraded to third-party-web 0.10.1.
* Upgraded to Browsertime [5.6.0](https://github.com/sitespeedio/browsertime/blob/main/CHANGELOG.md#560----2019-07-27) and [5.6.1](https://github.com/sitespeedio/browsertime/blob/main/CHANGELOG.md#561----2019-07-28).

##  9.6.0 - 2019-07-11
### Added
* Docker container is now using Firefox 68.

### Fixed
* Upgrading to Browsertime 5.5 that catches broken timeToFirstInteractive in Firefox (we've seen it reported -46 years, if that happens we report 0 instead).

## 9.5.0 - 2019-07-04
### Fixed
* Better error message if the config JSON is malformed [#2525](https://github.com/sitespeedio/sitespeed.io/pull/2525).
* Updated Browsertime with a new version of Tracium that adds another way of finding Navigation start.
* Better error handling for WebPageTest: Make sure we always log error from the WebPageTest API, added guards for when WebPageTest fails and always log the full URL to the result on WebPageTest [#2527](https://github.com/sitespeedio/sitespeed.io/pull/2527).
* Better error message if the WebPageTest server timeouts [#2529](https://github.com/sitespeedio/sitespeed.io/pull/2529)

### Added
* If you use WebPageTest standalone, we will include a link in the Graphite/Grafana/InfluxDB annotation to the WebPageTest result on the WebPageTest server [#2528](https://github.com/sitespeedio/sitespeed.io/pull/2528). In the future we should make sure we include a link if we run both Browsertime and WebPageTest.
* Updated to Browsertime 5.4.1:
  * Better check that a request header is supplied before parsing [#875](https://github.com/sitespeedio/browsertime/pull/875).
  * Better error message for the user if the config.json file is malformed [#869](https://github.com/sitespeedio/browsertime/pull/869)
  * Getting the netlog for Chrome was broken when using scripting. This fix catches an error and changes when we remove the file. If you test multiple URLs the netlog will contain all interactions for the script. The first file = first URL. The second file = first and second url. [#874](https://github.com/sitespeedio/browsertime/pull/874)
  * Two new functions in scripting: `addText.byName(text, name)` and `addText.byClassName(text, className)`. See [#870](https://github.com/sitespeedio/browsertime/pull/870).
  * Upgraded to coming Selenium 4. There should be no difference for end users [#871](https://github.com/sitespeedio/browsertime/pull/871).

## 9.4.0 - 2019-06-29
### Added
* Upgraded to [Browsertime 3.4.0](https://github.com/sitespeedio/browsertime/blob/main/CHANGELOG.md#530---2019-06-29) with the following fixes:
  * Added support for `--injectJs` using Chrome [#864](https://github.com/sitespeedio/browsertime/pull/864).
  * Use CDP to set request headers for Chrome (instead of the Browsertime extension). This enables adding extra headers for Chrome on Android and fixes [#2520](https://github.com/sitespeedio/sitespeed.io/issues/2520). Fixed in [#867](https://github.com/sitespeedio/browsertime/pull/867).
* Report JS heap size by deafult for Chrome to Graphite/InfluxDb [#2524](https://github.com/sitespeedio/sitespeed.io/pull/2524)

## 9.3.4 - 2019-06-20
### Fixed
* Tabs on mobile in the HTML was broken and some tables wasn't displayed correctly [#2511](https://github.com/sitespeedio/sitespeed.io/pull/2511)
* Added extra check that we really have 3rd party data when displaying CPU metrics.
* Fixed extra error when WebPageTest test failed and we still tried to get the trace log.

## 9.3.3 - 2019-06-16
### Fixed
* Upgraded to Browsertime 5.2.6:
  * Catch if getting the HTML for a resource from Chrome fails [#861](https://github.com/sitespeedio/browsertime/pull/861).
  * A couple of more pixels to know if a orange screen is orange in Visual Metrics [#862](https://github.com/sitespeedio/browsertime/pull/862).
  * Bumped versions if adbkit, chrome-remote-interface & yargs [#863](https://github.com/sitespeedio/browsertime/pull/863).

# 9.3.2 - 2019-06-13

### Fixed
* Moved the download Chrome trace button to the top of the page so we can find it [#2505](https://github.com/sitespeedio/sitespeed.io/pull/2505).
* Upgraded to Browsertime 5.2.5 that fixes:
  * Fixed so that the tracing in Chrome ends before we start to run our JavaScript metrics (so that they aren't picked up in the trace) [#860](https://github.com/sitespeedio/browsertime/pull/860).
  * Running a script that started to measure without a URL and used an alias instead missed out on starting some browser services, for example Long Tasks in Chrome was not recorded. That is fixed in [#858](https://github.com/sitespeedio/browsertime/pull/858)
* Fixed broken pug in the GPSI plugin.

## 9.3.1 - 2019-06-12

### Fixed
* Make sure the HTML plugin doesn't break if the +1 GPSI plugin doesn't return any data.
* Upgraded Browsertime 5.2.2 that uses a fixed version of Tracium that doesn't throw errors if the trace log from Chrome isn't the way Tracium wants it. This helps us getting trace log from multiple sites and user journeys.
* If testing a URL failed for Chrome, and you wanted CPU metrics, the HTML report failed. Fixed in [#2504](https://github.com/sitespeedio/sitespeed.io/pull/2504)
* Upgraded to Third Party Web 0.9.0.

## 9.3.0 - 2019-06-10

## Added
* Upgraded to Chrome 75 and Firefox 67.0.1 in the Docker container.
* Upgraded to use ChromeDriver 75.
* Upgraded the Coach that also uses latest Chrome and ChromeDriver.
* New Browsertime:
  * Added metric LastMeaningfulPaint that will be there when you collect `--visualElements` [848](https://github.com/sitespeedio/browsertime/pull/848).
  * You can get screenshots in your Chrome trace log using `--chrome.enableTraceScreenshots` [#851](https://github.com/sitespeedio/browsertime/pull/851)
  * Fixed the missing timings in the trace log in Chrome. Or rather they where there but you couldn't see them when you drag/drop the log into devtools [#850](https://github.com/sitespeedio/browsertime/pull/850).
  * Next version of Chrome (76) brings back the infobar that pushes down content see [upstream](https://bugs.chromium.org/p/chromium/issues/detail?id=818483). Lets remove the automated flag and test how that works [#853](https://github.com/sitespeedio/browsertime/pull/853).
  * Include the last 50 pixels when checking if the page is still orange, hopefully fixing the case where First Visual Change happens way too early [#854](https://github.com/sitespeedio/browsertime/pull/854).
* The +1 container uses Lighthouse 5.1.

### Fixed
* Only parse the domain in the third party plugin if we have a absolute URL [#2501](https://github.com/sitespeedio/sitespeed.io/pull/2501).
* Handle if GPSI doesn't return page statistics [#2499](https://github.com/sitespeedio/sitespeed.io/issues/2499).

## 9.2.1 - 2019-06-01
### Fixed
* `--help` was broken in 9.2.0.

## 9.2.0 - 2019-06-01

### Added
* The config file `--config` now supports extending other config files. Read [yargs documentation](https://github.com/yargs/yargs/blob/main/docs/api.md#extends-keyword) for how to use the extends keyword. Add `"extends":"/default.json"` to extend your config file named *default.json* file. One thing: The configuration files are merged and the extended ones keys are overriden if they exist in your configuration. This is upstream thing but maybe we can fix that in the future.

### Fixed
* Updated Browsertime to 5.1.3 that goes back to use default Selenium 3.6 (without CDP supports) and with CDP support implemented on the side. Also updated Coach with the latest Browsertime.


## 9.1.0 - 2019-05-30

### Added
* Upgraded to Firefox 67.0 in the Docker container.
* Upgraded to 0.8.2 of third-party-web
* Upgraded Browsertime that automatically pickup up visual metrics for elements with the elementtiming attribute. When it land in Chrome, this will make sure you will get it both in RUM and synthetic [#841](https://github.com/sitespeedio/browsertime/pull/841).
* Send CPU metrics as summmary per domain to Graphite/InfluxDB [#2480](https://github.com/sitespeedio/sitespeed.io/pull/2480)
* You can now see number of CPU long tasks on the summary page [#2479](https://github.com/sitespeedio/sitespeed.io/pull/2479)
* Upgraded to latest Perf Cascade thagt shows HAR content in new tab [#2478](https://github.com/sitespeedio/sitespeed.io/pull/2478)
* Show Visual Metrics defined by the user on metrics page [#2476](https://github.com/sitespeedio/sitespeed.io/pull/2476)
* WebPageTest: Send hero timings to Graphite/InfluxDB by default [#2474](https://github.com/sitespeedio/sitespeed.io/pull/2474)
* The new [performance leaderboard](https://dashboard.sitespeed.io/d/000000060/leaderboard?orgId=1)

### Fixed
* Upgraded the Coach with a bug fix that make sure a JavaScript loaded as defer isn't categorised as render blocking. Also the new version give known surveillance web sites lower score in privacy.
* Third party web sites (sites that themselves are third parties) counted all there own requests as third parties [#2475](https://github.com/sitespeedio/sitespeed.io/pull/2475).
* Getting the HTML content into your Chrome HAR included the full content object instead of just the plain text. Fixed in [#842](https://github.com/sitespeedio/browsertime/pull/842).
Using CPU metrics on Android phones was broken since 9.0.0, fixed in [#844](https://github.com/sitespeedio/browsertime/pull/844).

## 9.0.0 - 2019-05-21

### Added
* Upgraded to [Browsertime 5.0.0](https://github.com/sitespeedio/browsertime/blob/main/CHANGELOG.md#500---2019-05-16).

* Collect CPU long tasks in Chrome using `--chrome.collectLongTasks` using the [Long Task API](https://developer.mozilla.org/en-US/docs/Web/API/Long_Tasks_API). For the long tasks to work, we inject JS using the *Page.addScriptToEvaluateOnNewDocument* devtools command. We collect all long tasks and related data (not so much at the moment but will get better/more useful information when browsers supports it) and count the total number of long tasks, long tasks that happens before first paint and first contentful paint. Implemented in [#821](https://github.com/sitespeedio/browsertime/pull/821) and [#825](https://github.com/sitespeedio/browsertime/pull/825).

* By default a long task is >50ms. Wanna change that? Use `--minLongTaskLength` to set that yourselves (it needs to be larger than 50 ms though) [#838](https://github.com/sitespeedio/browsertime/pull/838).

* Throttle the CPU using Chrome with `--chrome.CPUThrottlingRate`. Enables CPU throttling to emulate slow CPUs. Throttling rate as a slowdown factor (1 is no throttle, 2 is 2x slowdown, etc). Implemented in [#819](https://github.com/sitespeedio/browsertime/pull/819).

* You can now use a .browsertime.json file as a default config json file that will be picked up automatically [#824](https://github.com/sitespeedio/browsertime/pull/824).

* Include the actual HTML in the HAR file for Chrome using `--chrome.includeResponseBodies html` [#826](https://github.com/sitespeedio/browsertime/pull/826)

* Use `--chrome.blockDomainsExcept` to block all domains except. Use it muliple times to have multiple domains. You can also use wildcard like *.sitespeed.io [#840](https://github.com/sitespeedio/browsertime/pull/840)

* You can use a `.siteespeed.io.json` file that holds default config setup when you run sitespeed.io [#2454](https://github.com/sitespeedio/sitespeed.io/pull/2454).

* We have moved all CPU metrics to a new tab called ... wait a minute .. CPU! [#2457](https://github.com/sitespeedio/sitespeed.io/pull/2457).

* If you use Chrome you can use `--cpu` to enable  to enable `--chrome.timeline` and `--chrome.collectLongTasks` in one go [#2457](https://github.com/sitespeedio/sitespeed.io/pull/2457).

* The film strip includes CPU long tasks [#2459](https://github.com/sitespeedio/sitespeed.io/pull/2459)

### Changed
* Replaced [Chrome-trace](https://github.com/sitespeedio/chrome-trace) with [Tracium](https://github.com/aslushnikov/tracium) in [#816](https://github.com/sitespeedio/browsertime/pull/816/). This means we use a Chrome blessed parser that will mean less work for us within the team! Enable it with `--chrome.timeline`. It also means two changes:
* We skipped reporting all internal events inside of Chrome and only report events that takes more than 10 ms. We do this because it makes it easier to understand which events actually takes time and are useful.
* Instead of reporting: Loading, Painting, Rendering, Scripting and Other we now report the same categories as Tracium: parseHTML, styleLayout, paintCompositeRender, scriptParseCompile,  scriptEvaluation, garbageCollection and other. This gives you a little more insights of CPU time spent.
* We collect more trace log than before (following Lighthouse, the trace log will be larger on disk), this makes it easier for you when you want to debug problems.

* Lighthouse: If you use the G+ container, Lighthouse has changed: The container uses Lighthouse 5.0, output HTML by default that is iframed into sitespeed.io. That means instead of seeing just the cherry picked metrics, you will now see the full Lighthouse result. See [#26](https://github.com/sitespeedio/plugin-lighthouse/pull/26).

* On the summary page, we show Third party summary from the median run instead of actual median metrics. That makes it one less click to see which 3rd party tools a web page is using [#2455](https://github.com/sitespeedio/sitespeed.io/pull/2455).

* Remember when you upgrade there are two things that can change: Metrics could be a little slower in Chrome since we now collect more trace log (only when you turn on CPU tracing) and there are new categoris for the CPU trace! If you use Lighthouse and had your own hack for including the HTML, that isn't needed any more.

### Fixed
* Bumped all dependencies that needed a bump [#2453](https://github.com/sitespeedio/sitespeed.io/pull/2453).

## 8.15.2 - 2019-05-05
### Fixed
* Upgraded Firefox to 66.0.4 to fix the issue that broke Firefox extension (making it impossible to get the HAR file etc).

## 8.15.1 - 2019-04-26
### Fixed
* Various bug fixes for GSC plugin, thank you [Markus Liljedahl](https://github.com/mliljedahl) for the PR [#2438](https://github.com/sitespeedio/sitespeed.io/pull/2438).

## 8.15.0 - 2019-04-23
### Added
* Use Chrome 74 stable in the Docker container and Chomedriver 74 (you need upgrade to Chrome 74).
* Upgraded Coach to match latest Browsertime version with Chrome and upgraded Browsertime to fix miss matched locked file in npm for ChromeDriver.

### Fixed
* We displayed error on the summary page even though we didn't have an error.

## 8.14.0 - 2019-04-23

### Added
* Collect errors from Browsertime and send them to Graphite/InfluxDB. This makes it possible to alert on failing runs in Grafana [#2429](https://github.com/sitespeedio/sitespeed.io/pull/2429). The metrics are sent under the key *browsertime.statistics.errors*.

* The GPSI in the g+ container was upgraded to gpagespeed 6.0.6.

* Upgraded to third-party-web 0.6.1 that includes more domains.

* Upgrading to [Browsertime 4.7.0](https://github.com/sitespeedio/browsertime/blob/main/CHANGELOG.md#470---2019-04-21) adds three new things to scripting:
  * You can add your own error `commands.error(message)`. The error will be attached to the latest tested page. Say that you have a script where you first measure a page and then want to click on a specific link and the link doesn't exist. Then you can attach your own error with your own error text. The error will be sent to your datasource and will be visible in the HTML result.

  * You can add meta data to your script with `commands.meta.setTitle(title)` and `commands.meta.setDescription(desc)`

* Upgrading to [Browsertime 4.8.0](https://github.com/sitespeedio/browsertime/blob/main/CHANGELOG.md#480---2019-04-23) fixes so errors thrown from your script, holds a usable error message instead of the wrapped ChromeDriver error.

### Fixed
* If a page failed, pug through an error [#2428](https://github.com/sitespeedio/sitespeed.io/pull/2428)

* The close (and open methods) of plugins missed waiting on all plugins before moving on as reported in [2431](https://github.com/sitespeedio/sitespeed.io/issues/2431) and [#2433](https://github.com/sitespeedio/sitespeed.io/issues/2433) and fixed in [#2434](https://github.com/sitespeedio/sitespeed.io/pull/2434).


## 8.13.0 - 2019-04-17

### Added
* Show the total number of third party requests and also add them as a column on the pages page [#2422](https://github.com/sitespeedio/sitespeed.io/pull/2422).

### Fixed
* Better error handling if one URL fails in a script by upgrading to Browsertime 4.6.4 and PageXray 2.5.6.

## 8.12.0 - 2019-04-11

### Added
* We updated Chrome to version 74 beta in the Docker container. The reason is that some users had problem running Chrome 73 in the container. You can read all about it in [#2416](https://github.com/sitespeedio/sitespeed.io/issues/2416). Most metrics looks the same. One thing we've seen is that there is a new event "RunTask" that is categorised as "Other" if you use `--chrome.timeline`. We will fix that later on, just a heads up! Updated in [#2419](https://github.com/sitespeedio/sitespeed.io/pull/2419).

### Fixed

## 8.11.2 - 2019-04-10

### Fixed
* Added missing User Timing measure duration in the HTML output. We have always collected that but we didn't show it in the HTML [#2417](https://github.com/sitespeedio/sitespeed.io/pull/2417).

## 8.11.1 - 2019-04-09

### Fixed
* Upgraded to Grafana 6.1.3 in the Docker compose file.
* Ugraded to Browsertime 4.6.2 that fixes Report duration metrics in CDP performance in ms.

## 8.11.0 - 2019-04-08

### Added
* Upgraded to [Browsertime 4.6.0](https://github.com/sitespeedio/browsertime/blob/main/CHANGELOG.md#460---2019-04-07) that enables the use of [Chrome DevTools Protocol](https://chromedevtools.github.io/devtools-protocol/). We now uses a modified version of Selenium that can use CDP. We also automatically collect the CDP performance metrics *Performance.getMetrics* (you can turn that off with `--chrome.cdp.performance false`). We also enabled raw use of the CDP in scripting: `cdp.sendAndGet(command, args)` and `cdp.send(command, args)` [#2410](https://github.com/sitespeedio/sitespeed.io/pull/2410).

* Show loadEventEnd in the metrics section and send it to Graphite/Grafana [#2411](https://github.com/sitespeedio/sitespeed.io/pull/2411).

* Upgraded third-party-web to 0.4.0 with almost 2000 new entities! Thank you [Simon Hearne](https://twitter.com/simonhearne) for that massive update.

* The Lighthouse plugin can now generate the default HTML report [#18](https://github.com/sitespeedio/plugin-lighthouse/pull/18), thanks [Semyon](https://github.com/SemyonLosmakov) for the PR.

### Fix

* Updated version of PerfCascade that catches if timings in the HAR is missing, hopefully partly fixing [#2408](https://github.com/sitespeedio/sitespeed.io/issues/2408).

## 8.10.1 - 2019-04-06

### Fixed
* Upgraded to PageXray 2.5.5 that fixes that the total number of requests was reported wrong for Firefox in some cases as reported in [#2409](https://github.com/sitespeedio/sitespeed.io/issues/2409).

## 8.10.0 - 2019-04-02

### Added
* Tag unmatched 3rd party request as unknown, that adds a category to keep track of in Graphite/Grafana [#2405](https://github.com/sitespeedio/sitespeed.io/pull/2405)

* List all unmatched third party domains on the third party pages to make it easier to catch unmatched third parties [#2404](https://github.com/sitespeedio/sitespeed.io/pull/2404).

* Updated the third-party-web project to 0.2.0 with more domains that get categorised.

## 8.9.0 - 2019-03-30

### Added

- Browsertime supports connectivity.alias option to give connectivity profiles a custom name, though this is not documented in the Sitespeed cli help, and not consistently used in Sitespeed. (only used for writing to DB, but not in reports). This PR adds option to sitespeed cli and uses the alias in html reports [#2397](https://github.com/sitespeedio/sitespeed.io/pull/2397). Thank you [Ferdinand Holzer](https://github.com/fholzer) for the PR.

- Reworked third party support: There's a new third party tab where we use [Patrick Hulce](https://github.com/patrickhulce) project [Third party web](https://github.com/patrickhulce/third-party-web) to categorise third party requests [#2394](https://github.com/sitespeedio/sitespeed.io/pull/2394). Requests get categorised and you can now see how many requests each category do (ads/analytics/sureillance etc). And also how many tools the page uses per type. These numbers are also automatically sent to Graphite/InfluxDB so you easily can create alerts if your content team adds third party content that you don't want.

### Fixed

- Using `--useHash` was broken (it was not populated to Browsertime). Fixed [#2393](https://github.com/sitespeedio/sitespeed.io/pull/2393).

- URLs in annotations where broken if your page used # as reported by [James Leatherman](https://github.com/leathej1) in [#2400](https://github.com/sitespeedio/sitespeed.io/issues/2400).

## 8.8.3 - 2019-03-25

### Fixed

- Upgraded to Browsertime 4.5.3 that fixes so that you can test the same URLs within the same script. There are users that logs in and logs out the user on the same URL and that breakes since we use the URL to create all the files for that URL. This hack adds a incremental query parameter to the URL.[#805](https://github.com/sitespeedio/browsertime/pull/805).

## 8.8.2 - 2019-03-22

### Fixed

- Upgraded Browsertime to 4.5.2 that adds logging if Visual Metrics fails, to make it easier for us to get better feedback for users. If you add `--verbose` to your run, the output from Visual Metrics will be logged.

## 8.8.1 - 2019-03-22

### Fixed

- Upgraded Browsertime to 4.5.1 that fixes the bug when recording visual metrics and clicking on links on Android phones.

## 8.8.0 - 2019-03-21

### Added

- Upgraded to Chrome 73 in the Docker container.
- Upgraded to Firefox 66 in the Docker container
- Added favicon, json, plain, svg and other and budget types. Thanks [PedroMSantosD](https://github.com/PedroMSantosD) for the PR [#2374](https://github.com/sitespeedio/sitespeed.io/pull/2374).
- The plus1 container now includes Lighthouse 4.2.0
- You can now debug log Lighthouse using `--verbose` , thank you [Gideon Pyzer](https://github.com/gidztech) for the original PR.
- New metrics for Firefox in stable (66): First contentful paint and time to first interactive. They are automatically sent to Graphite/InfluxDB. To make sure you catch that timeToFirstInteractive you may wanna change your page complete check to: `--pageCompleteCheck "return (function(waitTime) { if (window.performance.timing.timeToFirstInteractive > 0) { try { var end = window.performance.timing.loadEventEnd; return end > 0 && Date.now() > end + waitTime; } catch (e) { return true; } } else return false; })(arguments[arguments.length - 1]);"` - these are experimental metrics behind a flag in Firefox.

### Fixed

- Fixed broken disabling of screenshots [#2378](https://github.com/sitespeedio/sitespeed.io/pull/2378)

## 8.7.5 - 2019-03-13

### Fixed

- Upgrading Browsertime to 4.4.9 with two fixes:
  - Automatically catch if a user that uses a script misses calling measure.stop() [#798](https://github.com/sitespeedio/browsertime/pull/798).
  - If a runs fail, make sure Browsertime fails more gracefully [#799](https://github.com/sitespeedio/browsertime/pull/799).

## 8.7.4 - 2019-03-12

### Fixed

- In some cases alias wasn't picked up for URLs sent to Graphite/InfluxDB as reported in [#2341](https://github.com/sitespeedio/sitespeed.io/issues/2341) and fixed in [#2373](https://github.com/sitespeedio/sitespeed.io/pull/2373). Thank you [James Leatherman](https://github.com/leathej1) for taking the time to find a reproducible test case!
- Moved to internal UTC support in dayjs [#2370](https://github.com/sitespeedio/sitespeed.io/pull/2370).

## 8.7.3 - 2019-03-07

### Fixed

- Fix for getting the GCS to work [#2368](https://github.com/sitespeedio/sitespeed.io/pull/2368).

## 8.7.2 - 2019-03-07

### Fixed

- Added back the HTML folder for assets that was faulty excluded from git.

## 8.7.1 - 2019-03-07

### Fixed

- Fixed error log from chmod in the Docker container with a better check for if the extra start script exists.

## 8.7.0 - 2019-03-06

### Added

- Support for uploading result to Google Cloud Storage. Thank you [Markus Liljedahl](https://github.com/mliljedahl) for the PR [#2360](https://github.com/sitespeedio/sitespeed.io/pull/2360)!
- Set where to serve your assets with `--html.assetsBaseURL`. This is useful if you want to minimize the data stored and store the assets (JS/CSS/Images) on the side of your result folder. Thank you [Ferdinand Holzer](https://github.com/fholzer) for the PR [#2321](https://github.com/sitespeedio/sitespeed.io/pull/2321)
- Set your own annotation title [#2333](https://github.com/sitespeedio/sitespeed.io/pull/2333), thank you [Markus Liljedahl](https://github.com/mliljedahl) for the PR.
- Added HTML link in the Coach result from each advice type to individual advice [#2344](https://github.com/sitespeedio/sitespeed.io/pull/2344)
- Make it easy to use pageLoadTime in the new budget format [#2351](https://github.com/sitespeedio/sitespeed.io/pull/2351).
- You can now run your extra start script in the Docker container: `docker run -e EXTRA_START_SCRIPT=/sitespeed.io/test.sh --rm -v "$(pwd)":/sitespeed.io ...`. Thank you [Gideon Pyzer](https://github.com/gidztech) for the initial idea and version! See [#2363](https://github.com/sitespeedio/sitespeed.io/pull/2363).

### Fixed

- Upgraded to PageXray 2.5.4 that categorise first party using the actual domain instead of the full URL (as reported by [arunthilak](https://github.com/arunthilak)).
- Upgraded to [Browsertime 4.4.8](https://github.com/sitespeedio/browsertime/blob/main/CHANGELOG.md#448---2019-03-04).
- Lighthouse audit tag for InfluxDB, thank you [Semyon](https://github.com/SemyonLosmakov) for the PR [#2359](https://github.com/sitespeedio/sitespeed.io/pull/2359)
- Changed the unused message gc.finished to gcs.finished to work with comming Google Cloud Storage support [#2362](https://github.com/sitespeedio/sitespeed.io/pull/2362)

## 8.6.5 - 2019-02-28

### Fixed

- [Gideon Pyzer](https://github.com/gidztech) fixed the broken config parameter for Lighthouse (if you use the Lighthouse container) in [#10](https://github.com/sitespeedio/plugin-lighthouse/pull/10).

## 8.6.4 - 2019-02-24

### Fixed

- When sending annotations with `--graphite.annotationMessage` and not providing a screenshot the message and the extraMessage used to get concatenated without any space. Thank you [Markus Liljedahl](https://github.com/mliljedahl) for the PR [#2332](https://github.com/sitespeedio/sitespeed.io/pull/2332) that fixes that.

- Better error messages when sending data to Grafana. Thank you again [Markus Liljedahl](https://github.com/mliljedahl) [#2334](https://github.com/sitespeedio/sitespeed.io/pull/2334).

- Waterfall chart had colliding texts, the font is now slightly smaller [#2345](https://github.com/sitespeedio/sitespeed.io/pull/2345).

## 8.6.3 - 2019-02-21

### Fixed

- Upgraded to Browsertime 4.4.7 with fix for better finding last visual change in the video.

## 8.6.2 - 2019-02-20

### Fixed

- Upgraded to Browsertime 4.4.6 that adds better error handling if your multi script is broken or if a URL fails to load.

## 8.6.1 - 2019-02-19

### Fixed

- Upgraded to Browsertime 4.4.5 that changed so that 0.05% of the pixels could differ (instead of 0.01%) when finding the last visual change.

- Removed the Chrome specific setup in Chrome that was needed a long time ago [#2322](https://github.com/sitespeedio/sitespeed.io/pull/2322)

## 8.6.0 - 2019-02-17

### Fixed

- Show larger screenshots in filmstrip for mobile, fixing colliding metrics HTML and last screenshot showing twice [#2314](https://github.com/sitespeedio/sitespeed.io/pull/2314).
- Fix wrong count for errors/warnings for console log send to Graphite/InfluxDB. Before we sent 1 instead of the actual number of logs per page [#2316](https://github.com/sitespeedio/sitespeed.io/pull/2316).
- Fix coach table colouring. Thank you [Ferdinand Holzer](https://github.com/fholzer) for the PR [#2317](https://github.com/sitespeedio/sitespeed.io/pull/2317)!
- Removed [faulty guard](https://github.com/sitespeedio/sitespeed.io/commit/df3313540671406e570dbea30b909b8f0f22e75f) in budget that made sure only internal metrics worked for Lighthouse/GPSI/WebPageTest.

- New Browsertime versions that fixes:
  - If a Visual Element wasn't found, we used to log that as an error, instead log as info [#775](https://github.com/sitespeedio/browsertime/pull/775).
  - When trying to find the last visual change, a 0.01 % difference in pixels are now OK. We had problems finding too small difference that was picked up by Visual Metrics [#774](https://github.com/sitespeedio/browsertime/pull/774).

### Added

- Send console warnings by default to Graphite/InfluxDB per page (we used to only send errors by default) [#2315]-(https://github.com/sitespeedio/sitespeed.io/pull/2315).

- Support for crawler exclude pattern, use `--crawler.exclude`. Thank you [Ferdinand Holzer](https://github.com/fholzer) for the PR [#2319](https://github.com/sitespeedio/sitespeed.io/pull/2319).

## 8.5.1 - 2019-02-14

### Fixed

- Upgraded to Browsertime 4.4.2 that fixes the flickering of the timer in the video.

## 8.5.0 - 2019-02-13

### Added

- Support Lighthouse, WebPageTest or GPSI in the new budget format. See https://www.sitespeed.io/documentation/sitespeed.io/performance-budget/#full-example

### Fixed

- The produced budget JUnit file had an error reported [here](https://github.com/sitespeedio/sitespeed.io/issues/2307#issuecomment-463147211) and fixed in [#2311](https://github.com/sitespeedio/sitespeed.io/pull/2311)

- Added extra guard when chrome.timeline data is missing, so that the HTML will not break issue [#2310](https://github.com/sitespeedio/sitespeed.io/issues/2310) and [fixed](https://github.com/sitespeedio/sitespeed.io/commit/427d28f7119327cdbc06bc51700d2b8488e472f8).

- Browsertime 4.4.1 with a fix so that the timings in the video correctly match what happens on the screen.

## 8.4.0 - 2019-02-12

### Added

- Give your test a name with `--name` [#2302](https://github.com/sitespeedio/sitespeed.io/pull/2302). At the moment only used in the HTML.

- Upgraded to Browsertime [4.4.0](https://github.com/sitespeedio/browsertime/blob/main/CHANGELOG.md#440---2019-02-12):
  - There are two new cache clear commands: cache.clearKeepCookies() and cache.clear() (only working on Desktop) [#769](https://github.com/sitespeedio/browsertime/pull/769).
  - Updated RUM Speed Index to include upstream fix [#766](https://github.com/sitespeedio/browsertime/pull/766).
  - Make sure the body of the page is shown when setting the fullscreen to orange (when recording the video) [#767](https://github.com/sitespeedio/browsertime/pull/767)
  - Testing redirect URLs was broken since 8.0. If you test a URL, use that URL and if you click on a link, use the URL from the browser [#768](https://github.com/sitespeedio/browsertime/pull/768). If you where testing a URL that redirected and did't give it an alias, your key in Graphite/InfluxDB will change (back to as it was pre 8.0).

### Fixed

- Catch errors when creating the filmstrip, so that not the full test fails.
- Analysisstorer gives error when using script as reported in [#2305](https://github.com/sitespeedio/sitespeed.io/issues/2305) and fixed in [#2306](https://github.com/sitespeedio/sitespeed.io/pull/2306).

## 8.3.0 - 2019-02-10

### Added

- Use alias from the script when displaying URLs in the HTML, reported by [banuady](https://github.com/banuady) in [#2296](https://github.com/sitespeedio/sitespeed.io/issues/2296) and fixed in [#2297](https://github.com/sitespeedio/sitespeed.io/pull/2297).

- You can include the script your using in the HTML output with `--html.showScript` [#2298](https://github.com/sitespeedio/sitespeed.io/pull/2298). Be careful though with passwords or other secrets.

- Added json as output type for the budget. Set `--budget.output json` and it will store _budgetResult.json_ in your result directory [#2299](https://github.com/sitespeedio/sitespeed.io/pull/2299).

- Upgraded to Browsertime [4.3.0](https://github.com/sitespeedio/browsertime/blob/main/CHANGELOG.md#430-2019-02-10) with new addText.bySelector(text, selector) command + fixed so click.byJs and click.byJsAndWait works on elements that is hidden.

- Added endpoint to s3 configurations to allow for pushing HTML reports to Digital Ocean's Spaces as it is S3 compatible. [#2072]

### Fixed

- Upgraded to Browsertime [4.2.6](https://github.com/sitespeedio/browsertime/blob/main/CHANGELOG.md#426-2019-02-08) with two fixes:
  - Command set value by id was broken, it used to set the value to the id [#761](https://github.com/sitespeedio/browsertime/pull/761).
  - I've missed that for some URLs (as in this [login](https://github.com/sitespeedio/sitespeed.io/issues/2290#issuecomment-461601990) you could have an alias for an URL but the URL was actually slightly different. For example, you login to a site and the login step redirect to a URL and for that URL one value of a GET parameter differs. So with this fix we lock the alias tyo one specific URL. If your URL change and you use an alias, the first variation of the URL will be used [#763](https://github.com/sitespeedio/browsertime/pull/763).
- Spelling for the script-reader message (was scrtipt-reader).

## 8.2.3 2019-02-06

### Fixed

- Upgraded to Browsertime [4.2.5](https://github.com/sitespeedio/browsertime/blob/main/CHANGELOG.md#425---2019-02-06) that hopefully fixes the wrong metrics inserted into the HAR file if you run test multiple pages.

## 8.2.2 2019-02-05

### Fixed

- Warn in the log if you try to run a script without a --multi parameter [#2288](https://github.com/sitespeedio/sitespeed.io/pull/2288).

## 8.2.1 2019-02-04

### Fixed

- New Browsertime [4.2.4](https://github.com/sitespeedio/browsertime/blob/main/CHANGELOG.md#424---2019-02-04) with fixed bug for commands set.innerHtml and click.byXpath.

## 8.2.0 2019-02-04

### Added

- New Browsertime [4.2.3](https://github.com/sitespeedio/browsertime/blob/main/CHANGELOG.md) with:
  - Fixed so that `js.run()` returns whatever it gets back so you can script and get whatever you need from your page [#749](https://github.com/sitespeedio/browsertime/pull/749).
  - New help command **set** to set innerHtml, innerText and value of element. [#750](https://github.com/sitespeedio/browsertime/pull/750).
  - Added click.bySelector and rewrote most of click methods to use plain JavaScript instead of Selenium (so it will work on hidden elements) [#751](https://github.com/sitespeedio/browsertime/pull/751).
  - The HAR file had wrong visual metrics as reported in [#754](https://github.com/sitespeedio/browsertime/issues/754). Fixed in [#756](https://github.com/sitespeedio/browsertime/pull/756).
  - Fixed borders when running Visual Metrics to try to avoid small orange in the first frame for Chrome [#755](https://github.com/sitespeedio/browsertime/issues/755) fixed in [#757](https://github.com/sitespeedio/browsertime/pull/757).
- Added endpoint as an configurable argument for s3 options, making it possible to use Digital Ocean for storage (and others)[#2285](https://github.com/sitespeedio/sitespeed.io/pull/2285)

## 8.1.1 - 2019-02-01

### Fixed

- Updated Coach to use latest Browsertime

## 8.1.0 - 2019-02-01

### Added

- New tab showing the filmstrip (if you record a video and keep the screenshots). We had the screenshots forever but never done anything with them. Inspired by [Stefan Burnickis](https://github.com/sburnicki) work on https://github.com/iteratec/wpt-filmstrip [#2274](https://github.com/sitespeedio/sitespeed.io/pull/2274).
- Show Server Timings in the metric section (if the page uses Server Timing) [#2277](https://github.com/sitespeedio/sitespeed.io/pull/2277).
- Upgraded the Docker container to use Chrome 72 and Firefox 65.
- Upgraded to [Browsertime 4.1](https://github.com/sitespeedio/browsertime/blob/main/CHANGELOG.md#410---2019-01-31) with latest ChromeDriver and Geckodriver. There's also a new command `js.runAndWait('')` that makes it possible to run your own JavaScript, click a link and wait on page navigation.

### Fixed

- Show FullyLoaded instead of N/A on metric pages per run [#2278](https://github.com/sitespeedio/sitespeed.io/pull/2278).
- Added missing pre/post script in the CLI (thanks Cheng Chi!) [#2282](https://github.com/sitespeedio/sitespeed.io/pull/2282).

## 8.0.6 - 2019-01-28

### Fixed

- Bugfix: In Browsertime 4.0.3 upgrade of Visual Metrics removed a couple fixes that should be there [#740](https://github.com/sitespeedio/browsertime/pull/740).

## 8.0.5 - 2019-01-27

### Fixed

- Bugfix: New Browsertime that fixes that the font in the video was to big when testing on mobile/emulated mobile in Chrome [#738](https://github.com/sitespeedio/browsertime/pull/738).

## 8.0.4 - 2019-01-24

### Fixed

- New version of the Coach that catches if your firstParty regex doesn't match any requests.
- New Browsertime 4.0.3 with two bug fixes:
- Bugfix: Calculating Visual Complete 85/95/99 was broken IF the complete process went backward (first hitting 85% and then going down to < than 85%). We usedto always take the first metric over 85% and then stick to it. Now we choose the last time it breaks the 85/95/99% metric [#732](https://github.com/sitespeedio/browsertime/pull/732).

- We updated the Visual Metrics lib to use the latest upstream version. We haven't updated for a while and we had issues where [the progress was calculated wrong](https://github.com/sitespeedio/sitespeed.io/issues/2259#issuecomment-456878707) [#730](https://github.com/sitespeedio/browsertime/pull/730).

## 8.0.3 - 2019-01-23

### Fixed

- Testing URLs that redirects made GPSI/Lighthouse fail as reported in [#2260](https://github.com/sitespeedio/sitespeed.io/issues/2260). This is fixed in [#2262](https://github.com/sitespeedio/sitespeed.io/pull/2262).

## 8.0.2 - 2019-01-22

### Fixed

- Added links to documentation to scripting/spa in the CLI.
- Updated to Browsertime 4.0.2 with one fix for [#2259](https://github.com/sitespeedio/sitespeed.io/issues/2259).

## 8.0.1 - 2019-01-22

### Fixed

- WebPageTest, GPSI and Lighthouse now logs that they cannot handle scripting/multiple pages at the moment (and Lighthouse upgraded to the latest version in the Docker file).

## 8.0.0 - 2019-01-21

Read the blog post: [https://www.sitespeed.io/sitespeed.io-8.0-and-browsertime.4.0/](https://www.sitespeed.io/sitespeed.io-8.0-and-browsertime.4.0/).

### Added

- Upgraded to the Coach 3.0 with Privacy advice, see [https://www.sitespeed.io/coach-3.0/](https://www.sitespeed.io/coach-3.0/).
- Upgraded to PageXray 2.5.
- Upgraded to Chrome 71 and Firefox 64 in the Docker container
- Use fully loaded metric from the HAR instead of the Resource Timing API [#2242](https://github.com/sitespeedio/sitespeed.io/pull/2242) and [#2244](https://github.com/sitespeedio/sitespeed.io/pull/2244).
- Group metrics by type in HTML output [#2240](https://github.com/sitespeedio/sitespeed.io/pull/2240)
- Show timing metrics in ms/s (instead of just ms) [#2245](https://github.com/sitespeedio/sitespeed.io/pull/2245)
- Use Browsertime 4.0 that adds support for testing Single Page Applications and test multiple pages with scripting. See the [Browsertime changelog](https://github.com/sitespeedio/browsertime/blob/main/CHANGELOG.md#400-beta1---2019-01-14) [#2236](https://github.com/sitespeedio/sitespeed.io/pull/2236)
- There's a new and simpler way of setting up a budget file [#2252](https://github.com/sitespeedio/sitespeed.io/pull/2252) and [#2253](https://github.com/sitespeedio/sitespeed.io/pull/2253)

### Fixed

- Tag CPU data and Lighthouse data smarter that is sent to InfluxDB. Pre this version you could get the CPU data but it was kind of hard to understand the tags. With this fix we add a cpu tag that either is category or event. That way it's easier to pickup (and understand) that data. We also added a audit tag for Lighthouse tests sent to InfluxDB. Before the fix we just sent "score" but no tag telling which score. We now add a tag named audit that tells which audit that is used for the score.[#2225](https://github.com/sitespeedio/sitespeed.io/pull/2225)
- Fixed running multiple URLs when using WebPageReplay [#2228](https://github.com/sitespeedio/sitespeed.io/pull/2228).
- Page names in URLs (used in Graphite etc) now get paranthesis () replaced with an underscore [#2239](https://github.com/sitespeedio/sitespeed.io/pull/2239).

### Tech

- Changed from moment to DayJS [#2200](https://github.com/sitespeedio/sitespeed.io/pull/2200).
- Removed Bluebird and making sure we use native Promises and await/async [#2205](https://github.com/sitespeedio/sitespeed.io/pull/2205).
- Removed old usage of var and replaced with let/const [#2241](https://github.com/sitespeedio/sitespeed.io/pull/2241)

## 7.7.3 - 2018-12-21

### Fixed

- Docker container updated with latest Firefox and Chrome (to fix the Firefox update popup [#2234](https://github.com/sitespeedio/sitespeed.io/issues/2234).

## 7.7.2 - 2018-10-25

### Fixed

- Multiple InfluxDB annotations bugs: The InfluxDb plugin sent a graphite.setup message to say it's alive (instead of influxdb.setup) doh [#2191](https://github.com/sitespeedio/sitespeed.io/pull/2191). The tag handling was broken for annotations [#2192](https://github.com/sitespeedio/sitespeed.io/pull/2192). Bug [#2190](https://github.com/sitespeedio/sitespeed.io/issues/2190).

## 7.7.1 - 2018-10-24

### Fixed

- The wrong run was linked in the HAR file (and then wrongly displayed in compare.sitespeed.io) [#2188](https://github.com/sitespeedio/sitespeed.io/pull/2188).
- Updated to Browsertime 3.11.1 that fixes the higher deviation in visual metrics in Chrome introduced in earlier version [Browsertime #655](https://github.com/sitespeedio/browsertime/issues/655).

- Use latest Coach 2.4.0

## 7.7.0 - 2018-10-22

### Fixed

- New Browsertime 3.10.0 with latest ChromeDriver and a fix for the bug when you set a cookie and the same time use --cacheClearRaw.
- Upgraded to Perf Cascade 2.5.5

### Added

- Upgraded to Chrome 70 in the Docker container.

## 7.6.3 - 2018-10-16

### Fixed

- Screenshots for Grafana annotations wasn't working in earlier versions. Thank you Jonas Ulrich for reporting! [#2182](https://github.com/sitespeedio/sitespeed.io/pull/2182).

## 7.6.2 - 2018-10-15

### Fixed

- New [Browsertime 3.8.2](https://github.com/sitespeedio/browsertime/blob/main/CHANGELOG.md#382) that finally fixes the problem for Firefox introduced in 7.6.0.

## 7.6.1 - 2018-10-15

### Fixed

- In Browsertime 3.8.0 Firefox visual metrics was broken if you use the Browsertime extension (the first visual change was higher than it should). The problem was that orange div (that is used for video) didn't work with perfectly with the extension server [#649](https://github.com/sitespeedio/browsertime/pull/649).

## 7.6.0 - 2018-10-15

### Added

- Upgraded to [Browsertime 3.8.0](https://github.com/sitespeedio/browsertime/blob/main/CHANGELOG.md#380---2018-10-15). The new version changes how the change happen bewteen preURL/preScript and the URL being tested. Before we automatically turned the screen white between pre runs and the URL. Now we do not do that. The metrics will be the same but when you look at the video, it will start with the pre URL instead of a white screen. This fixes bugs like [#2091](https://github.com/sitespeedio/sitespeed.io/issues/2091) where routing through hash wasn't getting the right first visual change (and other bugs).

## 7.5.2 - 2018-10-12

### Fixed

- The Lighthouse plugin always runs Lighthouse after Browsertime is finished (to make sure only one instance of Chrome runs at the same time).

## 7.5.1 - 2018-10-10

### Fixed

- Updated to Browsertime 3.7.1 that fixes the problem of setting User Agent in Firefox (and making --mobile fail when using Firefox).

## 7.5.0 - 2018-10-10

### Added

- Upgraded to Browsertime 3.5.0 with the following additions:

  - We support timings for visual elements (by adding `--visuaElements`). Browsertime picks up the largest image and the largest H1. You can also configure your own elements `--scriptInput.visualElements`. First let give credit to the ones that deserves it: As far as we know [Sergey Chernyshev](https://twitter.com/sergeyche) was the first one that introduced the idea of measuring individual elements in his talk [Using Heat Maps to improve Web Performance Metrics](https://www.youtube.com/watch?v=t6l9U5bC8jA). A couple of years later this was implemented by the [Joseph Wynn](https://twitter.com/joseph_wynn) of SpeedCurve, that later on contributed back the implementation to WebPageTest (calling it "hero"-elements). [Patrick Meenan](https://twitter.com/patmeenan) (the creator of WebPageTest) moved on the implementation to [Visual Metrics](https://github.com/WPO-Foundation/visualmetrics) that Browsertime uses to pickup visual metrics from the video. We removed the [hero naming]() and now it's ready to use.

  - We also added a new feature: If you run your own custom script you can now feed it with different input by using `--browsertime.scriptInput.*`. Say you have a script named myScript you can pass on data to it with `--browsertime.scriptInput.myScript 'super-secret-string'`. More about this in the documentation the coming weeks.

  - Upgraded to ChromeDriver 2.42.0

- You can include screenshots in annotations sent to Graphite/InfluxDB [#2144](https://github.com/sitespeedio/sitespeed.io/pull/2144). This makes it easy that from within Grafana see screenshots from every run.

- When linking to a sitespeed.io result we include index.html in the URL, so that you can use storages that doesn't automagically redirect from / to /index.html (a.k.a Digital Ocean storage).

- You can use `--injectJs` to inject JavaScript into the current page (only Firefox at the moment) at document_start. More info: https://developer.mozilla.org/docs/Mozilla/Add-ons/WebExtensions/API/contentScripts

- Browsertime collects the Firefox only metric _timeToDomContentFlushed_. It is also pushed to Graphite/InfluxDB by default. There are rumours saying that this metric will be betterthat time to non blank for some web sites.

- All metrics in the Paint Timing API (First Paint and First Contentful Paint in Chrome) are also pushed to Graphite/InfluxDB by default.

- All metrics are also reported with stddev (not only median stdev).

- There's a standalone [Lighthouse](https://github.com/GoogleChrome/lighthouse) plugin that can be used from 7.5: https://github.com/sitespeedio/plugin-lighthouse
  And we made it easy to use Lighthouse and the GPSI plugin by releasing the +1 Docker container [#2175](https://github.com/sitespeedio/sitespeed.io/pull/2175). You can run it with
  `docker run --shm-size=1g --rm -v "$(pwd)":/sitespeed.io sitespeedio/sitespeed.io:7.5.0-plus1 https://www.sitespeed.io/` and you will also automatically run Lighthouse and GPSI. We will automatically release a new version of the container per release by adding _-plus1_ to the tag. If you use Graphite/InfluxDb the score from Lighthouse and GPSI will be automatically stored. If you want to add functionality pleae send PRs to https://github.com/sitespeedio/plugin-lighthouse and https://github.com/sitespeedio/plugin-gpsi.

- We added support for Grafana annotations (instead of using Graphite/InfluxDB annotations). In Grafana 5.3.0-beta2 (and later) the annotations has template support. Use Grafana annotations by configure `--grafana.host` and `--grafana.port`.

- You can give alias for URLs in the CLI with `--urlAlias`. The number of alias needs to match the number of URLs. If you add the cli parameter, it will override alias that you can give to an URL within a file [#2133](https://github.com/sitespeedio/sitespeed.io/pull/2133)

- We have been old and conservative in how we use # when creating URLs: From the beginning (6+ years ago) we always left out # from URLs when we decided if a URL is unique or not. Now you can choose yourself with `--useHash` [#2142](https://github.com/sitespeedio/sitespeed.io/pull/2142).

- There's a new version of the dashboards for Graphite, trying to make it easier to find regressions: https://github.com/sitespeedio/grafana-bootstrap-docker

### Fixed

- Upgraded to Browsertime 3.7.0 that changed how Basic Auth is handled: We send a basic auth request header instead of using the build in Web Extension [#2151](https://github.com/sitespeedio/sitespeed.io/issues/2151).

- Chrome in some case(s) generates a HAR with broken timings that caused sitespeed.io to log error and not being able to collect timings per domain [#2159](https://github.com/sitespeedio/sitespeed.io/issues/2159). Fixed by [#2160](https://github.com/sitespeedio/sitespeed.io/pull/2160).

- We updated to PageXray 2.4.0 that correctly pick up mime types for video/audio/xml and pdf (that was missed before).

- Updated to [Coach 2.3.0](https://github.com/sitespeedio/coach/blob/main/CHANGELOG.md) that fixes so that the CSS advice never can be a negative score.

- Fixed the bug that made us show wrong video/screenshot on page summary[#2169](https://github.com/sitespeedio/sitespeed.io/pull/2169). Before we always showed the first screenshot/video. Now we show the median pick (so it correlates to the right waterfall and metrics tab).

- There have been multiple problems with navigations with hash route see for example [#2091](https://github.com/sitespeedio/sitespeed.io/issues/2091). We fixed so we don't get that error + Chrome 69 changed the internal trace log so it (at least on our side) seems to work better. Please report back if you still see issues.

### Tech

- You can now use markdown in the pug templates - `!{markdown.toHTML(value)}`

## 7.4.0 - 2018-09-14

### Added

- Upgraded to Chrome 69 in the Docker container.
- Upgraded to Firefox 62 in the Docker container.

### Fixed

- Upgraded to Browsertime 3.4.1: There have been several [bugs](https://github.com/sitespeedio/sitespeed.io/issues/1949) when using a preScript to login and then measure a page, resulting in errors. The problem has been how we find the first frame + a bug that didn't make the video with orange frames between different pages. Thats been fixed in [#633](https://github.com/sitespeedio/browsertime/pull/633). Thank you [Grigory Kurmaev](https://github.com/Pe4enie) who shared the exact setup to reproduce the bug!

- There was a bug that made it impossible to set your own device name when running Chrome in emulated mode [#2146](https://github.com/sitespeedio/sitespeed.io/pull/2146).

## 7.3.6 - 2018-08-09

### Fixed

- Updated the CLI to link to how to setup connectivity.
- Detailed and summary page show wrong metrics if you test on multiple domains [#2134](https://github.com/sitespeedio/sitespeed.io/issues/2134).
- Updated [fix release](https://github.com/sitespeedio/browsertime/blob/main/CHANGELOG.md#331---2018-08-09) of Browsertime that makes the log cleaner and easier to use.

## 7.3.5 - 2018-07-29

### Fixed

- Updated the Docker container to use Chrome 68.

## 7.3.4 - 2018-07-26

### Fixed

- 7.3.1, 7.3.2, 7.3.3 got stuck at npm :(

## 7.3.1 - 2018-07-26

### Fixed

- There was a bug in 7.3.0 that broke the annotation link.

## 7.3.0 - 2018-07-25

### Fixed

- Added missing grups for a couple of Browsertime cli params so that when you run help all parameters are sorted in the right group [#2113](https://github.com/sitespeedio/sitespeed.io/pull/2113).

### Added

- You can now append text and HTML to the annotation sent to Graphite. This is useful if you want to add extra info to the annotation. Use it like this `--graphite.annotationMessage` [#2114](https://github.com/sitespeedio/sitespeed.io/pull/2114). Thanks to [@svampen](https://github.com/Svampen) that had the idea in [#2102](https://github.com/sitespeedio/sitespeed.io/issues/2102).
- You can also add extra tags to the annotation `--graphite.annotationTag` [#2112](https://github.com/sitespeedio/sitespeed.io/pull/2112).

## 7.2.3 - 2018-07-23

### Fixed

- Wrong formating for date for statsd in some cases as reported in [#2106](https://github.com/sitespeedio/sitespeed.io/issues/2106). Fixed with [#2107](https://github.com/sitespeedio/sitespeed.io/pull/2107) by [Omri](https://github.com/omrilotan) - much love :)

## 7.2.2 - 2018-07-20

### Fixed

- Updated to Browsertime 3.2.3 with two important fixes: Fix error log when you remove the video and keep visual metrics [Browsertime #621](https://github.com/sitespeedio/browsertime/pull/621) and changed timeout from 5s to 50s when waiting on navigation [#623](https://github.com/sitespeedio/browsertime/pull/623).

## 7.2.1 - 2018-07-15

### Fixed

- Updated Browsertime with 3.2.1 that fixes multiple cookies support and refreshed browsertime extension. Also fixes User Timing metrics using dots.
- Firefox sometimes creates a HAR that is broken, guard our code against HAR with null response content size [#2096](https://github.com/sitespeedio/sitespeed.io/pull/2096).

## 7.2.0 - 2018-06-30

### Added

- Use Browsertime 3.2.0 that fixed Firefox browsertime extension support (broken in Firefox when we upgraded to 61 since FF changed the API) and added support for easily adding a cookie: `--cookie name=value`

## 7.1.3 - 2018-06-27

### Fixed

- Copy assets first before generating assets, making pages work even if parts fail [#2081](https://github.com/sitespeedio/sitespeed.io/pull/2081).
- The Docker container uses Firefox 61 stable.
- Upgraded to [Browsertime 3.1.4](https://github.com/sitespeedio/browsertime/blob/main/CHANGELOG.md#314---2018-06-25) including latest Geckodriver.
- Upgraded the [Coach to 2.0.4](https://github.com/sitespeedio/coach/blob/main/CHANGELOG.md#204---2018-06-25) with a fix that makes sitespeed.io faster when generating the result if you you are using many runs.

and Coach 2.0.4.

## 7.1.2 - 2018-06-12

### Fixed

- Based on correct Docker container to get the right ADB version.

## 7.1.0 - 2018-06-12

### Added

- Upgraded to Chrome 67 see [#2069](https://github.com/sitespeedio/sitespeed.io/issues/2069) about possible performance regressions. At least for Wikipedia some URLs are slower on 67 than 66. And since 67 now rolled out to a lot of people, you probably want to test with that version. See https://bugs.chromium.org/p/chromium/issues/detail?id=849108
- Upgraded to Browsertime 3.1.2 with ChromeDriver 2.40
- Upgraded to Firefox 61 beta13
- Upgraded ADB to work together with ChromeDriver > 2.38, making driving Chrome on Android from Ubuntu Docker container work again.

## 7.0.3 - 2018-06-02

### Fixed

- Upgraded to PerfCasacde 2.5.2 that fixes Edge tab bug.
- Upgraded to Browsertime 3.1.0 with new ChromeDriver (2.39).
- Upgraded to Browsertime 3.1.1 with a fix for HTTP2 pushes in Chrome [#2068](https://github.com/sitespeedio/sitespeed.io/issues/2068).

## 7.0.2 - 2018-06-01

### Fixed

- We reverted the change of using pageLoadStrategy _none_ as default (we now use normal as we done since day 1). This means it is easier for users that uses pre/post script = you will get control when the page has finished loading instead of when navigation starts. You can still use the none option by adding `--pageLoadStrategy none` to your run (that is useful if you want to end your tests earlier).

## 7.0.1 - 2018-05-30

### Fixed

- Upgraded to latest Browsertime (3.0.16) containing two fixes: Using Throttle changing networks failed in Docker for multiple runs [#2063](https://github.com/sitespeedio/sitespeed.io/issues/2063) and HTTP2 push assests missing sometimes in the waterfall for Chrome [Chrome-HAR #21](https://github.com/sitespeedio/chrome-har/pull/21).

## 7.0.0 - 2018-05-24

Read more about [sitespeed.io 7.0](https://www.sitespeed.io/sitespeed.io-7.0/).

### Added

- A lot of love for WebPageTest: Bugfix for getting Chrome timing metrics per run [#2046](https://github.com/sitespeedio/sitespeed.io/pull/2046), show the WebPageTests id and tester name in the HTML [#2047](https://github.com/sitespeedio/sitespeed.io/pull/2047), use WebPageTest screenshot if you don't run Browsertime [#2048](https://github.com/sitespeedio/sitespeed.io/pull/2048), show some Lighthouse metrics you use Lighthouse [#2049](https://github.com/sitespeedio/sitespeed.io/pull/2049) and show some of those interactive metrics if they exists [#2050](https://github.com/sitespeedio/sitespeed.io/pull/2050).
- Link directly to each individual run if you use WebPageTest [#2045](https://github.com/sitespeedio/sitespeed.io/pull/2045).
- Add StatsD support (with bulking). Thank you [Omri](https://github.com/omrilotan) for the PR [#1994](https://github.com/sitespeedio/sitespeed.io/pull/1994).
- We upgraded to [Browsertime 3.0](https://github.com/sitespeedio/browsertime/blob/main/CHANGELOG.md#300).
- We upgraded the S3 plugin that fixes (all) the problems we have seen with large files failing to upload [#2013](https://github.com/sitespeedio/sitespeed.io/pull/2013).
- Get console messages from Chrome in the HTML output and send the number of errors to Graphite/InfluxDB by default.
- You can now change safe char for groups/domain in InfluxDB with --influxdb.groupSeparator. Thank you [amic87](https://github.com/amic81) for your PR!

## Fixed

- InfluxDB event annotations overwrite within test session. Thanks [Michael J. Mitchell](https://github.com/mitchtech) for the PR [#1966](https://github.com/sitespeedio/sitespeed.io/issues/1966).

- Sanitize path segments when creating folder (taking care of bad characters when creating new folders) - Thank you [Ryan Siddle](https://github.com/rsiddle) for the PR! [#1961](https://github.com/sitespeedio/sitespeed.io/pull/1961)

- If you are a InfluxDB user, your tags now will hold more info (not only category tags). Thank you [Icecold777](https://github.com/Icecold777) for the PR [#2031](https://github.com/sitespeedio/sitespeed.io/pull/2031)

## Changed

- We upgraded Browsertime to [3.0](https://www.sitespeed.io/browsertime-3.0/).

- To collect the Chrome timeline you should now use `--browsertime.chrome.timeline` instead of the old `--browsertime.chrome.collectTracingEvents`

- To collect Visual Metrics add `--visualMetrics` (instead of the old `--speedIndex`)

- You can now choose for what kind of content you want to include the response bodies when you use Firefox: `--browsertime.firefox.includeResponseBodies` 'none', 'all', 'html'

- We finetuned the tabs in the result pages and followed Browsertime and make all output 1 based instead of 0.

- We tried to make CLI parameters the same as with Browsertime, so that you can use the same for both tools (meaning most of the parameters you don't need to append with _browsertime_. Check sitespeed.io --help

## Breaking changes

As a sitespeed.io user there shouldn't be any breaking changes upgrading from 6.x to 7. However since Browsertime (and latest Firefox) is so much leaner and cleaner you will probably notice that most of your timing metrics will be lower than before.

<strike>If you are using a preScript to login the user, you need to wait/verify that the page has actually loaded before you try to manipulate the page, since Browsertime 3.0 change pageLoadStrategy from _normal_ to _none_ meaning you will be in control direct after the navigation.</strike> - We reverted this in 7.0.2.

### Plugin makers

- The screenshot is not passed as messages anymore to decrease the memory impact. If you need them, you need to get them from disk instead of the queue.
- The Chrome trace log is not passed as messages anymore to decrease the memory impact by default. Add `--postChromeTrace` to pass around the Chrome trace to other plugins.

## 6.5.3 2018-04-07

## Added

- Upgraded to Browsertime 2.5.0 with fixes for the HAR in Chrome 66 and fix with User Timing measurements. Thanks [@knaos](https://github.com/knaos) for reporting and finding the issue.

## 6.5.2 2018-03-30

### Fixed

- Upgraded PageXray to 2.2.1 that fixed measuring the size of 304 responses [#1963](https://github.com/sitespeedio/sitespeed.io/issues/1963).

## 6.5.1 2018-03-22

### Fixed

- If the WebPageTest location contained a space, we sent that space to Graphite. That deosn't work, so we now make the location a safe key [#1958](https://github.com/sitespeedio/sitespeed.io/issues/1958).

## 6.5.0 2018-03-20

### Added

- You can now choose if sitespeed.io will return an error exit code if your budget fails with --budget.suppressExitCode see [#1934](https://github.com/sitespeedio/sitespeed.io/issues/1934) and [#1936](https://github.com/sitespeedio/sitespeed.io/pull/1936)

- You can now set ACL for S3 uploads [#1937](https://github.com/sitespeedio/sitespeed.io/pull/1937). Thank you [lbod](https://github.com/lbod) for the PR.

### Fixed

- If WebPageTest fails, we now catch those errors better [#1942](https://github.com/sitespeedio/sitespeed.io/pull/1942). Thank you [Lorenzo Urbini](https://github.com/siteriaitaliana) for the PR!

- Running WebPageTest without Browsertime made the pages.pug fail [#1945](https://github.com/sitespeedio/sitespeed.io/issues/1945).

- Upgraded to Pug 2.0.1 fixing various Pug problems caused by Pug internal version problems, see https://github.com/pugjs/pug/issues/2978

- Bumped dependencies [#1952](https://github.com/sitespeedio/sitespeed.io/pull/1952).

- Fix HTML output summary for User Timings within Timing Summary table.

- Docker: Kill some left over processes when you start a new URL, thanks [Vitaliy Honcharenko](https://github.com/vgoncharenko) [#1952](https://github.com/sitespeedio/sitespeed.io/pull/1924). We will fix this in another way in coming Browsertime 3.0.

## 6.4.1 2018-03-07

### Fixed

- Upgraded from pug 2.0.0-rc4 to pug 2.0.0

## 6.4.0 2018-03-07

### Fixed

- New cleaner pre-compiled WebPageReplay in the WebPageReplay Docker container
- Updated to latest Browsertime 2.2.2, checkout the [changelog](https://github.com/sitespeedio/browsertime/blob/2.x/CHANGELOG.md#version-222-2018-02-22)

### Added

- We now show CPU stats for Chrome in the HTML and send it to Graphite if you configure Browsertime to collect it [#1914](https://github.com/sitespeedio/sitespeed.io/pull/1914).

## 6.3.5 2018-02-13

### Fixed

- Adding --filterList as parameter made changing the metrics filter fail [#1915](https://github.com/sitespeedio/sitespeed.io/pull/1915).

## 6.3.4 2018-02-11

### Fixed

- Changing the metrics filter didn't work since 6.x, there was an assumption about messages that was wrong. [#1912](https://github.com/sitespeedio/sitespeed.io/pull/1912).

## 6.3.3 2018-02-08

### Fixed

- There's been a major slowdown between 5 -> 6 when you generated HTML as reported in [#1901](https://github.com/sitespeedio/sitespeed.io/issues/1901). This has been fixed by [#1909](https://github.com/sitespeedio/sitespeed.io/pull/1909) and made faster than in 5.x by [#1910](https://github.com/sitespeedio/sitespeed.io/pull/1910).

## 6.3.2 2018-02-05

### Fixed

- Adding back the -preURL options that mystically has been removed from the CLI (--browsertime.preURL still worked though). Thanks [@aerwin](https://github.com/aerwin) for reporting - [#1904](https://github.com/sitespeedio/sitespeed.io/issues/1904)
- There are user timings that broke the HTML output see [#1900](https://github.com/sitespeedio/sitespeed.io/issues/1900)

## 6.3.1 2018-02-01

### Fixed

- In last release we accidently changed to only send first view metrics (by default) per page when you are using WebPagetest. We changed that and now send metrics for both first and second view. Thanks [@wolframkriesing](https://github.com/wolframkriesing) for letting us now.

- Guard against missing WPT data see [#1897](https://github.com/sitespeedio/sitespeed.io/issues/1897) and [#1899](https://github.com/sitespeedio/sitespeed.io/pull/1899).

## 6.3.0 2018-01-24

### Added

- Better default metrics for WebPageTest data in data storage. We now collect more metrics than before, see [#1871](https://github.com/sitespeedio/sitespeed.io/pull/1871). Thank you [Jean-Pierre Vincent](https://github.com/jpvincent) for contributing with your better default values. Jean-Pierre has also contributed with [better dashboards](https://github.com/sitespeedio/grafana-bootstrap-docker) for WebPageTest.

- Upgraded to VideoJS 6.6 with smoother progress bar [#1864](https://github.com/sitespeedio/sitespeed.io/pull/1864).

- Browsertime and WebPageTest plugin now sends browsertime.setup or webpagetest.setup when they are in the setup phase, so other plugins know that they will run [#1875](https://github.com/sitespeedio/sitespeed.io/pull/1875).

- If you run WebPageTest standalone (without Browsertime) you will now get the the domains section using data from WebPageTest [#1876](https://github.com/sitespeedio/sitespeed.io/pull/1876) and you will get annotations in Grafana [#1884](https://github.com/sitespeedio/sitespeed.io/pull/1884).

- PageXray is now a standalone plugin (before it was bundled with the coach). This makes it easier to use PageXray on HAR files from other tools (WebPageTest at the moment). [#1877](https://github.com/sitespeedio/sitespeed.io/pull/1877).

- PageXray is now xraying WebPageTest HAR files (if you run WebPageTest standalone). This will add the PageXray tab per URL/run + the toplist and the assets tab [#1880](https://github.com/sitespeedio/sitespeed.io/pull/1880).

- Upgraded the Docker base container to Ubuntu 17.10, NodeJS 8.9.4 and the WebPageReplay container with Firefox 58.

- Added filenames to the video when you combine two videos in combineVideos.sh

- New version of the Coach that now knows if you include Facebook in your page.

### Fixed

- Upgraded to Browsertime 2.1.4 with [new bug fixes](https://github.com/sitespeedio/browsertime/blob/main/CHANGELOG.md) and newer ChromeDriver.

- Fixed the start script so that you on Ubuntu can run WebPageReplay in the Docker container for your Android phone.

- Chrome user timings was empty in the HTML output from WebPageTest [#1879](https://github.com/sitespeedio/sitespeed.io/issues/1879).

## 6.2.3 2017-12-29

### Fixed

- Upgraded to PageXray 2.0.2 and Coach 1.1.2 that fixes [#1861](https://github.com/sitespeedio/sitespeed.io/issues/1861). Redirect chains that redirected back to the main page caused out of memory.

## 6.2.2 2017-12-22

### Fixed

- The Docker container was missing the node MAX_OLD_SPACE_SIZE switch (so you can increase memory for NodeJS) [#1861](https://github.com/sitespeedio/sitespeed.io/issues/1861).

## 6.2.1 2017-12-21

### Fixed

- Screenshot URLs in the HAR file was hardcoded to png, see [https://github.com/sitespeedio/compare/issues/11](https://github.com/sitespeedio/compare/issues/11). That made jpg image links broken in compare.sitespeed.io.

## 6.2.0 2017-12-20

### Added

- Use ChromeDriver 2.34
- Configure the page complete time when you use WebPageReplay. Add -e WAIT 5000 to wait 5000 ms.

### Fixed

- Upgraded to PageXray 2.0.1 that fixes the Chrome problem with URLs that includes a #.

## 6.1.3 2017-12-14

### Fixed

- Make it possible to stop runs from your command line in the new alpha WebPageReplay docker container

- Fixed bug with configuring pageCompleteCheck (and probably other problems too) in the Docker container [#1858](https://github.com/sitespeedio/sitespeed.io/issues/1858).

## 6.1.2 2017-12-12

### Fixed

- We finally fixed (we hope) the SigV4 problem on uploading to S3 see [#1689](https://github.com/sitespeedio/sitespeed.io/issues/1689)

## 6.1.1 2017-12-12

### Fixed

- Better check for when the page has finished loading when you run WebPageReplay (load event end + 2 s).

## 6.1.0 2017-12-12

### Added

- Let plugin register message types for budget [#1828](https://github.com/sitespeedio/sitespeed.io/pull/1828). With this you can add your plugin metrics to the budget.

- Let plugins run async JavaScript in Browsertime [#1841](https://github.com/sitespeedio/sitespeed.io/pull/1841).

- Use [sharp](http://sharp.dimens.io/) to change the size of the screenshot and choose between png/jpg [#1838](https://github.com/sitespeedio/sitespeed.io/pull/1838)

- Updated to Chrome 63 in the Docker container.

### Fixed

- Crawling now works with Basic Auth [#1845](https://github.com/sitespeedio/sitespeed.io/pull/1845) and [#1506](https://github.com/sitespeedio/sitespeed.io/issues/1506).
- Fix broken metrics list [#1850](https://github.com/sitespeedio/sitespeed.io/issues/1850). Thank you https://github.com/suratovvlad for reporting.

## 6.0.3 2017-11-29

### Fixed

- Remove the unused unminified CSS file from the result [#1835](https://github.com/sitespeedio/sitespeed.io/pull/1835)
- Updated to Browsertime 2.0.1 with [fixes for Android](https://github.com/sitespeedio/browsertime/blob/main/CHANGELOG.md#version-201-2017-11-28).

## 6.0.2 2017-11-28

### Fixed

- Yesterdays fix broke the functionality of adding/removing plugins with a comma-separated list [#1833](https://github.com/sitespeedio/sitespeed.io/pull/1833).

## 6.0.1 2017-11-27

### Fixed

- Fixed a bug adding/removing multiple plugins see [#1831](https://github.com/sitespeedio/sitespeed.io/issues/1831).

## 6.0.0 2017-11-24

Before you upgrade, please read our [upgrade guide](https://www.sitespeed.io/documentation/sitespeed.io/upgrade/).

### Added

- Use Chartist to display visual progress and size/requests to make it easier for users [#1659](https://github.com/sitespeedio/sitespeed.io/pull/1659).

- The HTML pages now works better on larger screens [#1740](https://github.com/sitespeedio/sitespeed.io/pull/1740).

- We upgraded to use the official Graphite Docker container and using Graphite 1.X as default [#1735](https://github.com/sitespeedio/sitespeed.io/pull/1735).

- Log the full URL to your result, makes it easy to map logs vs result [#1744](https://github.com/sitespeedio/sitespeed.io/issues/1744).

- Make it easier do build plugins: Expose messageMaker in the context to plugins (so plugins easily can send messages in the queue) [#1760](https://github.com/sitespeedio/sitespeed.io/pull/1760). Expose filterRegistry in
  the context so plugins can register which metrics should be picked up by Graphite/InfluxDb etc [#1761](https://github.com/sitespeedio/sitespeed.io/pull/1761). Move core functionality to core folder [#1762](https://github.com/sitespeedio/sitespeed.io/pull/1762).

- Running Docker adds `--video` and `--speedIndex` by default to make it easier for beginners.

- You can now create plugins that can generate HTML (per run or per page summary). [#1784](https://github.com/sitespeedio/sitespeed.io/pull/1784).

- You can now override/add CSS from your plugin by sending message of the type _html.css_ [#1787](https://github.com/sitespeedio/sitespeed.io/pull/1787)

- Major work on the documentation: [https://www.sitespeed.io/](https://www.sitespeed.io/)

- The Coach 1.0 with tweaked advice about Google Analytics and Google Tag Manager and more.

### Bug fixes

- We finally exit with 1 (error) if one of the URLs fails.[#1267](https://github.com/sitespeedio/sitespeed.io/issues/1267) and [#1779](https://github.com/sitespeedio/sitespeed.io/pull/1779).

### Deprecations

- The `--plugins.load` and `--plugins.disable` options are deprecated in favour of `--plugins.add` and `--plugins.remove`. The previous syntax was cumbersome to use since it allowed for multiple plugins to be separated by space. When using it before the url argument, e.g.

```sh
sitespeed.io -plugins.load foo http://sitespeed.io
```

the url would be treated as a plugin name, and the command would fail.

### Breaking changes

- Update to PageXray 1.0. For 99% of the users this will not change anything but if you where sending assets timings to Graphite/InfluxDB (as we told you not to do, these you now get blocked, dns, connect, send, wait and receive instead of just the total time [#1693](https://github.com/sitespeedio/sitespeed.io/pull/1693).

- We removed the generic [DataCollector](https://github.com/sitespeedio/sitespeed.io/blob/5.x/lib/plugins/datacollector/index.js) that collected data for each run and instead each plugin should collect the data
  it needs [#1731](https://github.com/sitespeedio/sitespeed.io/pull/1731). If you have written a plugin that collect it owns
  data you can just follow the old [DataCollector structure](https://github.com/sitespeedio/sitespeed.io/blob/5.x/lib/plugins/datacollector/index.js) and move the code you need to your plugin. Also [#1767](https://github.com/sitespeedio/sitespeed.io/pull/1767) is a follow up to remove DataCollector.

- We now default to Graphite 1.x so if you send annotations to Graphite < 1.0 you need to configure arrayTags to false `--graphite.arrayTags false`

- We now output only the version number (and not package and version number) on --version.

- As a first step to make it possible for plugins to generate HTML, we removed the hooks and instead only communicates with messages see: [#1732](https://github.com/sitespeedio/sitespeed.io/pull/1732) [#1758](https://github.com/sitespeedio/sitespeed.io/pull/1758). We now have three messages sent by the queue:
  _sitespeedio.setup_ - The first message on the queue. A plugin can pickup this message and communicate with other plugins (send pugs to the HTML plugin, send JavaScript to Browsertime etc). The next message is _sitespeedio.summarize_ (old summarize) that tells the plugins that all URLs are analysed and you can now summarise the metrics. The last message is _sitespeedio.render_ which tells the plugins to render content to disk. The HTML plugin pickup _sitespeedio.render_, render the HTML and then sends a _html.finished_ message, that then other plugins can pickup.

- We have moved the GPSI outside of sitespeed.io and you can find it [here](https://github.com/sitespeedio/plugin-gpsi). To run in along with sitespeed.io you just follow [the instructions how to add a plugin](https://www.sitespeed.io/documentation/sitespeed.io/plugins/#add-a-plugin). We moved it outside of sitespeed.io to make the code base cleaner and with the hope that we can find a maintainer who can give it more love.

- The [StorageManager](https://github.com/sitespeedio/sitespeed.io/blob/main/lib/core/resultsStorage/storageManager.js) API has been updated. The following changes may break code written using the 5.x API:

  - `createDataDir(directoryName)` is now `createDirectory(...directoryNames)` and takes any number of directory names (which will be joined together) as arguments.
  - `writeData(filename, data)` has reversed the order of its arguments. It is now `writeData(data, filename)`.
  - `writeHtml(filename, html)` has reversed the order of its arguments. It is now `writeHtml(html, filename)`.
  - `writeDataForUrl(data, filename, url, subDir)` no longer has a fifth argument indicating whether output should be gzipped.
  - `writeHtmlForUrl(html, filename, url)` no longer has a fourth argument indicating whether output should be gzipped.

  Note that all compression functionality has been removed. If you need compressed output, your plugin should handle gzipping itself. See the [`harstorer` plugin](https://github.com/sitespeedio/sitespeed.io/blob/56bfc48bac7ccfe1cfe35c829b4dd11987a375e4/lib/plugins/harstorer/index.js#L19-L28) for an example.

## 5.6.4 2017-10-11

### Fixed

- Upgraded to Browsertime 1.9.4 with latest ChromeDriver that fixes launching Chrome > 61
- Fixed custom metrics problem with WebPageTest [#1737](https://github.com/sitespeedio/sitespeed.io/issues/1737)

## 5.6.3 2017-10-03

### Fixed

- Fix issue where coach, pagexray and browsertime data on summary pages might contain just a subset of data for tests with urls from multiple domains.
- Avoid crash if Google PageSpeed Insights request fails (e.g. due to incorrect API key).
- When you run sitespeed.io using Docker we now always set no-sandbox to Chrome (so you don't need to do that yourself).
- Custom metrics in WebPageTest broke the HTML [#1722](https://github.com/sitespeedio/sitespeed.io/issues/1722)
- Skip storing faulty toplists on disk when using the analysisstorer plugin. The lists is generated from the raw data, so if you need them yourself as JSON, you can generate them [#1721](https://github.com/sitespeedio/sitespeed.io/pull/1721)
- Upgraded to latest shining [Browsertime](https://github.com/sitespeedio/browsertime/blob/main/CHANGELOG.md#version-193-2017-09-29)

## 5.6.2 2017-09-17

### Fixed

- Rollbacked to Chrome 60 to fix the flicker that happens on emulated mobile and makes lastVisualChange happens later than it should [#367](https://github.com/sitespeedio/browsertime/issues/367).
- Better logs when using WebPageTest.
- More finetuning in Browsertime (1.8.1) to pickup right last visual change on emulated mobile for Chrome.

## 5.6.1 2017-09-15

### Fixed

- Showing the timer as default in the video that was accidentally changed in latest release. Thanks https://github.com/kkopachev for reporting!

## 5.6.0 2017-09-13

### Added

- Use load time as of the default metrics for data storage when you use WebPageTest [#1704](https://github.com/sitespeedio/sitespeed.io/issues/1704)
- Upgraded Browsertime to 1.8.0 with [all these changes](https://github.com/sitespeedio/browsertime/blob/main/CHANGELOG.md#version-180-2017-09-13)

### Fixed

- You can now run WebPageTest without Browsertime [#1700](https://github.com/sitespeedio/sitespeed.io/issues/1700).
- Use SpeedIndex to decide if a WebPageTest run works instead of fullyLoaded [#1699](https://github.com/sitespeedio/sitespeed.io/pull/1699)

## 5.5.0 2017-08-21

### Fixed

- Show in the CLI that requestheaders, blocking domains and basic auth work in Firefox.
- Upgraded to Browsertime 1.6.1 with a newer version of VisualMetrics that hopefully fixes the sometimes 0 metrics for some sites. [#1961](https://github.com/sitespeedio/sitespeed.io/issues/1691)

### Added

- Include firstParty info in the HAR (more info about this soon).
- Also slack the screenshot of the run [#1658](https://github.com/sitespeedio/sitespeed.io/pull/1658).

## 5.4.5 2017-08-03

### Fixed

- Upgrading the Docker container to use Chrome stable 60 (instead of beta 60)
- Upgrading to Browsertime 1.6.0 that gives support for adding request headers, blocking domains and basic auth in Firefox.
- When one WebPageTest run failed, it could break collecting metrics, it seems to happen on sites with many requsts. We now catch the error. See [#1685](https://github.com/sitespeedio/sitespeed.io/issues/1685).
- Upgraded to Coach 0.36.0

## 5.4.4 2017-07-21

### Fixed

- Upgrading node-sass to work when installing on Windows 10 [#1671](https://github.com/sitespeedio/sitespeed.io/issues/1671)
- Upgrading to Browsertime 1.5.4 checkout [https://github.com/sitespeedio/browsertime/blob/main/CHANGELOG.md#version-154-2017-07-19](https://github.com/sitespeedio/browsertime/blob/main/CHANGELOG.md#version-154-2017-07-19)
- Always add the first asset to the size list [#1676](https://github.com/sitespeedio/sitespeed.io/issues/1676)

## 5.4.3 2017-07-14

### Fixed

- 5.4.2 failed with NodeJS 6.11.1 since our base Docker container didn't include npm. This is fixed now and we use 6.11.1.

## 5.4.2 2017-07-13

### Fixed

- Docker container uses NodeJS 6.11.1
- Latest Chrome beta 60.0.3112.66 in Docker
- Set 6.11.1 as minimum engine.

## 5.4.1 2017-06-30

### Fixed

- Updated the Docker container to contain fonts for Hindi, Thai, Japanese, Chinese and Korean.

- Updated to Browsertime 1.5.3 that includes a fix for faulty content types when getting the Chrome HAR file [#1654](https://github.com/sitespeedio/sitespeed.io/issues/1654)

## 5.4.0 2017-06-24

### Added

- Upgraded to PerfCascade 2.0.2
- You can now choose max number of items in the toplists. Do it with --html.topListSize. [#1639](https://github.com/sitespeedio/sitespeed.io/pull/1643).
- You can now get a list of largest and slowest third party assets [#1613](https://github.com/sitespeedio/sitespeed.io/issues/1613).
- Upgraded to latest Browsertime:
  - Upgraded to Geckodriver 0.17.0 seems to fix [#321](https://github.com/sitespeedio/browsertime/issues/321).
  - Upgraded ChromeDriver 2.30 with a very special hack to fix [#347](https://github.com/sitespeedio/browsertime/pull/347).
  - Pickup metrics from the Paint Timing API [#344](https://github.com/sitespeedio/browsertime/pull/344), will work in Chrome 60.
  - Updated the Docker container to Firefox 54 and Chrome 60 (beta) to fix the background color problem. [Chrome bug 727046](https://bugs.chromium.org/p/chromium/issues/detail?id=727046).
- If you run Chrome 60+ you will now see the metrics from the Paint Timing API in the Browsertime tab.

### Fixed

- Fixes for custom filters for PageXray [#1647](https://github.com/sitespeedio/sitespeed.io/issues/1647)
- Fixed bug when calculating timing for an assets included both SSL and Connect time, that is wrong since connect time includes SSL time. This only affected the time showed in slowest assets toplist.
- Collect assets that have 2XX status code instead of just strict 200. Thanks [@vio](https://github.com/vio) for the [PR](https://github.com/sitespeedio/pagexray/pull/29).

## 5.3.0 2017-06-03

### Added

- Added domInteractive and domContentLoaded to the waterfall graph [#1632](https://github.com/sitespeedio/sitespeed.io/issues/1632).
- Show GPSI score on summary, detailed summary and pages columns [#1631](https://github.com/sitespeedio/sitespeed.io/issues/1631).
- Upgraded to Browsertime 1.4.0:
  - --browertime.preURLDelay (in ms) so you can choose how long time you want to wait until you hit the main URL after the pre URL.
  - Fixed setting proxy using --proxy.http and --proxy.https [#338](https://github.com/sitespeedio/browsertime/issues/338)
  - Updated to chrome-har 0.2.1 that: add "serverIPAddress" field to entries, set bodySize for requests correctly, set bodySize and compression for responses correctly, and add \_transferSize field for responses, just like Chrome does.

## 5.2.1 2017-05-26

### Fixed

- The link in the HTML to the Chrome trace log is not working.
- Upgraded to Browsertime 1.2.7 that downgrades ChromeDriver to 2.28 to make collecting trace logs work again.

## 5.2.0 2017-05-24

### Fixed

- Upgraded to Grafana 4.3.1 in the Docker compose file.
- Too many runs broke the HTML [#1621](https://github.com/sitespeedio/sitespeed.io/issues/1621).
- When you used --summary and --summaryDetail it broke the run (thanks [gamerlv](https://github.com/gamerlv) for reporting) [#1622](https://github.com/sitespeedio/sitespeed.io/issues/1622).

### Added

- Added support for --s3.storageClass option (thanks [shakey2k2](https://github.com/shakey2k2)) [#1623](https://github.com/sitespeedio/sitespeed.io/pull/1623).
- Show browser version on HTML run pages (finally!).

## 5.1.1 2017-05-23

### Fixed

- Upgraded to WebPageTest API 0.3.5, VideoJS 6.1, PUG 2.0.0-rc1 and PerfCascade 2.0.1.
- Upgraded to Browsertime 1.2.6 with a fix so that setting Firefox Preferences works as expected.

## 5.1.0 2017-05-14

### Fixed

- Verify that you add the host when you want to send metrics to Graphite [#1587](https://github.com/sitespeedio/sitespeed.io/issues/1587)
- Fix navigation making anchors miss target [#1609](https://github.com/sitespeedio/sitespeed.io/pull/1609). Thanks [Radu Micu](https://github.com/radum) for the PR!

### Added

- Added a new script /tools/combineVideos.sh to combine two videos into one.
- Include the browser name in the file name when you download a file [#1594](https://github.com/sitespeedio/sitespeed.io/issues/1594)
- Show backEndTime in Summary Timings (to make it easy to find runs with same backEndTime) [#1595](https://github.com/sitespeedio/sitespeed.io/issues/1595).
- Always log the WebPageTest id in the error logs if WebPageTest fails.
- Upgraded to [PerfCascade 2.0.0](https://github.com/micmro/PerfCascade/releases/tag/v2.0.0) with performance improvements and keyboard accessibility.
- New Browsertime 1.2.5 with fine tuned video for Firefox, Basic Auth support in Chrome, fix for URLs containing commas and new version of VisualMetrics (thanks Pat) that can sort out the problem that started to happen with Chrome 58 running in emulated mode (or at least most of the times).

## 5.0.0 2017-04-24

### Added

- Rework of the WebPageTest result tab: More metrics, requests per content type, requests per domain and screenshot.
- Rework of PageXray result tab: requests per content type, requests per domain, cookies stats
- Rework of Browsertime result tab: easier to find the most important metrics
- More info from GPSI on the result tab.
- Always download screenshots, waterfall graphs, and Chrome traceLog and store it local from WebPageTest.
- Better HTML page titles, showing what's tested and when, that makes it easier when you share URLs.
- HTML tuning for smaller devices.
- Added proxy parameters in the CLI from Browsertime.
- Updated to [PerfCascade 1.4.0](https://github.com/micmro/PerfCascade/releases) (from 1.0.0)
- Add new s3.path option, to override the default storage path in the S3 bucket.
- Pickup timestamp from each run and display on each run page
- Added possibility to set the graphite web host (--graphite.webHost)
- Set Graphite tags as arrays (--graphite.arrayTags) needed for Graphite 1.0
- Add request headers with -r name:value (Chrome only in this release)
- Block domains with --block my.domain.com (Chrome only in this release)

### Changed

- The default upload path in S3 buckets no longer includes the prefix 'sitespeed-result'

### Fixed

- Waterfall graphs loaded in Safari iOS didn't work.
- Allow S3 upload even when using custom outputFolder.

### Not backward compatible changes in 5.0

There's one change in 5.0 that changes the default behavior: TSProxy isn't default for connectivity since it doesn't work as we want together with Selenium. We also removed tc as default running Docker. When you change connectivity you should use our [Docker network setup](https://www.sitespeed.io/documentation/sitespeed.io/browsers/#change-connectivity)! If you used to use TSProxy or tc, please switch to Docker networks for now.

## 4.7.0 2017-03-15

### Fixed

- Link User Timings in Page Summary (so you easy can find min/median/max of your User Timings).
- Slack missed URL specific information introduced in the 4.6.1 release. Now you get info per URL again.
- Default values for warning and error in Slack was wrong. Before warning was 80 and error 90, now warning is 90 and error 80.
- Setting a speedIndex/firstVisualChange as a warning/error value for Slack didn't work.

### Added

- Design: Make it easy to see which run you are looking at on by highlighting that run on the run list. Unified metrics naming.
- Made it possible to gzip the HAR files.
- Made it easy to download WebPageTest HAR files.
- A loader indicating that we are waiting in the HAR when it is fetched.

## 4.6.1 2017-03-11

### Fixed

- New ChromeDriver 2.28.0 that fixes "Cannot get automation extension from unknown error: page could not be found ..."
- The help for budget had wrong example parameter. Use --budget.configPath for path to the config.

## 4.6.0 2017-03-10

### Added

- You can now choose to load the HAR file using the fetch API instead of inlining it in the HTML file. Use --html.fetchHARFiles [#1484](https://github.com/sitespeedio/sitespeed.io/pull/1484)
- New version of Browsertime that has a new metric VisualComplete 85% (or more), thank you [@jeroenvdb](https://github.com/JeroenVdb)! You can see the metric in the Waterfall graph and it will automatically be sent to Graphite.
- Browsertime is now using https://github.com/sitespeedio/chrome-har to generate the HAR.
- Pickup the number of script tags on the page (from the Coach) and display it in the Coach section and send by default to Graphite.
- Show SpeedIndex, FirstVisualChange and LastVisualChange in colums for pages (so you can sort them).
- Send number of script tags, local storage size and number of cookies by default to Graphite.
- Link VisualMetrics from the page summary selection so you easily can go from Grafana to a specific run [#1457](https://github.com/sitespeedio/sitespeed.io/issues/1457)
- Updated to Firefox 52.0 and stable Chrome 57 in the Docker container.
- Upgraded Grafana dashboards to use the latest metrics.

### Fixed

- Upgraded to PerfCascade 0.9.0 that is smarter when drawing time lines see [PerfCascade #160](https://github.com/micmro/PerfCascade/issues/160)
- Make sure we show preURL and connectivity type for all result pages [#1493](https://github.com/sitespeedio/sitespeed.io/issues/1494)
- Making regions for S3 work [#1486](https://github.com/sitespeedio/sitespeed.io/issues/1486)
- Annotation timestamp and metrics timestamps are now in sync [#1497](https://github.com/sitespeedio/sitespeed.io/issues/1497)

## 4.5.1 2017-03-01

### Fixed

- Rolling forward to Chrome 57 beta since 56 isn't working correct with our video, see [#284](https://github.com/sitespeedio/browsertime/issues/284)

## 4.5.0 2017-03-01

### Added

- Upgraded to PerfCascade 0.6.1 from 0.4.0 with UX fixes see [https://github.com/micmro/PerfCascade/releases/](https://github.com/micmro/PerfCascade/releases/).
- Added CLI options for setting Firefox preferences (--browsertime.firefox.preference), collect the response body in Firefox HAR (--browsertime.firefox.includeResponseBodies) and Chrome browser CLI args (--browsertime.chrome.args).
- You can now collect the timeline log from Chrome (--browsertime.chrome.dumpTraceCategoriesLog) and set which traceCategories Chrome should collect.
- If you collect the timeline from WebPageTest (--webpagetest.timeline) it will automatically be stored in your data folder and linked from that runs HTML page.
- New Browsertime release where you can set the connectivity type to external, that makes it possible to use Docker network bridges for setting up connectivity, more about that soon in the blog post. Thank you [@worenga](https://github.com/worenga) for higlighting the problem!

### Fixed

- Set region for your S3 bucket, thanks [@jjethwa](https://github.com/jjethwa) for the [PR](https://github.com/sitespeedio/sitespeed.io/pull/1469)!

## 4.4.2 2017-02-15

### Fixed

- New Browsertime that fixes a potential problem when generating the HAR for Chrome see [BT #272](https://github.com/sitespeedio/browsertime/issues/272)
- Show graphite.auth and graphite.httpPort in the CLI to make it easier

## 4.4.1 2017-02-15

### Fixed

- Make it possible to configure S3 uploads with: s3.maxAsyncS3, s3.s3RetryCount , s3.s3RetryDelay , s3.multipartUploadThreshold, s3.multipartUploadSize see https://www.npmjs.com/package/s3#create-a-client [#1456](https://github.com/sitespeedio/sitespeed.io/issues/1456)

## 4.4.0 2017-02-13

### Added

- Updated Docker container to use Chrome 56 and FF 51, but also added no-sandbox as default to make it work on Docker on OS X (new 56 thing).
- Updated to PerfCascade 0.3.7 where you open/close the extra request info by clicking on the bar.
- Use --webpagetest.script to supply your script as a string and --webpagetest.file as a file. But don't worry, it will work the same as before. Thank you Jeroen for the PR. See [#1445](https://github.com/sitespeedio/sitespeed.io/pull/1445)
- Send the result HTML to S3 [#1349](https://github.com/sitespeedio/sitespeed.io/issues/1349)
- Send annotations to Graphite with a link back to the HTML result [#1434](https://github.com/sitespeedio/sitespeed.io/pull/1434)
- Surfacing user defined whitelist from browsertime for user timings filtering [#1426](https://github.com/sitespeedio/sitespeed.io/issues/1426)

### Fixed

- Use connectivity native as default if no one is set in WebPageTest [#1447](https://github.com/sitespeedio/sitespeed.io/issues/1447)
- Made it possible to set WebPageTest runs as non private [#1448](https://github.com/sitespeedio/sitespeed.io/issues/1448)
- Fix for Template error with meta data aliases when not using the CLI [#1444](https://github.com/sitespeedio/sitespeed.io/issues/1444)

## 4.3.9 2017-01-26

### Fixed

- Worst case scenario if Browsertime missing a HAR file, the HTML summary rendering failed [#1424](https://github.com/sitespeedio/sitespeed.io/issues/1424)
- If we have a site that is missing expire headers, the HTML generation failed [1430](https://github.com/sitespeedio/sitespeed.io/issues/1430)

## 4.3.8 2017-01-19

### Fixed

- Updated to latest PerfCascade that will pickup changed resource prio in Chrome and some bug fixes.
- Google is still overloading User Timing marks see [#257](https://github.com/sitespeedio/browsertime/issues/257). This fix mute the marks from WebPageTest so they aren't sent to Graphite.

## 4.3.7 2017-01-13

### Fixed

- Google is overloading User Timing marks see [#257](https://github.com/sitespeedio/browsertime/issues/257). This is quick fix, lets make a better fix in the future.

## 4.3.6 2017-01-10

### Fixed

- New Browsertime that fixes the too early firstVisualRender in Firefox introduced in 4.3.5.

## 4.3.5 2017-01-10

### Fixed

- Running only WebPageTest generated errors in the HTML plugin #1398, fixed in #1413
- New Browsertime (beta 22) with changed configuration for Chrome to detect orange frames
- New Coach and Browsertime that is cleaned up to make our Docker containers smaller again 726 -> 547 mb

## 4.3.4 2017-01-09

### Fixed (hopefully)

- Upgraded to [Browsertime beta 21](https://github.com/sitespeedio/browsertime/blob/main/CHANGELOG.md#version-100-beta21-2017-01-09) to finally once and for all fix the problem with the too early firstVisualChange that sometimes happend in Chrome:
  - We removed the center cropping of images when visual metrics checks if an image is orange/white. The cropping made us miss the small orange lines that sometimes appear only in Chrome.
  - We also fine tuned (and made configurable) the number when the diff of two images (orange and white) is ... orange.
  - We re-arranged how we record the screen to record as little extra video as possible

## 4.3.3 2017-01-05

### Fixed

- Upgraded browsertime with changed FFMPeg config to hopefully fix the too early firstVisualChange that sometimes happens for Chrome, updated Geckodriver (0.12.0), changed Firefox default settings to follow the Mozilla teams default ones when they do test automation,
  pickup changed request prio in Chrome (before only initial prio was used) and adding new connectivity profile 3gem for Emerging markets to keep in sync with WebPageTest.

## 4.3.2 2017-01-04

### Fixed

- Updated the Docker container to use ImageMagick 6.9.7-2 to fix firstVisualChange that sometimes was picked up to early https://github.com/sitespeedio/browsertime/issues/247

## 4.3.1 2016-12-28

### Fixed

- TAP and JUnit XML stopped working when changing to yargs 6.x (coerce has breaking changes). Rollback to yargs 5.0 and make a better fix after the holidays.

## 4.3.0 2016-12-22

### Fixed

- Upgraded to Browsertime beta-19 that fixes firstVisualChange happen to early when testing as mobile

### Added

- New version of PerfCascade with icons for content types, making it much easier to understand the waterfall graph.

## 4.2.1 2016-12-20

### Fixed

- Custom metrics in from WebPageTest introduced a error running WebPageTest without custom metrics. #1389

## 4.2.0 2016-12-14

### Added

- Updated to browsertime beta18 with fix for to early firstVisualChange with preURL and display lastVisualChange in the video. And fixed the extra 5s added to base request using Firefox in Docker. And makes the order for assets more correct in Chrome for sites using HTTP/2
- Upgraded the Docker container to use Chrome 55.0
- The metric lines (firstVisualChange etc) is now stronger and easier to spot
- Slack: firstVisualChange, lastVisualChange and fullyLoaded metrics will be sent by default and you can now configure what metric you wanna use to decide if it is a warning/error message #1366
- Use video.js as video player #1372
- Collect custom metrics in WebPageTest (and send them to Graphite when configured). Thank you https://github.com/jpvincent for the initial PR! #1377
- Added ability to set a custom alias for URLs via the text file for shortening long page URLs. #1326
- Trap to catch when you wanna exit a Docker run. Now you can just exit.
- Add support for pushing metrics to InfluxDB.
- Latest coach (0.30.0).

### Fixed

- Running multiple URLs in WebPageTest failed because of a "feature" in the WebPageTest NodeJS API where options in s are change to ms. #1367
- The keys for assets in PageXray was broken when we sent them to Graphite, because we couldn't identify which asset we sent, instead of the URL we used the position in the array. We fixed that now, BUT: Please don't send all the assets to Graphite, it will fill your disk! #1341
- The key summary structure for metrics for WebPageTest just worked because of luck. It is now divided in pageSummary and summary making it easier to configure and understand. #1377
- Fixed encoding problems when storing to disk #1346

## 4.1.3 2016-12-05

### Fixed

- If you tested multiple runs, the video was overrun by the last URL, see https://github.com/sitespeedio/browsertime/issues/237

### Added

- SpeedIndex, First/Last Visual change is now in the help section
- Show SpeedIndex, First/Last Visual change on the detailed summary page
- Show last visual change in the summary box
- Color the first/last change line in the waterfall graph
- Show legend for the waterfall graph
- Added breakdown of 1st vs 3rd party content types

## 4.1.2 2016-12-04

### Fixed

- Color of tabs in waterfall graph is now white and readable. The URL in the tabs has the right letter spacing.
- Crash when all assets matched the specified first party regex. #1358

### Added

- Additional checks to avoid generating invalid paths in Graphite.
- New version of PerfCascade that gives us numbers on requests, image tab last and horizontel lines in subseconds.

## 4.1.1 2016-12-02

### Added

- Output preURL info on the runInfo box on each HTML page.
- If we have first and last visual change add it to the HAR file so we can see it in the waterfall graph.

### Fixed

- Output Speed Index and First Visual Change in page summary box (the logic was there for SpeedIndex before but failed).
- Added missing shorthand --preURL to the CLI options.

## 4.1.0 2016-12-01

### Fixed

- Cli help options for Browsertime was very unclear and unspecific.
- TSProxy is somehow broken together with Selenium. TC is now default connectivity engine when running in Docker.
- Finally fixed the problem with Chrome that it sometimes didn't start in Docker: https://github.com/SeleniumHQ/docker-selenium/issues/87#issuecomment-250475864

### Added

- Made the size table sortable for PageXray metrics
- Upgraded the Docker container to use FF 50
- Upgraded to latest Browsertime beta 13 with official video support
- Option to set your custom alias for connectivity thank you @jpvincent for the idea #1329
- GPSI now uses mobile configuration so if you pass --mobile, it will use the mobile rules. #1342
- Always send PerceptualSpeedIndex to Graphite as picked up by Browsertime/VisualMetrics
- Added --video and --speedIndex to record a video and get SpeedIndex and related metrics using VisualMetrics. Use it in our Docker container.
- If you configured to run a video you can see the video in the Browsertime tab.

## 4.0.7 2016-11-13

### Fixed

- Upgraded to Browsertime 1.0.0-beta.11
  - Fixed issue with incorrect values for speedindex and start render due to a small info bubble of text appearing in the video frames.

## 4.0.6 2016-11-13

### Added

- Additional information added in the documentation around using connectivity engine `tc` for network throttling.
- Additional information added in the FAQ section of the documentation mentioning Digital Ocean issue with pre-baked docker(1.12.3) instances and Firefox.

## 4.0.5 2016-11-11

### Fixed

- Running budget with one rule for one URL failed the JUnit output, thanks @krukru for the report #1317

### Added

- Pick up environment variables in the CLI. The namespace is SITESPEED_IO. This is useful for setting up default values in Docker. Say you want to set an environment variable for --browsertime.iterations 1 then use SITESPEED_IO_BROWSERTIME\_\_ITERATIONS=1. Checkout https://www.npmjs.com/package/yargs#envprefix for full docs.

- Upgraded to Browsertime 1.0.0-beta.10:
  - Added initiator of each request entry to chrome HAR
  - Output SpeedIndex & firstVisualChange in the logs if you use VisualMetrics
  - Generating HAR files from Chrome caused a crash in some cases.
  - Entry timings in HAR files from Chrome were strings instead of numbers.
  - One extra fix for outputing timing metrics in the console: If timing metrics is < 1000 ms don't convert to seconds and let always have fixed\
    size for mdev fixing many numbers for SpeedIndex.
  - Configure proxies with --proxy.http and --proxy.https
  - New TSProxy that is less complex
  - Upgraded Selenium to 3.0.1 (no beta!)
  - Upgraded Geckodriver to 0.11.1
  - Updated minimum NodeJS to 6.9.0 (same as Selenium). IMPORTANT: Selenium 3.0.0 will not work on NodeJS 4.x so you need to update.
  - Export chrome perflog dumps as json in extraJson property of the result, instead of a string in the extras property. Only relevant to api users.
  - Upgraded sltc so we use 0.6.0 with simplified tc that actually works
  - We now run xvfb from inside NodeJS so we can set the screen size, making it easy to record the correct size for VisualMetrics. We also use environment variables that starts with BROWSERTIME so we can turn on xvfb easily on Docker.
    https://github.com/sitespeedio/browsertime/blob/main/CHANGELOG.md

## 4.0.4 2016-11-04

### Fixed

- If you where using graphite.includeQueryParams when you where sending keys to graphite, URLs containing ? and & failed. Those characters are now replaced.
- We rollbacked sending the URL in Graphite keys for toplists, it's opened the possibility to generate too much data in Graphite.
- FYI: Soon we will update to the final 3.0.0 of Selenium and we then need to drop support for NodeJS 4.x.

## 4.0.3 2016-11-01

### Fixed

- Setting --mobile didn't change viewport/useragent. Thank you @zhangzhaoaaa for reporting #1298

- Asset toplist data (slowest/largest assets) couldn't be sent to Graphite. It's now restructured with new naming and you can also get the URL for slowest
  assets toplist in Graphite. Documentation coming up the coming days. #1294

## 4.0.2 2016-10-31

### Fixed

- Domains metrics wasn't grouped per domain, making metrics sent to Graphite fail if you configure them to send all. See #1290 and #1289.

## 4.0.1 2016-10-30

### Fixed

- If you configured cli params for Chrome, the check for Android configuration broke the run.
- The CLI output was wrong when setting up a custom profile. You should use --connectivity custom

## 4.0.0 2016-10-27

Version 4.0 is a ground up rewrite for Node.js 6.9.1 and newer. It builds on all our experience since shipping 3.0 in December 2014, the first version to use Node.js.

- We support HTTP/2! In 3.X we used PhantomJS and a modified version of YSlow to analyse best practice rules. We also had BrowserMobProxy in front of our browsers that made it impossible to collect metrics using H2. We now use the coach and Firefox/Chrome without a proxy. That makes it easier for us to adapt to browser changes and changes in best practices.

- We got the feature that people asked about the most: Measure a page as a logged in user. Use --browsertime.preScript to run a selenium task to before the page is analysed. Documentation is coming soon.

- New HAR files rock! In the old version we use BrowserMobProxy as a proxy in front of the browser to collect the HAR. In the new version we collect the HAR directly from the browser. For Firefox we use the HAR export trigger and in Chrome we generates it from the performance log.

- Stability: We have a new completely rewritten version of Browsertime that makes it easier for us to catch errors from the browser, drivers and environment problems.

- Speed: Yep we dropped Java (it was needed for BrowserMobProxy) and most things are happening in parallel with the new version.

- Don't overload Graphite: One thing that was annoying with 3.x was that it by default sent a massive amount of metrics to Graphite. That's cool in a way but it was too much. We now send curated metrics by default and you can choose to send more.

- You can collect metrics from Chrome on an Android phone. In the current version you need to have it connected using USB to the server running sitespeed.io, lets see how we can make it better in the future.

- Using our Docker container you will get support getting SpeedIndex and startRender using VisualMetrics. This is highly experimental at this stage.

And many many more changed. Read about the release https://www.sitespeed.io/sitespeed.io-4.0-is-released

## Unreleased beta

## Fixed

- Call summary Site summary in the slack plugin to make it easier to understand.
- Run as root inside the Docker container, it makes things easier.

## 4.0.0-beta.6 2016-10-26

### Added

- You can now configure so sitespeed.io only slacks on error #1260
- Do not run as root inside the Docker container #1259
- Budget HTML page and log the budget info. #1264

### Changed

- New browsertime beta-9 and latest Coach
- Sending all data to Slack changed property name from both to all: --slack.type all and default is now all (instead of summary).

## Fixed

- Don't set viewport when running on Android.
- Screenshots for Firefox works again #1256
- Cli for setting budget junit output is junit NOT junitxml
- Slack specific URL errors, so if something fails we know about it #1261

## 4.0.0-beta.5 2016-10-17

### Added

- Send summary and individual URL metrics to Slack. #1228
- Simple first step for performance budget #1227
- Download the HAR files to your local #1174
- Moved site to docs folder within the project #1240

### Changed

- The data structure (internally) for toplists is changed so they can be sent to Graphite and used in a budget. Messages for largest assets was renamed from assets.aggregateSizePerContentType to assets.largest. Also send the largest individual size of an image to Graphite by default.
- Plugin analysisStorer is now called analysisstorer and messageLogger is now messagelogger and live within their own plugin folder, following the pattern of all other plugins.
- Default cli options now lives in each plugins.
- No default channel for Slack, use the one setup in the hook instead.
- Run sitespeed.io without the cli.

### Fixed

- A little better error handling when loading a plugin fails.
- LastModified in the PageXray section was wrongly outside the table
- Layout for resource hints

## 4.0.0-beta.4 2016-09-29

---

### Fixed

- Pug templates never was a cache hit, so generating the HTML took a lot of extra memory #1218 #1219 thank @moos for the PR #1220
- Fix crash for pages that didn't set the last-modified http header #1221
- WebPageTest data rendering was broken since 4.0.0-beta.1.

### Added

- You can now output a summary for a run in the CLI. Thanks @moos for the PR.

## 4.0.0-beta.3 2016-09-26

---

### Fixed

- The output directory structure was broken in beta.2, please update to beta.3.

## 4.0.0-beta.2 2016-09-23

---

### Fixed

- If the HAR export plugin fails in Firefox, don't break the run, use the data we have and try to make the most if it. #1190
- Make it possible to link to specific tabs on page/run pages #1087 Thank you @moos for the fix!
- Passing --outputFolder now works correctly. #1209
- Upgraded to latest Browsertime to make Firefox 49 to work again.

### Added

- Send content size & request per content type by default to Graphite for WebPageTest pageSummary #1194
- You can now set --max-old-space-size when running the Docker container, use -e MAX_OLD_SPACE_SIZE=4096 (or what max size you want) #1185
- The old hotlist is rebranded to toplist. You can now see the largest responses by content type and the slowest responses #1183

### Changed

- Send content size & request per content type grouped by breakdown to Graphite for WebPageTest summary #1194
- Get plugin by relative or absolute path (perfect for Docker). If you wanna use a npm installed module use $(npm get prefix)/foo

## 4.0.0-beta.1 2016-09-02

---

### Fixed

- The CSS size advice on summary page used the wrong metrics to check the color, meaning 0 bytes made it red :/
- Shorten long URLs displayed on HTML Asset report #977
- Empty size fixes for tablet view of HTML report
- Title/description for each page says something about the page + we don't want robots to index the result pages
- Fixed long URLs that broke page design #1020 #1049
- Right CLI parameter name for setting the Selenium URL (if you use a standalone server)
- Made it easier to understand how to configure location and connectivity for WebPageTest.
- Fixed breaking GPSI when summary was missing from the rule. #1110
- Updated browsertime, so when you are running pre/post script, you can get hold of the selenium-webdriver from the context (a lot of people have had problem with it). Checkout https://github.com/sitespeedio/browsertime/blob/main/test/prepostscripts/preLoginExample.js for an example.
- Finally Firefox works again, you can use Firefox 48 since we now use Geckodriver.
- New version of TSProxy that fixes the redirect problems for HTTP -> HTTPS https://github.com/sitespeedio/browsertime/issues/175
- New PerfCascade that takes care of responses that misses a content type #1030
- Always include the PerfCascade script (the path was wrong sometimes before) #1030
- Include PageXray metrics in the summary #1162

### Added

- Updated to latest Browsertime, now supporting different connectivity profiles using tsproxy or tc. #895
- Disable default plugins (disable HTML, screenshot etc). Looking forward to add plugins #1015
- Configure the pageCompleteCheck using CLI.
- Moved metrics to different tabs on the page result page.
- Set the number of runs for WebPageTest using a specific cli parameter #1101
- Run custom script and URL/script for WebPageTest #1101
- Run custom script. Use --browsertime.script myScript.js to add your script. You can run multiple script by passing the parameter multiple times. The metrics will automatically turn up on the summary page, detailed page, the summary page of the page and the run page. They will also be sent to Graphite. #1063
- Add your own plugin (examples coming soon) #891
- Removed analysisStorer as default plugin (do not store all json metrics by default). If you want to use it, enable it with --plugins.load analysisStorer
- Always show the waterfall if you run one run.
- You can configure which metrics to send to Graphite #943
- Send domain, expireStats and lastModifiedStats to Graphite for a group summary and totalDomains for page summary.
- Send documentHeight, domElements, domDepth.avg, domDepth.max and iframes per default for each page summary (missed those, these are handy!).

### Changed

- All URLs is now belonging to a group. The group right now is the domain of the URL. When summaries are sent to Graphite, each summary belong to a group. Meaning summary metrics will always correspond to the group (not as before the filename if you get the URLs from a file). #1145
- New default namespace for Graphite metrics: sitespeed_io.default to be more flexible for the dashboards we will supply
- Removed p10 and p99 as default to Graphite (and all calculations). We make it configurable in the future from the cli (it's prepared already).

## 4.0.0-alpha5 - 2016-06-30

---

### Fixed

- It looks like url is field that can't be used in pug, so we where missing the URL on each individual page. Renamed and fixed.

### Added

- Added the detailed summary page that we learned to love.
- Small summary on each summary page to display the run information.
- More summary boxes on the summary page.
- Updated Browsertime to new release including latest Selenium to make Firefox 47.0.1 work.
- Added definition and help for the metrics in the summary boxes.

## 4.0.0-alpha4 - 2016-06-20

---

### Added

- Use PerfCascade to show waterfall on page summary and individual runs from collected HAR (#997)
- Show simple Google Page Speed Insights metrics in HTML and send the score to Graphite (#948)

### Changed

- Lets use Chrome as default browser since Firefox 47/Selenium/Gecko/Marionette is broken https://github.com/sitespeedio/sitespeed.io/issues/993

- Only add browser/connectivity in Graphite keys in metrics collected by Browsertime (#1009).

- Add location/connectivity to Graphite keys for WebPageTest (#1008).

- Internal: We changed from Jade to Pug (latest) and moved to Sass for the CSS (thanks @matthojo)

## 4.0.0-alpha3 - 2016-06-09

---

### Fixed

- Enable the coach by default.
- Fixed broken default plugin loading.

## 4.0.0-alpha2 - 2016-06-07

---

### Fixed

- Show results from other plugins even if one plugin has an error (e.g. WebPageTest fails but Browsertime succeeds).
- Fixed preTask and postTaks, now named preScript/postScript, try iy out to login the user.

### Changed

- Added browser and connectivity to Graphite keys, all keys now hold browser and connectivity.

### Added

- Hey we now log the the log file in the result dir.

## version 4.0.0-alpha1 - 2016-05-22

### Changed

- Everything! Rewrite from scratch in progress. This is an alpha release, try it test it but do not upgrade in production yet (https://github.com/sitespeedio/sitespeed.io/issues/945).

- We support HTTP/2! In 3.X we used PhantomJS and a modified version of YSlow to analyse best practice rules. We also had BrowserMobProxy in front of our browsers that made it impossible to collect metrics using H2. We now use [the coach](https://github.com/sitespeedio/coach) and Firefox/Chrome without a proxy. That makes it easier for us to adapt to browser changes and changes in best practices.

- We now support the feature that people asked about the most: Measure a page as a logged in user. Use --browsertime.preTask to run a selenium task to before the page is analysed. Documentation is coming soon.

- New HAR files rock! In the old version we use BrowserMobProxy as a proxy in front of the browser to collect the HAR. In the new version we collect the HAR directly from the browser. For Firefox we use the [HAR export trigger](https://github.com/firebug/har-export-trigger) and in Chrome we generates it from the performance log.

- Stability: We have a new completely rewritten version of [Browsertime](https://github.com/tobli/browsertime) that makes it easier for us to catch errors from the browser, drivers and environment problems.

- Speed: Yep we dropped Java (it was needed for BrowserMobProxy) and most things are happening in parallel with the new version.

- Don't overload Graphite: One thing that was annoying with 3.x was that it by default sent a massive amount of metrics to Graphite. That's cool in a way but it was too much. We now send curated metrics by default and you can choose to send more.

- You can collect metrics from Chrome on an Android phone. In the current version you need to have it connected using USB to the server running sitespeed.io, lets see how we can make it better in the future.

- Using our Docker container you will get support getting SpeedIndex and startRender using [VisualMetrics](https://github.com/WPO-Foundation/visualmetrics). This is highly experimental at this stage.

## version 3.11.5 - 2016-01-30

### Fixed

- Dependency problem for PhantomJS 2.1. We hope it works now :)

## version 3.11.4 - 2016-01-30

### Fixed

- Typos #804 Thanks @beenanner

- Making slimerjs more indepenedent from phantomjs #806 thanks @keithamus

### Changed

- Upgraded default PhantomJS to 2.1. We will remove PhantomJS 2.0 from Docker containers.

## version 3.11.3 - 2016-01-13

### Fixed

- Fixes bug for collecting summary metrics for WPT, introduced in 3.11.2

## version 3.11.2 - 2016-01-13

### Fixed

- Browser name in WebPageTest can have spaces and that wasn't handled so when the metrics is sent to Graphite, it fails. #798

### Changed

- Bumped 3rd party dependencies: winston, request, phantomjs, moment, fs-extra, browsertime, cross-spawn-async, async

## version 3.11.1 - 2015-10-27

### Fixed

- Upgraded Browsertime to new version to work with Node 4

## version 3.11.0 - 2015-10-14

### Fixed

- Report the sitespeed version as full integeres to Graphite. Meaning 3.10.0 will be 3100.

### Added

- Normalize file names, use \_ as separator in the domain name instead of dots #742

## version 3.10.0 - 2015-09-26

### Fixed

- Do not report skipped rules as failed on the Budget page. thanks @jzoldak #753
- Grunt-sitespeedio fails the build no matter if GPSI score matches the budget thanks @laer #746
- Fixed the ability to supress domain data beeing sent to Graphite. Using --graphiteData you now need to explicit use domains if you want to send the data (if you don't use all). That data shouldn't always be sent as it was before. (thanks @xo4n for pointing that out) #755

### Added

- Add ability to budget on a per rule basis, thanks @jzoldak #751
- Add waitScript logic to screenshots thanks agaib @jzoldak #737

## version 3.9.1 - 2015-09-14

### Fixed

- Sorting by url for pages/assets on result pages now works as expected. #743
- Be able to disable the proxy when running BrowserTime #735

## version 3.9.0 - 2015-08-22

### Fixed

- All args to the headless script should be passed in the right order #727 thanks @jzoldak for the PR
- If a site uses SPDY, the sizes in the HAR from WebPageTest is set to 0, don't use it to populate the sizes #699

### Added

- Create same Graphite namespace structure for the domain url as for per-page metrics #728 thanks @JeroenVdb for the PR. Use the flag --graphiteUseNewDomainKeyStructure to turn on the new standard (will become default in 4.0).
- You can choose to have query parameters in the Graphite key for the URL, thanks @jeremy-green for the PR #719. To use query parameters in the keys, add --graphiteUseQueryParameters to your run.

## version 3.8.1 - 2015-08-16

### Fixed

- Parameters passed in the wrong order for basic auth when taking screenshots, thanks @jzoldak for the PR! #691
- Use same time out time when taking screenshots and when running yslow #725

## version 3.8.0 - 2015-08-10

### Fixed

- Removed faulty error logging from WPT if your location missed browser configuration. That was wrong, you actually don't need it.
- Basic Auth was missing when testing one page (since 3.7.0). Thank you Jesse Zoldak (@jzoldak) for the PR! #717
- You can now pass configuration files again. When you do a run, the config.json will be in your result folder. Pass it again with
  --configFile to your next run and it will be tested again, but in a new date result dir #270

### Added

- Pass request headers as JSON as complement to all headers in a file #715, thank you Devrim Tufan (@tufandevrim) for the PR.

## version 3.7.2 - 2015-07-21

### Fixed

- Testing a page multiple times ended up with HAR with many many requests for each page. This is now fixed in BrowserTime v0.10.2 #707

## version 3.7.1 - 2015-07-19

### Fixed

- Sending version numbers of sitespeed.io, firefox and chrome removes all dots except the first one

## version 3.7.0 - 2015-07-19

### Added

- Show and send total summary of collected data for all pages. Example: testing ten pages we will now have the total number of requsts made for all those 10 pages #693
- Send all individual navigation timings to Graphite (before we only sent calculated timings) #580
- Send sitespeed and browser version to Graphite. The keys in Graphite: [namespace].meta.chrome.version, [namespace].meta.firefox.version and [namespace].meta.sitespeed.version #703

### Changed

- Bumping versions: async, cross-spawn-async, fast-stats, fs-extra, handlebars, html-minifier, moment, phantomjs, request, winston, browsertime & xmlbuilder.
- If we just test one page, then skip the crawling (but do one request that checks the status of the page before we start) #706

### Fixed

- Text fixes, thanks @atdt #690
- New Browsertime version fixes Browser name and browser version in the HAR file #704

## version 3.6.3 - 2015-06-26

- Finally we have a HAR Viewer! It's a modified version of Rafael Cesars https://www.npmjs.com/package/simplehar. It could still need some love and work but we think it will add some real value.

- Bug fix: Worst Cached assets on the hotlist looked bad on small screens.

## version 3.6.2 - 2015-06-17

- Bug fix: Installation works on Windows again. Updated Browsertime with new Selenium that fixes the original problem.

## version 3.6.1 - 2015-06-08

- Bug fix: All WPT metrics wasn't sent ok #681

## version 3.6 - 2015-06-07

- Holy cow, we now support WebPageTest scripting ( https://sites.google.com/a/webpagetest.org/docs/using-webpagetest/scripting)! Every occurrence of {{{URL}}} in your script will be replaced with the URL that is actually going to be tested. Feed the script file to sitespeed.io using --wptScript #623

- When we are at it: also support custom scripts to collect metrics for WebPageTest! Feed your custom javascript metrics file using --wptCustomMetrics. Read more here: https://sites.google.com/a/webpagetest.org/docs/using-webpagetest/custom-metrics #678

- Graphite keys now replaces pipe, comma and plus. If your URL:s has them, they will now be replaced by a underscore. The reason is that some Grafana functions don't work with the special characters. Thanks @EikeDawid for the PR! #679

## version 3.5 - 2015-04-24

- Rewrite of the Graphite key generation, now always follow the patter protocol.my_domain_com.\_then_the_path #651.
  The cool thing is that this opens for a lot og Graphite/Grafana goodies, the bad is that if you use it today,
  you need to remap the keys in Grafana to get the graphs.

## version 3.4.1 - 2015-04-22

- Super ugly quick fix for dubplicate dots in graphite keys #654

## version 3.4 - 2015-04-21

- IMPORTANT: New structure for URL paths sent to Graphite. Now follow protocol.hostname.pathname structure, thanks @JeroenVdb #651
- Send size and type of every asset to Graphite #650 thanks @JeroenVdb!
- Renamed requesttimings to requests when choosing which data that should be sent to Graphite
- Hail the new default waitScript! If you are using phantomjs2 we will now wait for the loadEventEnd + aprox 2 seconds before we end a run for YSlow #653
- IMPORTANT: The old graphite key requests (showing number of requests) changed to noRequests.
- Bug fix: Specifying a custom yslow script now works again, fixing #649. Thanks to Jubel Han for reporting.

## version 3.3.3 - 2015-04-19

- Bug fix: Add size & number of requests for all domains
- Send accumulatedTime a.k.a total time for a domain for all assets to Graphite

## version 3.3.2 - 2015-04-19

- Bug fix: Fetch number of assets used per domain only once per HAR file.

## version 3.3.1 - 2015-04-19

- Bug fix: Number of request per domain always showed 1, that's not right!

## version 3.3 - 2015-04-18

- Send the total weight per domain and per content type to Graphite #644 thanks @JeroenVdb.
- Changed the key structure for request per domain (to follow the same structure as the rest of the domain keys): NAMESPACE.www.myhost.com.summary.domains.requests.\*
- If you start sitespeed with a callback method it will now call the callback(error, result) now supplying the result.
- Silence log when running in test env (log errors and above)

## version 3.2.10 - 2015-04-14

- Bug fix: Removed another limit for number of domains, setting it to 10 domains before #643

## version 3.2.9 - 2015-04-13

- Removed the limit of sending max 100 domains to Graphite #643

## version 3.2.8 - 2015-04-13

- Use --postURL to POST the result of an analyse to a URL
- Use --processJson to rerun all the post tasks on a result, use it to reconfigure what data to show in the HTML output.
- Bug fix: extra check when generating Graphite keys. #642

## version 3.2.7 - 2015-04-08

- Send request timings to Graphite if we use WebPageTest #639
- Possible to configure the URL to a selenium server (making Chrome on Linux more stable or at least less instable)

## version 3.2.6 - 2015-04-05

- Bumped to new Browsertime version with support for starting your own Selenium server. Use --btConfig to configure the server.

## version 3.2.5 - 2015-04-02

- Bug fix: 3.2.4 contain code that shouldn't be released ...

## version 3.2.4 - 2015-04-01

- Bug fix: Put User Timings (from the User Timing API) in the summary
- Bug fix: Put custom javascript value into the summary
- Bug fix: Budget for BrowserTime metrics stopped working since the last restructure of BT data.

## version 3.2.3 - 2015-03-26

- Bug fix: --storeJson (storing all collected data in one JSON file) didn't work.
- Bug fix: PhantomJS 2.0 had stopped working fetching timings #621, thanks Patrick Wieczorek for reporting

## version 3.2.2 - 2015-03-23

- New Browsertime version, putting User Timings back in the statistics and killing hanging Chrome/Chromedrivers on Linux. Older version could hang when running Chrome on Linux.

## version 3.2.1 - 2015-03-21

- Check that URLs are valid when fetched from a file
- Bug fixes: Compressed sizes has been wrong a long time since a bug in PhantomJS. However, if you also fetch data using browsers or  WebPageTest, the sizez will now be correctly populated! #54 #577
- New Browsertime 0.9.2 with fix for HTTPS, making requests visible in HAR-files.

## version 3.2.0 - 2015-03-18

- Check that we got an HAR from WebPageTest before we use the data #596
- We have made it easier to test multiple sites. Add multiple sites by pointing out multiple files like --sites mySite1.txt --sites mySite2.txt. This is done becasue it plays much nicer with our docker images. #579
- Default memory decreased to 256, the old 1024 is only needed when fetching really big sites. 256 is good because it is easier to use oob on small boxes. #610
- Make it easier to use customScripts and waitScript in BrowserTime. Custom scripts metrics is now shown in the result pages and sent to Graphite #611
- Upgraded to latest BrowserTime 0.9 with new structure of the data
- Simplified the proxy usage #612 meaning the proxy will start when Browsertime is needed

## version 3.1.12 - 2015-03-06

- Better title and descriptions #605 and removed robots no index
- Minify HTML output #608
- Bug fix: Handle requests with malformed URI:s when sending data to Graphite #609

## version 3.1.11 - 2015-03-05

- Send all timings per requests to Graphite when collecting data using Browsertime and WebPageTest (turn on with --graphiteData all or --graphiteData requesttimings) #603

- Flatten the domain name when sending domain timings to Graphite (making it easier to make nice graphs) #601

- Configure paths to assets for result pages #604

- Bug fix: If Graphite server is unreachable, callback chain was broken, meaning sitespeed didn't end properly #606

## version 3.1.10 - 2015-03-02

- New Browsertime version, setting timeout for browser drivers.

## version 3.1.9 - 2015-03-01

- Cleaned up the structure for Graphite internally #600
- Send domain timings info to Graphite to spot slow domains
- Show errors in error page, only when we have errors
- Upgrade to handlebars 3.0
- Upgraded Browsertime with new Selenium version, making Firefox 36 work

## version 3.1.8 - 2015-02-26

- Added verbose logging for GPSI
- Bumped Browsertime version, including fix for stopping Browsermobporxy on Windows

## version 3.1.7 - 2015-02-24

- Running only one run for WPT made aggregators failed (once again) #589
- Links in CLI now pointing to new documentation URL:s
- Log Graphite host & port each time the metrics is sent

## version 3.1.6 - 2015-02-20

- Faulty configuration for default WebPageTest location #588

## version 3.1.5 - 2015-02-20

- Enable verbose logging in Browsertime whenever Sitespeed.io runs in verbose mode (--verbose/-v).
- Check that location for WPT always contains location and browser
- Bumped BrowserTime, new version making sure it will not hang when Selenium/ChromeDriver has problems.

## version 3.1.4 - 2015-02-16

- Log the time the analyse of the URL(s) took #578

## version 3.1.3 - 2015-02-13

- Improve validation of command line parameters.
- Added perf budget HTML page #576. Running a budget will also create an HTML page of the result. Thanks @stefanjudis for the idea!
- New BrowserTime version (0.8.22)

## version 3.1.2 - 2015-02-06

- Include Node.js version when printing versions at the start of each run.
- Ok, incredible stupid implementation by me for the current perf budget,
  throwing an error when failing. Now the result array of the tests are returned.
- Added support for having a budget for number of requests, type and size #571
- Bug fix: Since we added slimerjs, we showed headless domContentLoadedTime as a page colum for every tested page.
- Bug fix: Don't automatically add column data if you configure it yourself.
- Bug fix: Headless timings perf budget was broken.

## version 3.1.1 - 2015-02-04

- Changed to eslint from jshint.
- Updated to latest phantomjs package.
- Updated to latest BrowserTime (with 2.0.0 of BrowserMobProxy)
- You can now choose not to create the domain path in the result dir
  by using the flag suppressDomainFolder #570
- Better handling of feeding URL:s via file. Supports array with URLs and file.

## version 3.1 - 2015-01-27

- Support for SlimerJS. Note: Choose which "headless" analyzer to use by
  using --headless [slimerjs|phantomjs]. Default is phantomjs.
  Also fetch timings using your choice by configure -b headless #544 #559

- Run WebPageTest test from multiple locations/browsers/connectivity. In 3.0
  you could only use one browser/location/connectivity, now you can use
  as many as you want. Everything is backward compatible except the Graphite keys
  for WebPageTest has changed, now including browser, location and connectivity.

  Meaning you need to change Grafana or what tool you are using to use the new
  keys when you upgrade. #546

- Hardcoded dependencies in package.json

## version 3.0.5 - 2015-01-21

- Changed deprecated phantom.args to be compatible to PhantomJS 2 #558

## version 3.0.4 - 2015-01-19

- Bugfix: Errors when taking screenshots weren't recorded as errors.
- Bugfix: Fix crash when running analysis #562

## version 3.0.3 - 2015-01-07

- Choose if you want to create HTML reports or not (--no-html) #548
- Bugfix: URL:s with and without request parameters collided when
  data files was created, now an extra hash is added to URL:s with
  parameters #552
- Better logging for PhantomJS

## version 3.0.2 - 2014-12-19

- fixes in the YSlow script so that some pages that fails, will work #549

## version 3.0.1 - 2014-12-18

- Add experimental support for running yslow in [SlimerJS](http://www.slimerjs.org) #544
- Fix Google PageSpeed Insights that broke in 3.0 #545
- Better logs when screenshot fails and increased timeout to 2 minutes
- Upgraded to new Crawler with higher default timeout times #547
- Added parameter to configure which phantomjs version to use (--phantomjsPath)

## version 3.0.0 - 2014-12-15

- The main goal with 3.0 has been to move to NodeJS. The crawler & BrowserTime still uses Java and we will try to move away from that in the future
- Support for getting Navigation Timing data from PhantomJS 2.0
- Drive/get/collect data from WebPageTest & Google Page Speed Insights
- Two new summary pages: Slowest domains and Toplist (with information about assets). More info will come
- We use Handlebars templates (instead of the old Velocity ones).
- All data is is JSON instead of XML as it was before.
- HAR-files created from the browser you use when fetching Navigation Timing API metrics
- Generate JUnit XML files/TAP and/or send data to Graphite; now included as main functionality.
- Send your metrics to Graphite
- Yep, hate to say it but the parameters to the CLI has changed, so please check --help to see how you should do

## version 2.5.7 - 2014-03-17

- Upgraded to YSlow 3.1.8 (with configurable CDN)
- Added support for Basic Auth (only missing in Browser Time right now, meaning you can't use Basic Auth to get timings)
- Turned on CDN rule and made it possibly to supply CDN domains
- Added new crawler that solves problem when the crawler picked up URLs with wrong domain, thanks @ChrisSoutham
- Updated support for catching lazy loaded assests in YSlow/PhantomJS, thanks @dorajistyle
- Show the 90 percentile value for all timing metrics on the individual pages #380
- Mobile rules changed: Doc size max 14 kb and max server side 200 ms for Green
- Summary: Show max number of request per domain #384
- Summary: Show number of redirects per page #385
- The avoid scaled images rules has been changed: If the image is larger than X (100 pixels by default) the rule will kick in.
- The sitespeed.io-sites script now uses firstPaint as default if you use IE or Chrome, supports local config file & uses maxRequestsPerDomain
  as default column instead of max requests per domain #387
- DNSLookup hurts more than CSS requests in points for Critical Path Rule #392
- Bug fix: If an error happens when crawling, log that to the error.log #378
- Bug fix: User defined measurements get Velocity code as description #366
- Bug fix: Show one decimal for time metrics on pages #363
- Bug fix: Connect via any SSL protocol #379 thanks @tollmanz
- Kind of a bug fix: The crawler can now handle a href tags with a line break instead of space between the a & the href

## version 2.5.6 - 2014-02-15

- New BrowserTime version 0.6 that fix crash while trying to run resource timing measurements in Firefox,
  see the list of changes here: https://github.com/tobli/browsertime/releases/tag/browsertime-0.6

## version 2.5.5 - 2014-01-30

- Bug fix: New version of the crawler, the proxy support was broken in the last release
- Added proxy support when collecting Navigation Timing metrics #351
- Added support for local configuration where you can override default configuration (thanks @AD7six)

## version 2.5.4 - 2014-01-28

- Bug fix: If phantomJS fails, the whole analyse fails (introduced in 2.5.x) #359
- The crawler now handles gziped content #263

## version 2.5.3 - 2014-01-25

- When parsing all individual HTML files, show how many that has been parsed every 20 run #354
- Bug fix: The internal link to assets on the detailed page don't work #355
- Bug fix: Redirected URL don't report the end location URL (see the description in the issue for the full story #356)

## version 2.5.2 - 2014-01-24

- Even better fix for #352

## version 2.5.1 - 2014-01-23

- Fixed defect when trying to output error to the current console (instead of using the stderr) #352

## version 2.5 - 2014-01-20

- Better error handling: Log all errors to the error log file and #334 and make sure one page error will not break the whole test #329
- Test in multiple browsers in one run #341

## version 2.4.1 - 2014-01-10

- Put the HAR file in the HAR directory instead of sitespeed home dir (fixes #343), now it will work in Jenkins for Ubuntu

## version 2.4 - 2014-01-08

- If Chrome or IE is used, display firstPaintTime in the summary as default #307
- Added more default fields in the summary: requestsMissingGzip, jsWeightPerPage, cssWeightPerPage #325
- Changed order of the summary fields so that logical fields are grouped together
- Made it clearer that CSS & JS weight are per file in the summary (meaning inline CSS/JS are not included)
- Show red/yellow/green for cacheTime on the summary page #312 and for JS & CSS size
- Added short description on each rule on the summary page (hover to see it) #161
- New XML-Velocity jar that with a small change how template files are loaded
- New BrowserTime version that works on Windows & fetch resource timings
- Sitespeed.io works (again) on Windows, this time also when fetching Navigation Timing metrics
- Show which browser that is used on the summary page when collecting timing metrics
- Bug fix: the rule "Avoid DNS lookups when a page has few requests" was broken, couldn't tell if JS was loaded async or not #328
- Bug fix: Running the JUnit test script after you fetched URL:s from a file was broken

## version 2.3.1 - 2013-12-27

- Bug fix: Fixed bug When api.exip.org is down (sitespeed stops to work)

## version 2.3 - 2013-12-10

- Put the JUnit files into a dir named /junit/ when running the sitespeed.io-junit script. WARNING: this means you need to change in Jenkins where you match the files.
- Include -V when listing supported options in command line help

## version 2.2.3 - 2013-12-02

- Bug fix: The sitespeed-sites script had wrong path to the sitespeed script
- Added the number of text assets that are missing GZIP on the summary page (xml) #310 and for pages #315. Add it by the name requestsWithoutGZipPerPage
- Fix in how to handle browser parameters, to get it to work clean with Jenkins

## version 2.2.2 - 2013-11-14

- Bug fix: User marks named with spaces broke the summary.xml
- Bug fix: Sites with extremely far away last modification time on an asset, could break an analyse
- Upgraded Browser Time version to 0.4, getting back custom user measurements.

## version 2.2.1 - 2013-11-12

- Bug fix: Cleaner handling of relative URL in the sitespeed.io-junit script.

## version 2.2 - 2013-11-12

- Moved all scripts to the bin folder, following the standard and easier to package
- Cleanup all scripts to use absolute paths, making it easier to package for Homebrew
- sitespeed-sites.io now always need to have the filename of the text file containing all the URLS
- New names: sitespeed.io-sites & sitespeed.io-junit
- New BrowserTime version (0.3) including backEndTime & frontEndTime
- Changed default summary page to show backend & frontend time (removed redirectionTime & domInteractiveTime)
- Increased timeout for the crawler for really slow pages
- Bug fix: The fix for removing invalid XML caharcters created by GA, sometimes broke the analyse, now fixed (#304)

## version 2.1.1 - 2013-11-05

- New BrowserTime version, having 60s wait for load, also fixes Firefox 25 bug
- Logging all PhantomJS errors to own PhantomJS error log
- Bug fix: URL using brackets didn't get correct doc size
- Bug fix: Unable to crawl websites with GA cookie #298
- Bug fix: sitespeed-sites.io used the sitespeed.io script with sh instead of bash

## version 2.1 - 2013-10-28

- Create two JUnit xml files, one for rules & one for timing metrics! The new names of the output files are: sitespeed.io-rules-junit.xml & sitespeed.io-timings-junit.xml
- Finetuned the logo
- Output the the input parameters to the error.log so it is easy to reproduce the error
- Centralized the error logging
- Added an easy way of include sitespeed.io in Travis-CI
- Made it possible to analyse a site with non signed certificates
- Prepared for HTTP 2.0 rules & renamed the current rulesets, new names: sitespeed.io-desktop & sitespeed.io-mobile
- Also copy the result.xml file to the output dir for sitespeed.io-junit.xml (to be able to create graphs per URL)
- Bug fix: The crawler sometimes picked up URL:s linking to other content types than HTML
- Bug fix: The JUnit xslt outputted timings metrics

## version 2.0 - 2013-10-12

## Major changes

- You can now choose which data that is showed in the summary boxes (the red/yellow/green ones on the start page) and the columns on the detailed summary page.
- You can also create your own box with your own data on the summary page and your own columns and data on the detailed summary page.
- Fetch Navigation Timing API data from a real browser, using Browser Time.
- New modified rule: the YSlow rule yimgnoscale doesn't work with PhantomJS. The new rule compare the image browser width and the real image width.
- The main script (sitespeed.io) has been cleaned up & Velocity templates has been restructured.
- You can now test multiple sites and compare them using the sitespeed-sites.io script (you can choose what kind of data to compare).
- There are now two different rule-sets, one for desktop & one for mobile.

## Minor changes

- You can now configure the limits for the rules on the summary page.
- Phone view on detailed summary page now only contains url & score to make it simpler to maintain.
- You can now see the IP of the computer running the test in the result.xml file.
- You can now set the max pages to test & the name of the test (displayed on every HTML page).
- Simplified user agent by choosing between iphone, ipad or nexus and a real agent & viewport is set.
- Output as CSV: Choose which column to output and always output ip, start url & date.
- Fix for Windows-users that is having spaces in their path to Java.
- Bug fix: URL:s that returns error (4XX-5XX and that sitespeed can't analyse) is now included in the JUnit xml.
- Bug fix: The JUnit script can now output files to a relative path.
- Bug fix: User Agent is now correctly set.

## version 1.8.3

- Supply a test name that will be shown on all pages. Use the the parameter -n
- Well the problem is like this: Today there is no way to get the ttfb from PhantomJS so it is fetched by a extra request using curl. Some sites that don't cache internally (and are slow) can differ quite much for ttfb, meaning ttfb can be higher the next request than the load time the first time. If this happens it is now highlighted.
- Bug fix: show median front/back end time instead of percentile on summary page
- Bug fix: when the ttfb is larger than pageload, don't add it to summary stats
- Bug fix: for some sites (very rarely) the total weight was fetched wrong by YSlow, fixed last release for all pages except summary & summary details.

## version 1.8.2

- Show percentage of requests & size per content type
- You can now export the pages data to csv (again) with the switch "-o csv"
- Upgraded the crawler: Better closing of connections, URL:s that not following RFC 2396 gave null pointers & when a cookie is not following the spec, the url of the page setting the cookie is now logged
- On detailed page summary: Categorize favicon as favicon instead of others, and doc type has now an own category
- If an analysis fails, the url and the error from YSlow is now logged
- Cleanup: When you feed sitespeed.io with a list of urls from a file, the text messages is cleaner in the HTML
- Cleanup: Removed old JS table sorter on pages summary, works better now
- Bug fix: If a page was redirected, the gzipped size was fetched as 0, now fixed
- Bug fix: For some sites (example www.bike.se) the total weight was fetched wrong by YSlow, now the weight is calculated from each assets on the pages info page.
- Bug fix: Urls containing & broke some tests
- Bug fix: In very rare cases, YSlow reports a larger cache weight than the page weight. The bug is not fixed but when it happens, an error message is displayed
- Bug fix: Page weight was sometimes wrongly calculated, now each asset weight is used to calculate

## version 1.8.1

- Bug fix: TTFB on detailed page said ms but the value is s
- Bug fix: Yslow didn't honour max-age before expires (following 1.1 spec), now fixed
- Bug fix: Yslow couldn't fetch headers/weight for @import relative css, fixed
- Bug fix: Yslow now fetch assets, not fetched by PhantomJS
- Added the original favicon rule from Yslow since it works now with the bug fix
- Added favicon to the expire rules

## version 1.8

- Changed report dir name. Before it was sitespeed-HOST-NOWDATE, now it is HOST/NOWDATE, to make it easier to compare runs over time
- Added new XML format for the summary page.
- New page: The detailed summary page.
- Always output the result of the sitespeed-junit.io to the data dir
- Changed summary page: Before showed average & median, now median & 95 percentile
- Added summary of total image weight per page & on detailed level you can see individual size
- New rule for checking if old versions of plugins is used. Right now only check JQuery.
- A little better check for correct Java version.
- Bug fix: The check for number of DOM elements where wrong when checking for warning

## version 1.7

- Added check that Java exists before the analyse
- Feed sitespeed with either a url to crawl or a plain text file with a list of URL:s (NOTE: the -f argument is now used for the file, the -c is the new for follow a specific path when crawling)
- Create a junit xml file from the test, new script & new xsl file
- Added new max size of a document, using stats from http archive
- Showing the number of domains on page summary
- Showing the percentage of assets that are cacheable on page summary
- Show the amount of assets that don't have an expire header om site summary & pages summary
- Removed prime cache values from site summary & page summary (was not always correct)
- Refactored page summary
- Removed rule ynumreq and created three new ones in order to get clearer junit xml result (and also only check for sync js): cssnumreq, cssimagesnumreq & jsnumreq
- Added average & median nr of DOM elements on site summary and specific nr on page
- Added response headers info on assets page
- Bug fix: If a max age HTTP cache header was missing the cache time, the cache time was set to 0, not listening to Expires header.
- Bug fix: If a asset was missing expire header, the last one before that expire was inherited

## version 1.6

- The SPOF rule now only report font face that are loaded from another top level domain. Also the actual font file is reported.
- Show requests per domain on individual page.
- Show cache time for each asset & delta between last modified & delivered + average.
- Configure which yslow file to use and which ruleset.
- Show time spent in frontend vs backend per page.
- On the summary page, now show info blocks: time spent in frontend/backend and cachetime/last modified average.
- New page: The assets page, show the most used assets for the site
- Adjusted the warning rules on the summary page, now a warning is up to the average number collected from httparchive (where applicable)
- Java jar dependencies now compiled for java 1.6 and higher
- Upgraded Yslow to 3.1.5

## version 1.5.2

- Bugfix: The SPOF rule reported CSS & JS as SPOF:s wrongly

## version 1.5.1

- Bugfix: The crawler reported links returning 200 with another content type then text/html as error url:s

## version 1.5

- Added support for configuring the crawler (see the dependencies/crawler.properties file).
- Added support for analyse behind proxy (thanks https://github.com/rhulse and https://github.com/samteeeee for reporting and testing it)
- Added html page that shows url:s that returned errors from the crawl
- Added percentage on summary page
- Added support for setting user agent
- Added support for setting view port
- Removed experimental rule for the amount of JS used
- Added new rule: Critical Path
- Finetuned the SPOF rule: Now also check font face
- Added time to first byte (using curl, new requirement)
- Fixed so document weight is fetched from curl aka the right sized if gzipped
- Bugfix: The check for phantomjs wasn't working, works now
- Bugfix: Now using JAVA_HOME in a correct way (thanks Rob-m)
- Bugfix: Upgraded the crawler to 1.3, now only fetched text/html links
- Removed csv as output format
- New rule: Avoid CDN lookups when your page has few requests
- New rule: Do not load stylesheet files when the page has few request
- New rule: Have a reasonable percentage of textual content compared to the rest of the page

## version 1.4

- Changed the limit value for doc size on the summary page, vas 10 kb but gzip is taken into consideration, changed to 100 kb!
- Concatenating css & js in the results to one file each
- Show average of how much of a page that consist of javascript in percent, on the summary page
- Show median values where applicable on the summary page (now show both average & median value)
- Show how much of a page that is js & css on a page in percent, compared to content
- Made java heap size & result directory configurable from the sitespeed script
- Cleanup if the sitespeed.io script, removed unused code and made it easier to update
- You can now zip the output result by calling the script
- Upgraded to latest crawler & xml-velocity jar
- Added image, css, js and css image total weight/size on page view
- Added new experimental rule of javascript percentage
- Upgraded jquery from 1.8.2 to 1.8.3

## version 1.3

- Made all pages responsive, standard stuff except the table in pages.vm, two different tables, one for phones, one for the rest
- Moved webpagetest link from pages.vm to page, to make more space
- Added the summary data also on page.vm
- Added possibility to output all page data as csv file (yes that old thing)
- Added possibility to output every html file as png, for easy include in documents/web etc
- Added htmlcompressor (http://code.google.com/p/htmlcompressor/) to compress all html, to make the pages smaller
- Upgraded to latest version of the crawler (smaller in size)
- Added support for handling testing only one page (depth = 0), thanks @tomsutton1984

## version 1.2

- Better handling of input parameters, now you specify them in the order you like
- Possibility to not crawl specific path segments in urls
- Run multiple processes when analyzing pages (to make it faster)
- More documentation in the sitespeed.io script
- Include rules dictionary when using yslow, always update the doc.js in yslow when adding new rule
- Show the full rule name when showing broken rules
- Show explanation for all rules used, linked from summary page
- Show exact rule number, for easier trackback

## version 1.1 - 2012-10-15

- New crawler instead of wget that didn't work on some sites with spider options (amazon etc)
- Fix for css in head rule, now only dns lookups are punished, not the number of css
- Crawl by follow a specific path, meaning you can analyse parts of sites

## version 1.0.1

- Fixed bug that sometimes url:s was fetched from different domains than the main domain
- Added links to tested start url on both summary and page page
- Added parameters to webpagetest run three times by default
- When a SPOF is found, link to webpagetest with SPOF domains activated is used by default

## version 1.0 - 2012-10-10

- Show full urls in pages & page to easier understand which url that is analysed
- Show extra data in modals to make it clearer
- Popover & better texts on summary page
- Cleanup & bug fixes in the bash script, it sometimes failed on some sites when yslow outputted content after the xml
- Added output png:s that can be used on documents

## version 0.9 - 2012-09-26

- New rules: Loading js async and finding single point of failure
- Modified expires to skip analytics scripts
- Updated rules texts

## version 0.8 - 2012-08-25

- Added new custom rules and modified existing yslow rules.
- Favicon added :)

## version 0.7 - 2012-08-23

- Upgraded to jquery 1.8
- Upgraded Twitter Bootstrap to 2.1
- Better title tag on result pages
- Fixed so that long url:s don't break
- Sometimes output xml was broken
- Only fetch content of type html
