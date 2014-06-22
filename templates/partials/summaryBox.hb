<div class="alert alert-{{getRuleColor id stats.median}}">
  {{title}}
  <div>
    <!-- TODO implement To get green you need to have ...-->
		<a href="#" class="alert-{{getRuleColor id stats.median}} large" rel="popover" data-html="true" data-trigger="hover" title="{{title}}" data-content="{{desc}}">
      {{getHumanReadable this stats.median true}} </a> ({{getHumanReadable this stats.p90 true}})
  </div>
</div>
