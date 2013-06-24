BUILD := build
DEP := dependencies
REPORT := report
CSS := css
IMG := img
JS := js
PROPERTIES := properties
VELOCITY := velocity
XSLT := xslt

clean:
	@echo "Clean the package"
	@rm -fR $(BUILD)
	@echo "done"

package: 
	@echo "Packaging sitespeed"
	@if [ ! -d $(BUILD) ]; then mkdir -p $(BUILD); fi
	@if [ ! -d $(BUILD)/$(DEP) ]; then mkdir -p $(BUILD)/$(DEP); fi
	@if [ ! -d $(BUILD)/$(REPORT) ]; then mkdir -p $(BUILD)/$(REPORT); fi
	@if [ ! -d $(BUILD)/$(REPORT)/$(CSS) ]; then mkdir -p $(BUILD)/$(REPORT)/$(CSS); fi
	@if [ ! -d $(BUILD)/$(REPORT)/$(IMG) ]; then mkdir -p $(BUILD)/$(REPORT)/$(IMG); fi
	@if [ ! -d $(BUILD)/$(REPORT)/$(JS) ]; then mkdir -p $(BUILD)/$(REPORT)/$(JS); fi
	@if [ ! -d $(BUILD)/$(REPORT)/$(PROPERTIES) ]; then mkdir -p $(BUILD)/$(REPORT)/$(PROPERTIES); fi
	@if [ ! -d $(BUILD)/$(REPORT)/$(VELOCITY) ]; then mkdir -p $(BUILD)/$(REPORT)/$(VELOCITY); fi
	@if [ ! -d $(BUILD)/$(REPORT)/$(VELOCITY)/macros/pages ]; then mkdir -p $(BUILD)/$(REPORT)/$(VELOCITY)/macros/pages; fi	
	@if [ ! -d $(BUILD)/$(REPORT)/$(XSLT) ]; then mkdir -p $(BUILD)/$(REPORT)/$(XSLT); fi

	@cp sitespeed.io sitespeed-junit.io CHANGELOG LICENSE $(BUILD)/
	@cp $(DEP)/LICENSE.txt $(BUILD)/$(DEP)/
	@cp $(DEP)/crawler-1.5.3-full.jar $(BUILD)/$(DEP)/
	@cp $(DEP)/crawler.properties $(BUILD)/$(DEP)/
	@cp $(DEP)/xml-velocity-1.7-full.jar $(BUILD)/$(DEP)/	
	@cp $(DEP)/rasterize.js $(BUILD)/$(DEP)/
	@cp $(DEP)/htmlcompressor-1.5.3.jar $(BUILD)/$(DEP)/
	@cp $(DEP)/yuicompressor-2.4.6.jar $(BUILD)/$(DEP)/
	@cp $(DEP)/yslow-3.1.5-sitespeed.js $(BUILD)/$(DEP)/
	@cp $(REPORT)/$(CSS)/bootstrap.min.css $(BUILD)/$(REPORT)/$(CSS)/
	@cp $(REPORT)/$(IMG)/apple-touch-icon-114-precomposed.png $(BUILD)/$(REPORT)/$(IMG)/
	@cp $(REPORT)/$(IMG)/apple-touch-icon-144-precomposed.png $(BUILD)/$(REPORT)/$(IMG)/
	@cp $(REPORT)/$(IMG)/apple-touch-icon-72-precomposed.png $(BUILD)/$(REPORT)/$(IMG)/	
	@cp $(REPORT)/$(IMG)/favicon.ico $(BUILD)/$(REPORT)/$(IMG)/
	@cp $(REPORT)/$(IMG)/glyphicons-halflings.png $(BUILD)/$(REPORT)/$(IMG)/
	@cp $(REPORT)/$(IMG)/sitespeed-logo.gif $(BUILD)/$(REPORT)/$(IMG)/
	@cp $(REPORT)/$(JS)/bootstrap.min.js $(BUILD)/$(REPORT)/$(JS)/
	@cp $(REPORT)/$(JS)/jquery-1.8.3.min.js $(BUILD)/$(REPORT)/$(JS)/
	@cp $(REPORT)/$(JS)/stupidtable.min.js $(BUILD)/$(REPORT)/$(JS)/
	@cp $(REPORT)/$(PROPERTIES)/page.properties $(BUILD)/$(REPORT)/$(PROPERTIES)/
	@cp $(REPORT)/$(PROPERTIES)/pages.properties $(BUILD)/$(REPORT)/$(PROPERTIES)/
	@cp $(REPORT)/$(PROPERTIES)/summary.properties $(BUILD)/$(REPORT)/$(PROPERTIES)/
	@cp $(REPORT)/$(PROPERTIES)/summary.details.properties $(BUILD)/$(REPORT)/$(PROPERTIES)/	
	@cp $(REPORT)/$(PROPERTIES)/rules.properties $(BUILD)/$(REPORT)/$(PROPERTIES)/
	@cp $(REPORT)/$(PROPERTIES)/assets.properties $(BUILD)/$(REPORT)/$(PROPERTIES)/
	@cp $(REPORT)/$(PROPERTIES)/errorurls.properties $(BUILD)/$(REPORT)/$(PROPERTIES)/
	@cp $(REPORT)/$(VELOCITY)/footer.vm $(BUILD)/$(REPORT)/$(VELOCITY)/
	@cp $(REPORT)/$(VELOCITY)/macros/summary.macros.vm $(BUILD)/$(REPORT)/$(VELOCITY)/macros/
	@cp $(REPORT)/$(VELOCITY)/macros/date.macros.vm $(BUILD)/$(REPORT)/$(VELOCITY)/macros/
	@cp $(REPORT)/$(VELOCITY)/pages.vm $(BUILD)/$(REPORT)/$(VELOCITY)/
	@cp $(REPORT)/$(VELOCITY)/pages-csv.vm $(BUILD)/$(REPORT)/$(VELOCITY)/
	@cp $(REPORT)/$(VELOCITY)/summary.vm $(BUILD)/$(REPORT)/$(VELOCITY)/
	@cp $(REPORT)/$(VELOCITY)/header.vm $(BUILD)/$(REPORT)/$(VELOCITY)/
	@cp $(REPORT)/$(VELOCITY)/page.vm $(BUILD)/$(REPORT)/$(VELOCITY)/
	@cp $(REPORT)/$(VELOCITY)/page.logic.vm $(BUILD)/$(REPORT)/$(VELOCITY)/
	@cp $(REPORT)/$(VELOCITY)/assets.logic.vm $(BUILD)/$(REPORT)/$(VELOCITY)/
	@cp $(REPORT)/$(VELOCITY)/assets.vm $(BUILD)/$(REPORT)/$(VELOCITY)/
	@cp $(REPORT)/$(VELOCITY)/rules.vm $(BUILD)/$(REPORT)/$(VELOCITY)/
	@cp $(REPORT)/$(VELOCITY)/errorurls.vm $(BUILD)/$(REPORT)/$(VELOCITY)/
	@cp $(REPORT)/$(VELOCITY)/summary.logic.vm $(BUILD)/$(REPORT)/$(VELOCITY)/
	@cp $(REPORT)/$(VELOCITY)/summary.xml.vm $(BUILD)/$(REPORT)/$(VELOCITY)/
	@cp $(REPORT)/$(VELOCITY)/summary.details.vm $(BUILD)/$(REPORT)/$(VELOCITY)/
	@cp $(REPORT)/$(VELOCITY)/macros/pages/domains.vm $(BUILD)/$(REPORT)/$(VELOCITY)/macros/pages/
	@cp $(REPORT)/$(VELOCITY)/macros/pages/kbps.vm $(BUILD)/$(REPORT)/$(VELOCITY)/macros/pages/
	@cp $(REPORT)/$(VELOCITY)/macros/pages.macros.vm $(BUILD)/$(REPORT)/$(VELOCITY)/macros/
	@cp $(REPORT)/$(VELOCITY)/macros/pages/pagesize.vm $(BUILD)/$(REPORT)/$(VELOCITY)/macros/pages/        
	@cp $(REPORT)/$(VELOCITY)/macros/pages/url.vm $(BUILD)/$(REPORT)/$(VELOCITY)/macros/pages/
	@cp $(REPORT)/$(VELOCITY)/macros/pages/spof.vm $(BUILD)/$(REPORT)/$(VELOCITY)/macros/pages/
	@cp $(REPORT)/$(VELOCITY)/macros/pages/syncjs.vm $(BUILD)/$(REPORT)/$(VELOCITY)/macros/pages/
	@cp $(REPORT)/$(VELOCITY)/macros/pages/ttfb.vm $(BUILD)/$(REPORT)/$(VELOCITY)/macros/pages/
	@cp $(REPORT)/$(VELOCITY)/macros/pages/maximagesize.vm $(BUILD)/$(REPORT)/$(VELOCITY)/macros/pages/
	@cp $(REPORT)/$(VELOCITY)/macros/pages/totalimagesize.vm $(BUILD)/$(REPORT)/$(VELOCITY)/macros/pages/
	@cp $(REPORT)/$(VELOCITY)/macros/pages/totaljssize.vm $(BUILD)/$(REPORT)/$(VELOCITY)/macros/pages/
	@cp $(REPORT)/$(VELOCITY)/macros/pages/totalcsssize.vm $(BUILD)/$(REPORT)/$(VELOCITY)/macros/pages/
	@cp $(REPORT)/$(VELOCITY)/macros/pages/browserscaledimages.vm $(BUILD)/$(REPORT)/$(VELOCITY)/macros/pages/
	@cp $(REPORT)/$(XSLT)/junit.xsl $(BUILD)/$(REPORT)/$(XSLT)/
	@echo "finished!"