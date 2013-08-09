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
COLUMNS := detailed.site/columns
COLUMN-HEADERS := detailed.site/column-headers
XSLT := xslt

clean:
	@echo "Clean the package"
	@rm -fR $(BUILD)
	@echo "done"

package: 
	@echo "Packaging sitespeed.io"
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
	@if [ ! -d $(BUILD)/$(REPORT)/$(VELOCITY)/$(MACROS) ]; then mkdir -p $(BUILD)/$(REPORT)/$(VELOCITY)/$(MACROS); fi	
	@if [ ! -d $(BUILD)/$(REPORT)/$(VELOCITY)/$(INC)/$(COLUMNS) ]; then mkdir -p $(BUILD)/$(REPORT)/$(VELOCITY)/$(INC)/$(COLUMNS); fi
	@if [ ! -d $(BUILD)/$(REPORT)/$(VELOCITY)/$(INC)/$(COLUMN-HEADERS) ]; then mkdir -p $(BUILD)/$(REPORT)/$(VELOCITY)/$(INC)/$(COLUMN-HEADERS); fi	
	@if [ ! -d $(BUILD)/$(REPORT)/$(XSLT) ]; then mkdir -p $(BUILD)/$(REPORT)/$(XSLT); fi

	@cp sitespeed.io sitespeed-junit.io sitespeed-sites.io CHANGELOG LICENSE $(BUILD)/
	@cp $(DEP)/LICENSE.txt $(BUILD)/$(DEP)/
	@cp $(DEP)/crawler-1.5.4-full.jar $(BUILD)/$(DEP)/
	@cp $(DEP)/crawler.properties $(BUILD)/$(DEP)/
	@cp $(DEP)/xml-velocity-1.8-SNAPSHOT-full.jar $(BUILD)/$(DEP)/	
	@cp $(DEP)/screenshot.js $(BUILD)/$(DEP)/
	@cp $(DEP)/htmlcompressor-1.5.3.jar $(BUILD)/$(DEP)/
	@cp $(DEP)/yuicompressor-2.4.6.jar $(BUILD)/$(DEP)/
	@cp $(DEP)/yslow-3.1.5-sitespeed.js $(BUILD)/$(DEP)/
	@cp $(REPORT)/$(CSS)/bootstrap.min.css $(BUILD)/$(REPORT)/$(CSS)/
	@cp $(REPORT)/$(CSS)/bootstrap-overrides.css $(BUILD)/$(REPORT)/$(CSS)/
	@cp $(REPORT)/$(CSS)/bootstrap-glyphicons.css $(BUILD)/$(REPORT)/$(CSS)/
	@cp $(REPORT)/$(IMG)/$(ICO)/sitespeed.io-114.png $(BUILD)/$(REPORT)/$(IMG)/$(ICO)/
	@cp $(REPORT)/$(IMG)/$(ICO)/sitespeed.io-144.png $(BUILD)/$(REPORT)/$(IMG)/$(ICO)/
	@cp $(REPORT)/$(IMG)/$(ICO)/sitespeed.io-72.png $(BUILD)/$(REPORT)/$(IMG)/$(ICO)/	
	@cp $(REPORT)/$(IMG)/$(ICO)/sitespeed.io.ico $(BUILD)/$(REPORT)/$(IMG)/$(ICO)/
	@cp $(REPORT)/$(IMG)/glyphicons-halflings.png $(BUILD)/$(REPORT)/$(IMG)/
	@cp $(REPORT)/$(IMG)/sitespeed-logo.png $(BUILD)/$(REPORT)/$(IMG)/
	@cp $(REPORT)/$(JS)/bootstrap.min.js $(BUILD)/$(REPORT)/$(JS)/
	@cp $(REPORT)/$(JS)/jquery-1.10.2.min.js $(BUILD)/$(REPORT)/$(JS)/
	@cp $(REPORT)/$(JS)/stupidtable.min.js $(BUILD)/$(REPORT)/$(JS)/
	@cp $(REPORT)/$(FONTS)/glyphiconshalflings-regular.eot $(BUILD)/$(REPORT)/$(FONTS)/
	@cp $(REPORT)/$(FONTS)/glyphiconshalflings-regular.otf $(BUILD)/$(REPORT)/$(FONTS)/
	@cp $(REPORT)/$(FONTS)/glyphiconshalflings-regular.svg $(BUILD)/$(REPORT)/$(FONTS)/
	@cp $(REPORT)/$(FONTS)/glyphiconshalflings-regular.ttf $(BUILD)/$(REPORT)/$(FONTS)/
	@cp $(REPORT)/$(FONTS)/glyphiconshalflings-regular.woff $(BUILD)/$(REPORT)/$(FONTS)/
	@cp $(REPORT)/$(PROPERTIES)/detailed.site.properties $(BUILD)/$(REPORT)/$(PROPERTIES)/
	@cp $(REPORT)/$(PROPERTIES)/full.page.properties $(BUILD)/$(REPORT)/$(PROPERTIES)/
	@cp $(REPORT)/$(PROPERTIES)/site.summary.properties $(BUILD)/$(REPORT)/$(PROPERTIES)/
	@cp $(REPORT)/$(PROPERTIES)/sites.summary.properties $(BUILD)/$(REPORT)/$(PROPERTIES)/
	@cp $(REPORT)/$(PROPERTIES)/summary.details.properties $(BUILD)/$(REPORT)/$(PROPERTIES)/	
	@cp $(REPORT)/$(PROPERTIES)/rules.properties $(BUILD)/$(REPORT)/$(PROPERTIES)/
	@cp $(REPORT)/$(PROPERTIES)/assets.properties $(BUILD)/$(REPORT)/$(PROPERTIES)/
	@cp $(REPORT)/$(PROPERTIES)/errorurls.properties $(BUILD)/$(REPORT)/$(PROPERTIES)/
	@cp $(REPORT)/$(PROPERTIES)/screenshots.properties $(BUILD)/$(REPORT)/$(PROPERTIES)/
	@cp $(REPORT)/$(VELOCITY)/footer.vm $(BUILD)/$(REPORT)/$(VELOCITY)/
	@cp $(REPORT)/$(VELOCITY)/$(MACROS)/site.summary.macros.vm $(BUILD)/$(REPORT)/$(VELOCITY)/$(MACROS)
	@cp $(REPORT)/$(VELOCITY)/$(MACROS)/date.macros.vm $(BUILD)/$(REPORT)/$(VELOCITY)/$(MACROS)
	@cp $(REPORT)/$(VELOCITY)/$(MACROS)/detailed.site.macros.vm $(BUILD)/$(REPORT)/$(VELOCITY)/$(MACROS)
	@cp $(REPORT)/$(VELOCITY)/detailed.site.csv.vm $(BUILD)/$(REPORT)/$(VELOCITY)/
	@cp $(REPORT)/$(VELOCITY)/detailed.site.summary.vm $(BUILD)/$(REPORT)/$(VELOCITY)/
	@cp $(REPORT)/$(VELOCITY)/site.summary.vm $(BUILD)/$(REPORT)/$(VELOCITY)/
	@cp $(REPORT)/$(VELOCITY)/header.vm $(BUILD)/$(REPORT)/$(VELOCITY)/
	@cp $(REPORT)/$(VELOCITY)/full.page.vm $(BUILD)/$(REPORT)/$(VELOCITY)/
	@cp $(REPORT)/$(VELOCITY)/full.page.logic.vm $(BUILD)/$(REPORT)/$(VELOCITY)/
	@cp $(REPORT)/$(VELOCITY)/assets.logic.vm $(BUILD)/$(REPORT)/$(VELOCITY)/
	@cp $(REPORT)/$(VELOCITY)/assets.vm $(BUILD)/$(REPORT)/$(VELOCITY)/
	@cp $(REPORT)/$(VELOCITY)/rules.vm $(BUILD)/$(REPORT)/$(VELOCITY)/
	@cp $(REPORT)/$(VELOCITY)/errorurls.vm $(BUILD)/$(REPORT)/$(VELOCITY)/
	@cp $(REPORT)/$(VELOCITY)/site.summary.logic.vm $(BUILD)/$(REPORT)/$(VELOCITY)/
	@cp $(REPORT)/$(VELOCITY)/site.summary.xml.vm $(BUILD)/$(REPORT)/$(VELOCITY)/
	@cp $(REPORT)/$(VELOCITY)/detailed.site.vm $(BUILD)/$(REPORT)/$(VELOCITY)/
	@cp $(REPORT)/$(VELOCITY)/screenshots.vm $(BUILD)/$(REPORT)/$(VELOCITY)/
	@cp $(REPORT)/$(VELOCITY)/sites.summary.vm $(BUILD)/$(REPORT)/$(VELOCITY)/
	@cp $(REPORT)/$(XSLT)/junit.xsl $(BUILD)/$(REPORT)/$(XSLT)/
	@cp $(REPORT)/$(VELOCITY)/$(INC)/$(COLUMNS)/browserscaledimg.vm $(BUILD)/$(REPORT)/$(VELOCITY)/$(INC)/$(COLUMNS)/
	@cp $(REPORT)/$(VELOCITY)/$(INC)/$(COLUMNS)/criticalpath.vm $(BUILD)/$(REPORT)/$(VELOCITY)/$(INC)/$(COLUMNS)/
	@cp $(REPORT)/$(VELOCITY)/$(INC)/$(COLUMNS)/css.vm $(BUILD)/$(REPORT)/$(VELOCITY)/$(INC)/$(COLUMNS)/
	@cp $(REPORT)/$(VELOCITY)/$(INC)/$(COLUMNS)/cssimg.vm $(BUILD)/$(REPORT)/$(VELOCITY)/$(INC)/$(COLUMNS)/
	@cp $(REPORT)/$(VELOCITY)/$(INC)/$(COLUMNS)/docsize.vm $(BUILD)/$(REPORT)/$(VELOCITY)/$(INC)/$(COLUMNS)/
	@cp $(REPORT)/$(VELOCITY)/$(INC)/$(COLUMNS)/domains.vm $(BUILD)/$(REPORT)/$(VELOCITY)/$(INC)/$(COLUMNS)/
	@cp $(REPORT)/$(VELOCITY)/$(INC)/$(COLUMNS)/font.vm $(BUILD)/$(REPORT)/$(VELOCITY)/$(INC)/$(COLUMNS)/
	@cp $(REPORT)/$(VELOCITY)/$(INC)/$(COLUMNS)/img.vm $(BUILD)/$(REPORT)/$(VELOCITY)/$(INC)/$(COLUMNS)/
	@cp $(REPORT)/$(VELOCITY)/$(INC)/$(COLUMNS)/js.vm $(BUILD)/$(REPORT)/$(VELOCITY)/$(INC)/$(COLUMNS)/
	@cp $(REPORT)/$(VELOCITY)/$(INC)/$(COLUMNS)/kbps.vm $(BUILD)/$(REPORT)/$(VELOCITY)/$(INC)/$(COLUMNS)/
	@cp $(REPORT)/$(VELOCITY)/$(INC)/$(COLUMNS)/loadtime.vm $(BUILD)/$(REPORT)/$(VELOCITY)/$(INC)/$(COLUMNS)/
	@cp $(REPORT)/$(VELOCITY)/$(INC)/$(COLUMNS)/maximgsize.vm $(BUILD)/$(REPORT)/$(VELOCITY)/$(INC)/$(COLUMNS)/
	@cp $(REPORT)/$(VELOCITY)/$(INC)/$(COLUMNS)/pagesize.vm $(BUILD)/$(REPORT)/$(VELOCITY)/$(INC)/$(COLUMNS)/
	@cp $(REPORT)/$(VELOCITY)/$(INC)/$(COLUMNS)/requests.vm $(BUILD)/$(REPORT)/$(VELOCITY)/$(INC)/$(COLUMNS)/
	@cp $(REPORT)/$(VELOCITY)/$(INC)/$(COLUMNS)/requestswithoutexpires.vm $(BUILD)/$(REPORT)/$(VELOCITY)/$(INC)/$(COLUMNS)/
	@cp $(REPORT)/$(VELOCITY)/$(INC)/$(COLUMNS)/score.vm $(BUILD)/$(REPORT)/$(VELOCITY)/$(INC)/$(COLUMNS)/
	@cp $(REPORT)/$(VELOCITY)/$(INC)/$(COLUMNS)/spof.vm $(BUILD)/$(REPORT)/$(VELOCITY)/$(INC)/$(COLUMNS)/
	@cp $(REPORT)/$(VELOCITY)/$(INC)/$(COLUMNS)/syncjs.vm $(BUILD)/$(REPORT)/$(VELOCITY)/$(INC)/$(COLUMNS)/
	@cp $(REPORT)/$(VELOCITY)/$(INC)/$(COLUMNS)/totalcsssize.vm $(BUILD)/$(REPORT)/$(VELOCITY)/$(INC)/$(COLUMNS)/
	@cp $(REPORT)/$(VELOCITY)/$(INC)/$(COLUMNS)/totalimgsize.vm $(BUILD)/$(REPORT)/$(VELOCITY)/$(INC)/$(COLUMNS)/
	@cp $(REPORT)/$(VELOCITY)/$(INC)/$(COLUMNS)/totaljssize.vm $(BUILD)/$(REPORT)/$(VELOCITY)/$(INC)/$(COLUMNS)/
	@cp $(REPORT)/$(VELOCITY)/$(INC)/$(COLUMNS)/ttfb.vm $(BUILD)/$(REPORT)/$(VELOCITY)/$(INC)/$(COLUMNS)/
	@cp $(REPORT)/$(VELOCITY)/$(INC)/$(COLUMNS)/url.vm $(BUILD)/$(REPORT)/$(VELOCITY)/$(INC)/$(COLUMNS)/
	@cp $(REPORT)/$(VELOCITY)/$(INC)/$(COLUMNS)/score-html-wrapper.vm $(BUILD)/$(REPORT)/$(VELOCITY)/$(INC)/$(COLUMNS)/
	@cp $(REPORT)/$(VELOCITY)/$(INC)/$(COLUMNS)/spof-html-wrapper.vm $(BUILD)/$(REPORT)/$(VELOCITY)/$(INC)/$(COLUMNS)/
	@cp $(REPORT)/$(VELOCITY)/$(INC)/$(COLUMNS)/syncjs-html-wrapper.vm $(BUILD)/$(REPORT)/$(VELOCITY)/$(INC)/$(COLUMNS)/
	@cp $(REPORT)/$(VELOCITY)/$(INC)/$(COLUMNS)/url-html-wrapper.vm $(BUILD)/$(REPORT)/$(VELOCITY)/$(INC)/$(COLUMNS)/
	@cp $(REPORT)/$(VELOCITY)/$(INC)/$(COLUMN-HEADERS)/browserscaledimg.vm $(BUILD)/$(REPORT)/$(VELOCITY)/$(INC)/$(COLUMN-HEADERS)/
	@cp $(REPORT)/$(VELOCITY)/$(INC)/$(COLUMN-HEADERS)/criticalpath.vm $(BUILD)/$(REPORT)/$(VELOCITY)/$(INC)/$(COLUMN-HEADERS)/
	@cp $(REPORT)/$(VELOCITY)/$(INC)/$(COLUMN-HEADERS)/css.vm $(BUILD)/$(REPORT)/$(VELOCITY)/$(INC)/$(COLUMN-HEADERS)/
	@cp $(REPORT)/$(VELOCITY)/$(INC)/$(COLUMN-HEADERS)/cssimg.vm $(BUILD)/$(REPORT)/$(VELOCITY)/$(INC)/$(COLUMN-HEADERS)/
	@cp $(REPORT)/$(VELOCITY)/$(INC)/$(COLUMN-HEADERS)/docsize.vm $(BUILD)/$(REPORT)/$(VELOCITY)/$(INC)/$(COLUMN-HEADERS)/
	@cp $(REPORT)/$(VELOCITY)/$(INC)/$(COLUMN-HEADERS)/domains.vm $(BUILD)/$(REPORT)/$(VELOCITY)/$(INC)/$(COLUMN-HEADERS)/
	@cp $(REPORT)/$(VELOCITY)/$(INC)/$(COLUMN-HEADERS)/font.vm $(BUILD)/$(REPORT)/$(VELOCITY)/$(INC)/$(COLUMN-HEADERS)/
	@cp $(REPORT)/$(VELOCITY)/$(INC)/$(COLUMN-HEADERS)/img.vm $(BUILD)/$(REPORT)/$(VELOCITY)/$(INC)/$(COLUMN-HEADERS)/
	@cp $(REPORT)/$(VELOCITY)/$(INC)/$(COLUMN-HEADERS)/js.vm $(BUILD)/$(REPORT)/$(VELOCITY)/$(INC)/$(COLUMN-HEADERS)/
	@cp $(REPORT)/$(VELOCITY)/$(INC)/$(COLUMN-HEADERS)/kbps.vm $(BUILD)/$(REPORT)/$(VELOCITY)/$(INC)/$(COLUMN-HEADERS)/
	@cp $(REPORT)/$(VELOCITY)/$(INC)/$(COLUMN-HEADERS)/loadtime.vm $(BUILD)/$(REPORT)/$(VELOCITY)/$(INC)/$(COLUMN-HEADERS)/
	@cp $(REPORT)/$(VELOCITY)/$(INC)/$(COLUMN-HEADERS)/maximgsize.vm $(BUILD)/$(REPORT)/$(VELOCITY)/$(INC)/$(COLUMN-HEADERS)/
	@cp $(REPORT)/$(VELOCITY)/$(INC)/$(COLUMN-HEADERS)/pagesize.vm $(BUILD)/$(REPORT)/$(VELOCITY)/$(INC)/$(COLUMN-HEADERS)/
	@cp $(REPORT)/$(VELOCITY)/$(INC)/$(COLUMN-HEADERS)/requests.vm $(BUILD)/$(REPORT)/$(VELOCITY)/$(INC)/$(COLUMN-HEADERS)/
	@cp $(REPORT)/$(VELOCITY)/$(INC)/$(COLUMN-HEADERS)/requestswithoutexpires.vm $(BUILD)/$(REPORT)/$(VELOCITY)/$(INC)/$(COLUMN-HEADERS)/
	@cp $(REPORT)/$(VELOCITY)/$(INC)/$(COLUMN-HEADERS)/score.vm $(BUILD)/$(REPORT)/$(VELOCITY)/$(INC)/$(COLUMN-HEADERS)/
	@cp $(REPORT)/$(VELOCITY)/$(INC)/$(COLUMN-HEADERS)/spof.vm $(BUILD)/$(REPORT)/$(VELOCITY)/$(INC)/$(COLUMN-HEADERS)/
	@cp $(REPORT)/$(VELOCITY)/$(INC)/$(COLUMN-HEADERS)/syncjs.vm $(BUILD)/$(REPORT)/$(VELOCITY)/$(INC)/$(COLUMN-HEADERS)/
	@cp $(REPORT)/$(VELOCITY)/$(INC)/$(COLUMN-HEADERS)/totalcsssize.vm $(BUILD)/$(REPORT)/$(VELOCITY)/$(INC)/$(COLUMN-HEADERS)/
	@cp $(REPORT)/$(VELOCITY)/$(INC)/$(COLUMN-HEADERS)/totalimgsize.vm $(BUILD)/$(REPORT)/$(VELOCITY)/$(INC)/$(COLUMN-HEADERS)/
	@cp $(REPORT)/$(VELOCITY)/$(INC)/$(COLUMN-HEADERS)/totaljssize.vm $(BUILD)/$(REPORT)/$(VELOCITY)/$(INC)/$(COLUMN-HEADERS)/
	@cp $(REPORT)/$(VELOCITY)/$(INC)/$(COLUMN-HEADERS)/ttfb.vm $(BUILD)/$(REPORT)/$(VELOCITY)/$(INC)/$(COLUMN-HEADERS)/
	@cp $(REPORT)/$(VELOCITY)/$(INC)/$(COLUMN-HEADERS)/url.vm $(BUILD)/$(REPORT)/$(VELOCITY)/$(INC)/$(COLUMN-HEADERS)/

	@echo "finished!"