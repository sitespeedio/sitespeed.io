'use strict';

module.exports = {
  repackage(cruxResult) {
    const result = {
      FIRST_CONTENTFUL_PAINT_MS: {
        p75: cruxResult.record.metrics.first_contentful_paint.percentiles.p75,
        fast:
          cruxResult.record.metrics.first_contentful_paint.histogram[0].density,
        moderate:
          cruxResult.record.metrics.first_contentful_paint.histogram[1].density,
        slow:
          cruxResult.record.metrics.first_contentful_paint.histogram[2].density
      },
      FIRST_INPUT_DELAY_MS: {
        p75: cruxResult.record.metrics.first_input_delay.percentiles.p75,
        fast: cruxResult.record.metrics.first_input_delay.histogram[0].density,
        moderate:
          cruxResult.record.metrics.first_input_delay.histogram[1].density,
        slow: cruxResult.record.metrics.first_input_delay.histogram[2].density
      },
      CUMULATIVE_LAYOUT_SHIFT_SCORE: {
        p75: cruxResult.record.metrics.cumulative_layout_shift.percentiles.p75,
        fast:
          cruxResult.record.metrics.cumulative_layout_shift.histogram[0]
            .density,
        moderate:
          cruxResult.record.metrics.cumulative_layout_shift.histogram[1]
            .density,
        slow:
          cruxResult.record.metrics.cumulative_layout_shift.histogram[2].density
      },
      LARGEST_CONTENTFUL_PAINT_MS: {
        p75: cruxResult.record.metrics.largest_contentful_paint.percentiles.p75,
        fast:
          cruxResult.record.metrics.largest_contentful_paint.histogram[0]
            .density,
        moderate:
          cruxResult.record.metrics.largest_contentful_paint.histogram[1]
            .density,
        slow:
          cruxResult.record.metrics.largest_contentful_paint.histogram[2]
            .density
      }
    };

    result.data = cruxResult;
    return result;
  }
};
