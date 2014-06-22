
      <h2 id="wpt">WebPageTest</h2>
      <p>{{{wptData.response.data.from}}}</p>

      <p><a href="{{wptData.response.data.summary}}">WPT summary</a></p>
    </p>

    <p>
      <h3>Waterfall first view</h3>

      <img src="{{getWPTWaterFall wptData.response.data.run 'firstView'}}"/>
    </p>
    <p><!--TODO check that we have repatedView -->
      <h3>Waterfall repeated view</h3>
      <img src="{{getWPTWaterFall wptData.response.data.run 'repeatView'}}"/>
    </p>
