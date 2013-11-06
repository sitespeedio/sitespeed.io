BUILD := build
DEP := dependencies
REPORT := report
CSS := css
IMG := img
ICO := ico
JS := js
FONTS := fonts
PROPERTIES := properties
VELOCITY := velocity
MACROS := macros
INC := inc
XML := xml
CSV := csv
LOGIC := logic
COLUMNS := pages/columns
COLUMN-HEADERS := pages/column-headers
SITE-SUMMARY := site.summary
XSLT := xslt
SITESPEED_IO_VERSION := $(shell egrep '^version' CHANGELOG | head -1 | awk '{print $$2;}')
clean:
	@echo "Clean the package"
	@rm -fR $(BUILD)
	@echo "done"

build: 
	@echo "Building sitespeed.io"
	@if [ ! -d $(BUILD) ]; then mkdir -p $(BUILD); fi
	@if [ ! -d $(BUILD)/$(DEP) ]; then mkdir -p $(BUILD)/$(DEP); fi
	@if [ ! -d $(BUILD)/$(REPORT) ]; then mkdir -p $(BUILD)/$(REPORT); fi
	@if [ ! -d $(BUILD)/$(REPORT)/$(CSS) ]; then mkdir -p $(BUILD)/$(REPORT)/$(CSS); fi
	@if [ ! -d $(BUILD)/$(REPORT)/$(IMG) ]; then mkdir -p $(BUILD)/$(REPORT)/$(IMG); fi
	@if [ ! -d $(BUILD)/$(REPORT)/$(IMG)/$(ICO) ]; then mkdir -p $(BUILD)/$(REPORT)/$(IMG)/$(ICO); fi
	@if [ ! -d $(BUILD)/$(REPORT)/$(FONTS) ]; then mkdir -p $(BUILD)/$(REPORT)/$(FONTS); fi
	@if [ ! -d $(BUILD)/$(REPORT)/$(JS) ]; then mkdir -p $(BUILD)/$(REPORT)/$(JS); fi
	@if [ ! -d $(BUILD)/$(REPORT)/$(PROPERTIES) ]; then mkdir -p $(BUILD)/$(REPORT)/$(PROPERTIES); fi
	@if [ ! -d $(BUILD)/$(REPORT)/$(VELOCITY) ]; then mkdir -p $(BUILD)/$(REPORT)/$(VELOCITY); fi
	@if [ ! -d $(BUILD)/$(REPORT)/$(VELOCITY)/$(LOGIC) ]; then mkdir -p $(BUILD)/$(REPORT)/$(VELOCITY)/$(LOGIC); fi
	@if [ ! -d $(BUILD)/$(REPORT)/$(VELOCITY)/$(XML) ]; then mkdir -p $(BUILD)/$(REPORT)/$(VELOCITY)/$(XML); fi
	@if [ ! -d $(BUILD)/$(REPORT)/$(VELOCITY)/$(CSV) ]; then mkdir -p $(BUILD)/$(REPORT)/$(VELOCITY)/$(CSV); fi
	@if [ ! -d $(BUILD)/$(REPORT)/$(VELOCITY)/$(MACROS) ]; then mkdir -p $(BUILD)/$(REPORT)/$(VELOCITY)/$(MACROS); fi	
	@if [ ! -d $(BUILD)/$(REPORT)/$(VELOCITY)/$(INC)/$(COLUMNS) ]; then mkdir -p $(BUILD)/$(REPORT)/$(VELOCITY)/$(INC)/$(COLUMNS); fi
	@if [ ! -d $(BUILD)/$(REPORT)/$(VELOCITY)/$(INC)/$(COLUMN-HEADERS) ]; then mkdir -p $(BUILD)/$(REPORT)/$(VELOCITY)/$(INC)/$(COLUMN-HEADERS); fi		
	@if [ ! -d $(BUILD)/$(REPORT)/$(VELOCITY)/$(INC)/$(SITE-SUMMARY) ]; then mkdir -p $(BUILD)/$(REPORT)/$(VELOCITY)/$(INC)/$(SITE-SUMMARY); fi    	
	@if [ ! -d $(BUILD)/$(REPORT)/$(XSLT) ]; then mkdir -p $(BUILD)/$(REPORT)/$(XSLT); fi

	@cp sitespeed.io sitespeed-junit.io sitespeed-sites.io travis-ci.sh CHANGELOG LICENSE $(BUILD)/
	@cp $(DEP)/LICENSE.txt $(BUILD)/$(DEP)/
	@cp $(DEP)/crawler-1.5.7-full.jar $(BUILD)/$(DEP)/
	@cp $(DEP)/crawler.properties $(BUILD)/$(DEP)/
	@cp $(DEP)/xml-velocity-1.8.2-full.jar $(BUILD)/$(DEP)/	
	@cp $(DEP)/screenshot.js $(BUILD)/$(DEP)/
	@cp $(DEP)/htmlcompressor-1.5.3.jar $(BUILD)/$(DEP)/
	@cp $(DEP)/yuicompressor-2.4.6.jar $(BUILD)/$(DEP)/
	@cp $(DEP)/yslow-3.1.5-sitespeed.js $(BUILD)/$(DEP)/
	@cp $(DEP)/rules-desktop.properties $(BUILD)/$(DEP)/
	@cp $(DEP)/rules-mobile.properties $(BUILD)/$(DEP)/
	@cp $(DEP)/browsertime-0.3-SNAPSHOT-full.jar $(BUILD)/$(DEP)/
	@cp $(DEP)/timing-limits-default.xml $(BUILD)/$(DEP)/
	@cp $(REPORT)/$(CSS)/bootstrap.min.css $(BUILD)/$(REPORT)/$(CSS)/
	@cp $(REPORT)/$(CSS)/bootstrap-overrides.css $(BUILD)/$(REPORT)/$(CSS)/
	@cp $(REPORT)/$(IMG)/$(ICO)/sitespeed.io-114.png $(BUILD)/$(REPORT)/$(IMG)/$(ICO)/
	@cp $(REPORT)/$(IMG)/$(ICO)/sitespeed.io-144.png $(BUILD)/$(REPORT)/$(IMG)/$(ICO)/
	@cp $(REPORT)/$(IMG)/$(ICO)/sitespeed.io-72.png $(BUILD)/$(REPORT)/$(IMG)/$(ICO)/	
	@cp $(REPORT)/$(IMG)/$(ICO)/sitespeed.io.ico $(BUILD)/$(REPORT)/$(IMG)/$(ICO)/
	@cp $(REPORT)/$(IMG)/sitespeed-logo.png $(BUILD)/$(REPORT)/$(IMG)/
	@cp $(REPORT)/$(JS)/bootstrap.min.js $(BUILD)/$(REPORT)/$(JS)/
	@cp $(REPORT)/$(JS)/jquery-1.10.2.min.js $(BUILD)/$(REPORT)/$(JS)/
	@cp $(REPORT)/$(JS)/stupidtable.min.js $(BUILD)/$(REPORT)/$(JS)/
	@cp $(REPORT)/$(FONTS)/glyphicons-halflings-regular.eot $(BUILD)/$(REPORT)/$(FONTS)/
	@cp $(REPORT)/$(FONTS)/glyphicons-halflings-regular.svg $(BUILD)/$(REPORT)/$(FONTS)/
	@cp $(REPORT)/$(FONTS)/glyphicons-halflings-regular.ttf $(BUILD)/$(REPORT)/$(FONTS)/
	@cp $(REPORT)/$(FONTS)/glyphicons-halflings-regular.woff $(BUILD)/$(REPORT)/$(FONTS)/
	@cp $(REPORT)/$(PROPERTIES)/pages.properties $(BUILD)/$(REPORT)/$(PROPERTIES)/
	@cp $(REPORT)/$(PROPERTIES)/page.properties $(BUILD)/$(REPORT)/$(PROPERTIES)/
	@cp $(REPORT)/$(PROPERTIES)/site.summary.properties $(BUILD)/$(REPORT)/$(PROPERTIES)/
	@cp $(REPORT)/$(PROPERTIES)/sites.summary.properties $(BUILD)/$(REPORT)/$(PROPERTIES)/
	@cp $(REPORT)/$(PROPERTIES)/summary.details.properties $(BUILD)/$(REPORT)/$(PROPERTIES)/	
	@cp $(REPORT)/$(PROPERTIES)/rules.properties $(BUILD)/$(REPORT)/$(PROPERTIES)/
	@cp $(REPORT)/$(PROPERTIES)/assets.properties $(BUILD)/$(REPORT)/$(PROPERTIES)/
	@cp $(REPORT)/$(PROPERTIES)/errorurls.properties $(BUILD)/$(REPORT)/$(PROPERTIES)/
	@cp $(REPORT)/$(PROPERTIES)/screenshots.properties $(BUILD)/$(REPORT)/$(PROPERTIES)/
	@cp $(REPORT)/$(VELOCITY)/$(INC)/footer.vm $(BUILD)/$(REPORT)/$(VELOCITY)/$(INC)/
	@cp $(REPORT)/$(VELOCITY)/$(MACROS)/util.macros.vm $(BUILD)/$(REPORT)/$(VELOCITY)/$(MACROS)
	@cp $(REPORT)/$(VELOCITY)/$(MACROS)/date.macros.vm $(BUILD)/$(REPORT)/$(VELOCITY)/$(MACROS)
	@cp $(REPORT)/$(VELOCITY)/$(MACROS)/pages.macros.vm $(BUILD)/$(REPORT)/$(VELOCITY)/$(MACROS)
	@cp $(REPORT)/$(VELOCITY)/$(CSV)/pages.csv.vm $(BUILD)/$(REPORT)/$(VELOCITY)/$(CSV)
	@cp $(REPORT)/$(VELOCITY)/detailed.site.summary.vm $(BUILD)/$(REPORT)/$(VELOCITY)/
	@cp $(REPORT)/$(VELOCITY)/site.summary.vm $(BUILD)/$(REPORT)/$(VELOCITY)/
	@cp $(REPORT)/$(VELOCITY)/$(INC)/header.vm $(BUILD)/$(REPORT)/$(VELOCITY)/$(INC)/
	@cp $(REPORT)/$(VELOCITY)/page.vm $(BUILD)/$(REPORT)/$(VELOCITY)/
	@cp $(REPORT)/$(VELOCITY)/$(LOGIC)/page.logic.vm $(BUILD)/$(REPORT)/$(VELOCITY)/$(LOGIC)/
	@cp $(REPORT)/$(VELOCITY)/$(LOGIC)/assets.logic.vm $(BUILD)/$(REPORT)/$(VELOCITY)/$(LOGIC)/
	@cp $(REPORT)/$(VELOCITY)/assets.vm $(BUILD)/$(REPORT)/$(VELOCITY)/
	@cp $(REPORT)/$(VELOCITY)/rules.vm $(BUILD)/$(REPORT)/$(VELOCITY)/
	@cp $(REPORT)/$(VELOCITY)/errorurls.vm $(BUILD)/$(REPORT)/$(VELOCITY)/
	@cp $(REPORT)/$(VELOCITY)/$(LOGIC)/site.summary.xml.logic.vm $(BUILD)/$(REPORT)/$(VELOCITY)/$(LOGIC)/
	@cp $(REPORT)/$(VELOCITY)/$(XML)/site.summary.xml.vm $(BUILD)/$(REPORT)/$(VELOCITY)/$(XML)/
	@cp $(REPORT)/$(VELOCITY)/pages.vm $(BUILD)/$(REPORT)/$(VELOCITY)/
	@cp $(REPORT)/$(VELOCITY)/screenshots.vm $(BUILD)/$(REPORT)/$(VELOCITY)/
	@cp $(REPORT)/$(VELOCITY)/sites.summary.vm $(BUILD)/$(REPORT)/$(VELOCITY)/
	@cp $(REPORT)/$(XSLT)/junit-rules.xsl $(BUILD)/$(REPORT)/$(XSLT)/
	@cp $(REPORT)/$(XSLT)/junit-timings.xsl $(BUILD)/$(REPORT)/$(XSLT)/
	@cp $(REPORT)/$(VELOCITY)/$(INC)/$(SITE-SUMMARY)/box.vm $(BUILD)/$(REPORT)/$(VELOCITY)/$(INC)/$(SITE-SUMMARY)/
	@cp $(REPORT)/$(VELOCITY)/$(INC)/$(COLUMNS)/browserScaledImages.vm $(BUILD)/$(REPORT)/$(VELOCITY)/$(INC)/$(COLUMNS)/
	@cp $(REPORT)/$(VELOCITY)/$(INC)/$(COLUMNS)/criticalPathScore.vm $(BUILD)/$(REPORT)/$(VELOCITY)/$(INC)/$(COLUMNS)/
	@cp $(REPORT)/$(VELOCITY)/$(INC)/$(COLUMNS)/cssImagesPerPage.vm $(BUILD)/$(REPORT)/$(VELOCITY)/$(INC)/$(COLUMNS)/
	@cp $(REPORT)/$(VELOCITY)/$(INC)/$(COLUMNS)/cssPerPage.vm $(BUILD)/$(REPORT)/$(VELOCITY)/$(INC)/$(COLUMNS)/
	@cp $(REPORT)/$(VELOCITY)/$(INC)/$(COLUMNS)/cssWeightPerPage.vm $(BUILD)/$(REPORT)/$(VELOCITY)/$(INC)/$(COLUMNS)/
	@cp $(REPORT)/$(VELOCITY)/$(INC)/$(COLUMNS)/docWeight.vm $(BUILD)/$(REPORT)/$(VELOCITY)/$(INC)/$(COLUMNS)/
	@cp $(REPORT)/$(VELOCITY)/$(INC)/$(COLUMNS)/domainsPerPage.vm $(BUILD)/$(REPORT)/$(VELOCITY)/$(INC)/$(COLUMNS)/
	@cp $(REPORT)/$(VELOCITY)/$(INC)/$(COLUMNS)/fontsPerPage.vm $(BUILD)/$(REPORT)/$(VELOCITY)/$(INC)/$(COLUMNS)/
	@cp $(REPORT)/$(VELOCITY)/$(INC)/$(COLUMNS)/imageWeightPerPage.vm $(BUILD)/$(REPORT)/$(VELOCITY)/$(INC)/$(COLUMNS)/
	@cp $(REPORT)/$(VELOCITY)/$(INC)/$(COLUMNS)/imagesPerPage.vm $(BUILD)/$(REPORT)/$(VELOCITY)/$(INC)/$(COLUMNS)/
	@cp $(REPORT)/$(VELOCITY)/$(INC)/$(COLUMNS)/jsPerPage.vm $(BUILD)/$(REPORT)/$(VELOCITY)/$(INC)/$(COLUMNS)/
	@cp $(REPORT)/$(VELOCITY)/$(INC)/$(COLUMNS)/jsSyncInHead.vm $(BUILD)/$(REPORT)/$(VELOCITY)/$(INC)/$(COLUMNS)/
	@cp $(REPORT)/$(VELOCITY)/$(INC)/$(COLUMNS)/jsWeightPerPage.vm $(BUILD)/$(REPORT)/$(VELOCITY)/$(INC)/$(COLUMNS)/
	@cp $(REPORT)/$(VELOCITY)/$(INC)/$(COLUMNS)/maxImageWeight.vm $(BUILD)/$(REPORT)/$(VELOCITY)/$(INC)/$(COLUMNS)/
	@cp $(REPORT)/$(VELOCITY)/$(INC)/$(COLUMNS)/pageWeight.vm $(BUILD)/$(REPORT)/$(VELOCITY)/$(INC)/$(COLUMNS)/
	@cp $(REPORT)/$(VELOCITY)/$(INC)/$(COLUMNS)/requests.vm $(BUILD)/$(REPORT)/$(VELOCITY)/$(INC)/$(COLUMNS)/
	@cp $(REPORT)/$(VELOCITY)/$(INC)/$(COLUMNS)/requestsWithoutExpires.vm $(BUILD)/$(REPORT)/$(VELOCITY)/$(INC)/$(COLUMNS)/
	@cp $(REPORT)/$(VELOCITY)/$(INC)/$(COLUMNS)/ruleScore.vm $(BUILD)/$(REPORT)/$(VELOCITY)/$(INC)/$(COLUMNS)/
	@cp $(REPORT)/$(VELOCITY)/$(INC)/$(COLUMNS)/spof.vm $(BUILD)/$(REPORT)/$(VELOCITY)/$(INC)/$(COLUMNS)/
	@cp $(REPORT)/$(VELOCITY)/$(INC)/$(COLUMNS)/genericTimeMetrics.vm $(BUILD)/$(REPORT)/$(VELOCITY)/$(INC)/$(COLUMNS)/
	@cp $(REPORT)/$(VELOCITY)/$(INC)/$(COLUMNS)/url.vm $(BUILD)/$(REPORT)/$(VELOCITY)/$(INC)/$(COLUMNS)/
	@cp $(REPORT)/$(VELOCITY)/$(INC)/$(COLUMNS)/ruleScore-html-wrapper.vm $(BUILD)/$(REPORT)/$(VELOCITY)/$(INC)/$(COLUMNS)/
	@cp $(REPORT)/$(VELOCITY)/$(INC)/$(COLUMNS)/spof-html-wrapper.vm $(BUILD)/$(REPORT)/$(VELOCITY)/$(INC)/$(COLUMNS)/
	@cp $(REPORT)/$(VELOCITY)/$(INC)/$(COLUMNS)/jsSyncInHead-html-wrapper.vm $(BUILD)/$(REPORT)/$(VELOCITY)/$(INC)/$(COLUMNS)/
	@cp $(REPORT)/$(VELOCITY)/$(INC)/$(COLUMNS)/url-html-wrapper.vm $(BUILD)/$(REPORT)/$(VELOCITY)/$(INC)/$(COLUMNS)/
	@cp $(REPORT)/$(VELOCITY)/$(INC)/$(COLUMN-HEADERS)/browserScaledImages.vm $(BUILD)/$(REPORT)/$(VELOCITY)/$(INC)/$(COLUMN-HEADERS)/
	@cp $(REPORT)/$(VELOCITY)/$(INC)/$(COLUMN-HEADERS)/criticalPathScore.vm $(BUILD)/$(REPORT)/$(VELOCITY)/$(INC)/$(COLUMN-HEADERS)/
	@cp $(REPORT)/$(VELOCITY)/$(INC)/$(COLUMN-HEADERS)/cssImagesPerPage.vm $(BUILD)/$(REPORT)/$(VELOCITY)/$(INC)/$(COLUMN-HEADERS)/
	@cp $(REPORT)/$(VELOCITY)/$(INC)/$(COLUMN-HEADERS)/cssPerPage.vm $(BUILD)/$(REPORT)/$(VELOCITY)/$(INC)/$(COLUMN-HEADERS)/
	@cp $(REPORT)/$(VELOCITY)/$(INC)/$(COLUMN-HEADERS)/cssWeightPerPage.vm $(BUILD)/$(REPORT)/$(VELOCITY)/$(INC)/$(COLUMN-HEADERS)/
	@cp $(REPORT)/$(VELOCITY)/$(INC)/$(COLUMN-HEADERS)/docWeight.vm $(BUILD)/$(REPORT)/$(VELOCITY)/$(INC)/$(COLUMN-HEADERS)/
	@cp $(REPORT)/$(VELOCITY)/$(INC)/$(COLUMN-HEADERS)/domainsPerPage.vm $(BUILD)/$(REPORT)/$(VELOCITY)/$(INC)/$(COLUMN-HEADERS)/
	@cp $(REPORT)/$(VELOCITY)/$(INC)/$(COLUMN-HEADERS)/fontsPerPage.vm $(BUILD)/$(REPORT)/$(VELOCITY)/$(INC)/$(COLUMN-HEADERS)/
	@cp $(REPORT)/$(VELOCITY)/$(INC)/$(COLUMN-HEADERS)/imageWeightPerPage.vm $(BUILD)/$(REPORT)/$(VELOCITY)/$(INC)/$(COLUMN-HEADERS)/
	@cp $(REPORT)/$(VELOCITY)/$(INC)/$(COLUMN-HEADERS)/imagesPerPage.vm $(BUILD)/$(REPORT)/$(VELOCITY)/$(INC)/$(COLUMN-HEADERS)/
	@cp $(REPORT)/$(VELOCITY)/$(INC)/$(COLUMN-HEADERS)/jsPerPage.vm $(BUILD)/$(REPORT)/$(VELOCITY)/$(INC)/$(COLUMN-HEADERS)/
	@cp $(REPORT)/$(VELOCITY)/$(INC)/$(COLUMN-HEADERS)/jsSyncInHead.vm $(BUILD)/$(REPORT)/$(VELOCITY)/$(INC)/$(COLUMN-HEADERS)/
	@cp $(REPORT)/$(VELOCITY)/$(INC)/$(COLUMN-HEADERS)/jsWeightPerPage.vm $(BUILD)/$(REPORT)/$(VELOCITY)/$(INC)/$(COLUMN-HEADERS)/
	@cp $(REPORT)/$(VELOCITY)/$(INC)/$(COLUMN-HEADERS)/maxImageWeight.vm $(BUILD)/$(REPORT)/$(VELOCITY)/$(INC)/$(COLUMN-HEADERS)/
	@cp $(REPORT)/$(VELOCITY)/$(INC)/$(COLUMN-HEADERS)/pageWeight.vm $(BUILD)/$(REPORT)/$(VELOCITY)/$(INC)/$(COLUMN-HEADERS)/
	@cp $(REPORT)/$(VELOCITY)/$(INC)/$(COLUMN-HEADERS)/requests.vm $(BUILD)/$(REPORT)/$(VELOCITY)/$(INC)/$(COLUMN-HEADERS)/
	@cp $(REPORT)/$(VELOCITY)/$(INC)/$(COLUMN-HEADERS)/requestsWithoutExpires.vm $(BUILD)/$(REPORT)/$(VELOCITY)/$(INC)/$(COLUMN-HEADERS)/
	@cp $(REPORT)/$(VELOCITY)/$(INC)/$(COLUMN-HEADERS)/ruleScore.vm $(BUILD)/$(REPORT)/$(VELOCITY)/$(INC)/$(COLUMN-HEADERS)/
	@cp $(REPORT)/$(VELOCITY)/$(INC)/$(COLUMN-HEADERS)/spof.vm $(BUILD)/$(REPORT)/$(VELOCITY)/$(INC)/$(COLUMN-HEADERS)/
	@cp $(REPORT)/$(VELOCITY)/$(INC)/$(COLUMN-HEADERS)/genericTimeMetrics.vm $(BUILD)/$(REPORT)/$(VELOCITY)/$(INC)/$(COLUMN-HEADERS)/
	@cp $(REPORT)/$(VELOCITY)/$(INC)/$(COLUMN-HEADERS)/url.vm $(BUILD)/$(REPORT)/$(VELOCITY)/$(INC)/$(COLUMN-HEADERS)/
package:
	@mv build sitespeed.io-$(SITESPEED_IO_VERSION)
	@tar -cvzf sitespeed.io-$(SITESPEED_IO_VERSION).tar.gz sitespeed.io-$(SITESPEED_IO_VERSION)/
	@echo "finished!"