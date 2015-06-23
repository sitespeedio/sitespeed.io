(function(w, d) {
	'use strict';
	var addInteraction = function($, $table) {

		if(typeof $ === 'undefined' || !$table.find('.inside').length)
			return waiting();

		var $tableParent = $table.parent(),
			$inside = $table.find('.inside'),
			$nav = $inside.find('.nav'),
			$top = $table.find('.top'),
			$timeline = $top.find('.timeline'),
			$div = $inside.find('div'),
			$dt = $inside.find('dt'),
			tableWidth;

		tableWidth = getTableWidth($table, $div);

		addTitles($dt);


		$inside.addClass('hidden');

		//Hiding content from tabs, but first
		$div.css('width', tableWidth - 10).addClass('hidden').end()
			.find('div:first').removeClass('hidden');

		$nav.find('li:first-child').addClass('active');

		//Tabs clicks listener
		$nav.on('click', 'a', tabsListener);

		//Middle click to open url
		$top.find('td.url').find('div > a').click(middleClickListener);


		//Toggle request click
		$top.click(requestClickListener);

		totalStartTime($top);

		applyTooltip($top, $timeline, $tableParent);

		applyPopover($timeline, $tableParent, $('.sh-table').length > 1);



		stupidtable($table);



		$('.sh-loader').hide();

	},
	waiting = function() {
		if(typeof jQuery === 'undefined' || !jQuery('.inside').length)
			return setTimeout(waiting, 500);

		jQuery(function() {
			jQuery('.sh-table').each(function() {
				addInteraction(jQuery, jQuery(this));
			});
		});
	},
	getTableWidth = function($table, $div) {
		$div.hide();
		var width = $table.width();
		$div.show();

		return width;
	},
	//Adding title attribute to large descriptions
	addTitles = function($dt) {
		var i = 0,
			ilen = $dt.length,
			_$dt, text;

		for(;i<ilen;i++) {
			_$dt = $dt.eq(i);
			text = _$dt.text();
			if(text.length > 18)
				_$dt.attr('title', text);
		}
	},
	applyTooltip = function($top, $timeline, $container) {
		var tooltipOpt = {
			placement:'right',
			trigger: 'hover',
			html:true,
			container:$container
		};

		$top.find('td.size')
			.add($timeline.find('span.domloaded, span.renderstarted'))
			.tooltip(tooltipOpt);

		tooltipOpt.placement = 'left';
		$top.find('td.status, td.type')
			.add($timeline.find('span.windowloaded'))
			.tooltip(tooltipOpt);
	},
	applyPopover = function($timeline, $container, topBottom) {
		var i = 0,
			ilen = $timeline.length;

		if(ilen > 15 || topBottom) {
			for(ilen=Math.floor($timeline.length/2);i<ilen;i++)
				$timeline.eq(i).data('placement', 'bottom');

			for(ilen=$timeline.length;i<ilen;i++)
				$timeline.eq(i).data('placement', 'top');
		}
		else {
			for(;i<ilen;i++)
				$timeline.eq(i).data('placement', 'bottom');
		}

		$timeline.popover({
			html:true,
			trigger:'hover',
			container:$container
		});
	},
	tabsListener = function() {
		var $this = jQuery(this),
			$inside = $this.parents('tr.inside'),
			$div = $inside.find('div');

		$inside.find('.active').removeClass('active');
		$this.parent().addClass('active');


		$div
			.addClass('hidden')
			.filter('.' + $this.attr('href').substr(1))
			.removeClass('hidden');


		return false;
	},
	middleClickListener = function(evt) {
		if(evt.which === 2)
			evt.stopPropagation();
		else {
			jQuery(this).parents('tr.top').click();
			return false;
		}
	},
	requestClickListener = function() {
		var $this = jQuery(this),
			$i = $this.find('i'),
			classname = $i.get(0).className,
			toggleClass = $i.data('toggle-sign'),
			$next = jQuery('#inside-' + $this.attr('id').substr(4));


		if($this.hasClass('opened')) {
			$this.removeClass('opened');
			$next.addClass('hidden');
		}
		else {

			if($this.next() !== $next)
				$this.after($next);

			$this.addClass('opened');
			$next.removeClass('hidden');
		}
		$i.get(0).className = toggleClass;
		$i.data('toggle-sign', classname);
		return false;
	},
	totalStartTime = function($row) {
		var i = 0,
			ilen = $row.length,
			spacePct, widthPct,
			$top, $bars, $startTime, $space,
			getWidth = function() {
				return parseFloat(jQuery(this).attr('style').replace('width:', ''));
			},
			sum = function(v1, v2) {
				return v1 + v2;
			};

		for(;i<ilen;i++) {
			$top = $row.eq(i);
			$bars = $top.find('div.progress-bar');
			$startTime = $top.find('span.totalTime');

			$space = $top.find('div.progress-bar-space');
			spacePct = parseFloat($space.attr('style').replace('width:', ''));

			widthPct = $bars.map(getWidth).toArray().reduce(sum);


			if(spacePct > 80 || (widthPct > 80 && spacePct > 20))
				$startTime.css('right', (100.5 - spacePct) + '%');
			else if(widthPct > 80)
				$startTime.css({left:'5px', fontWeight:'bold'});
			else
				$startTime.css('left', (widthPct + 0.5) + '%');

		}

	},
	stupidtable = function($table) {
		if($table.stupidtable) {
			$table.stupidtable({
				url:function(a, b) {
					a = a.split('\n')[5].replace(/^\s*/g, '').split('?')[0].split('#')[0];
					b = b.split('\n')[5].replace(/^\s*/g, '').split('?')[0].split('#')[0];

					if(a < b)
						return -1;
					else if(a > b)
						return 1;
					else
						return 0;
				},
				timeline:function(a, b) {

					a = parseInt(a.split('\n')[3].replace(/^\s*/g, ''),10);
					b = parseInt(b.split('\n')[3].replace(/^\s*/g, ''),10);

					return b - a;
				}
			});
			$table.bind('beforetablesort', function() {
				jQuery('tr.top.opened').click();
				jQuery('.sh-loader').show();
			});
			$table.bind('aftertablesort', function() {
				jQuery('.sh-loader').hide();
			});
		}
	};
	if(!d.getElementById('harParser')) {
		var div = d.createElement('div');
		div.className = 'sh-loader';
		d.body.appendChild(div);

	}
	w.addInteraction = addInteraction;

	$('.sh-loader').show();
	$('.sh-container').hide();

	$( window ).load(function() {
		$('.sh-loader').hide();
		$('.sh-container').show();
		jQuery(function() {
			jQuery('.sh-table').each(function() {
				addInteraction(jQuery, jQuery(this));
			});
		});
	});
})(window, document);
