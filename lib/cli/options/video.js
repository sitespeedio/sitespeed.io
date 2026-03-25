export function addOptions(yargs) {
  yargs
    .option('browsertime.visualMetrics', {
      alias: ['visualMetrics', 'speedIndex'],
      type: 'boolean',
      describe:
        'Calculate Visual Metrics like SpeedIndex, First Visual Change and Last Visual Change. Requires FFMpeg and Python dependencies',
      group: 'Browser'
    })
    .option('browsertime.visualMetricsPerceptual', {
      alias: ['visualMetricsPerceptual'],
      type: 'boolean',
      describe: 'Collect Perceptual Speed Index when you run --visualMetrics.',
      group: 'Browser'
    })
    .option('browsertime.visualMetricsContentful', {
      alias: ['visualMetricsContentful'],
      type: 'boolean',
      describe: 'Collect Contentful Speed Index when you run --visualMetrics.',
      group: 'Browser'
    })
    .option('browsertime.visualElements', {
      type: 'boolean',
      alias: ['visualElements'],
      describe:
        'Collect Visual Metrics from elements. Works only with --visualMetrics turned on. By default you will get visual metrics from the largest image within the view port and the largest h1. You can also configure to pickup your own defined elements with --scriptInput.visualElements',
      group: 'Browser'
    })
    .option('browsertime.scriptInput.visualElements', {
      alias: ['scriptInput.visualElements'],
      describe:
        'Include specific elements in visual elements. Give the element a name and select it with document.body.querySelector. Use like this: --scriptInput.visualElements name:domSelector . If you want to measure multiple elements, use a configuration file with an array for the input. Visual Metrics will use these elements and calculate when they are visible and fully rendered.',
      group: 'Browser'
    })
    .option('browsertime.video', {
      alias: 'video',
      type: 'boolean',
      describe:
        'Record a video and store the video. Set it to false to remove the video that is created by turning on visualMetrics. To remove fully turn off video recordings, make sure to set video and visualMetrics to false. Requires FFMpeg to be installed.',
      group: 'Browser'
    })
    .option('browsertime.videoParams.framerate', {
      alias: ['videoParams.framerate', 'fps'],
      default: 30,
      describe: 'Frames per second in the video',
      group: 'Browser'
    })
    .option('browsertime.videoParams.crf', {
      alias: 'videoParams.crf',
      default: 23,
      describe:
        'Constant rate factor for the end result video, see https://trac.ffmpeg.org/wiki/Encode/H.264#crf',
      group: 'Browser'
    })
    .option('browsertime.videoParams.addTimer', {
      alias: 'videoParams.addTimer',
      default: true,
      type: 'boolean',
      describe: 'Add timer and metrics to the video',
      group: 'Browser'
    })
    .option('browsertime.videoParams.convert', {
      alias: 'videoParams.convert',
      type: 'boolean',
      default: true,
      describe:
        'Convert the original video to a viewable format (for most video players). Turn that off to make a faster run.',
      group: 'Browser'
    })
    .option('browsertime.videoParams.keepOriginalVideo', {
      alias: 'videoParams.keepOriginalVideo',
      type: 'boolean',
      default: false,
      describe:
        'Keep the original video. Use it when you have a Visual Metrics bug and want to create an issue at GitHub. Supply the original video in the issue and we can reproduce your issue.',
      group: 'video'
    })
    .option('browsertime.cpu', {
      alias: 'cpu',
      type: 'boolean',
      describe:
        'Easy way to enable both chrome.timeline and CPU long tasks for Chrome and geckoProfile for Firefox',
      group: 'Browser'
    })
    .option('browsertime.enableProfileRun', {
      alias: 'enableProfileRun',
      type: 'boolean',
      describe:
        'Make one extra run that collects the profiling trace log (no other metrics is collected). For Chrome it will collect the timeline trace, for Firefox it will get the Geckoprofiler trace. This means you do not need to get the trace for all runs and can skip the overhead it produces. You should not run this together with --cpu since that will get a trace for every iteration.'
    })
    .option('browsertime.enableVideoRun', {
      alias: 'enableVideoRun',
      type: 'boolean',
      describe:
        'Make one extra run that collects video and visual metrics. This means you can do your runs with --visualMetrics true --video false --enableVideoRun true to collect visual metrics from all runs and save a video from the profile/video run. If you run it together with --enableProfileRun it will also collect profiling race.'
    })
    .option('browsertime.videoParams.filmstripFullSize', {
      alias: 'videoParams.filmstripFullSize',
      type: 'boolean',
      default: false,
      describe:
        'Keep original sized screenshots in the filmstrip. Will make the run take longer time',
      group: 'Filmstrip'
    })
    .option('browsertime.videoParams.filmstripQuality', {
      alias: 'videoParams.filmstripQuality',
      default: 75,
      describe: 'The quality of the filmstrip screenshots. 0-100.',
      group: 'Filmstrip'
    })
    .option('browsertime.videoParams.createFilmstrip', {
      alias: 'videoParams.createFilmstrip',
      type: 'boolean',
      default: true,
      describe: 'Create filmstrip screenshots.',
      group: 'Filmstrip'
    })
    .option('browsertime.videoParams.thumbsize', {
      alias: 'videoParams.thumbsize',
      default: 400,
      describe:
        'The maximum size of the thumbnail in the filmstrip. Default is 400 pixels in either direction. If browsertime.videoParams.filmstripFullSize is used that setting overrides this.',
      group: 'Filmstrip'
    })
    .option('filmstrip.showAll', {
      type: 'boolean',
      default: false,
      describe:
        'Show all screenshots in the filmstrip, independent if they have changed or not.',
      group: 'Filmstrip'
    });
}
