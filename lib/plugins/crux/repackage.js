export function repackage(cruxResult) {
  const result = {};
  if (cruxResult.record.metrics.first_contentful_paint) {
    result.FIRST_CONTENTFUL_PAINT_MS = {
      p75: cruxResult.record.metrics.first_contentful_paint.percentiles.p75,
      fast: cruxResult.record.metrics.first_contentful_paint.histogram[0]
        .density,
      moderate:
        cruxResult.record.metrics.first_contentful_paint.histogram[1].density,
      slow: cruxResult.record.metrics.first_contentful_paint.histogram[2]
        .density
    };
  }

  if (cruxResult.record.metrics.cumulative_layout_shift) {
    result.CUMULATIVE_LAYOUT_SHIFT_SCORE = {
      p75: cruxResult.record.metrics.cumulative_layout_shift.percentiles.p75,
      fast: cruxResult.record.metrics.cumulative_layout_shift.histogram[0]
        .density,
      moderate:
        cruxResult.record.metrics.cumulative_layout_shift.histogram[1].density,
      slow: cruxResult.record.metrics.cumulative_layout_shift.histogram[2]
        .density
    };
  }

  if (cruxResult.record.metrics.largest_contentful_paint) {
    result.LARGEST_CONTENTFUL_PAINT_MS = {
      p75: cruxResult.record.metrics.largest_contentful_paint.percentiles.p75,
      fast: cruxResult.record.metrics.largest_contentful_paint.histogram[0]
        .density,
      moderate:
        cruxResult.record.metrics.largest_contentful_paint.histogram[1].density,
      slow: cruxResult.record.metrics.largest_contentful_paint.histogram[2]
        .density
    };
  }

  if (cruxResult.record.metrics.interaction_to_next_paint) {
    result.INTERACTION_TO_NEXT_PAINT_MS = {
      p75: cruxResult.record.metrics.interaction_to_next_paint.percentiles.p75,
      fast: cruxResult.record.metrics.interaction_to_next_paint.histogram[0]
        .density,
      moderate:
        cruxResult.record.metrics.interaction_to_next_paint.histogram[1]
          .density,
      slow: cruxResult.record.metrics.interaction_to_next_paint.histogram[2]
        .density
    };
  }

  if (cruxResult.record.metrics.experimental_time_to_first_byte) {
    result.TIME_TO_FIRST_BYTE_MS = {
      p75: cruxResult.record.metrics.experimental_time_to_first_byte.percentiles
        .p75,
      fast: cruxResult.record.metrics.experimental_time_to_first_byte
        .histogram[0].density,
      moderate:
        cruxResult.record.metrics.experimental_time_to_first_byte.histogram[1]
          .density,
      slow: cruxResult.record.metrics.experimental_time_to_first_byte
        .histogram[2].density
    };
  }

  if (cruxResult.record.metrics.round_trip_time) {
    result.ROUND_TRIP_TIME_MS = {
      p75: cruxResult.record.metrics.round_trip_time.percentiles.p75,
      low: cruxResult.record.metrics.round_trip_time.histogram[0].density,
      medium: cruxResult.record.metrics.round_trip_time.histogram[1].density,
      high: cruxResult.record.metrics.round_trip_time.histogram[2].density
    };
  }

  if (
    cruxResult.record.metrics
      .largest_contentful_paint_image_resource_load_duration
  ) {
    result.LCP_IMAGE_RESOURCE_LOAD_DURATION_MS = {
      p75: cruxResult.record.metrics
        .largest_contentful_paint_image_resource_load_duration.percentiles.p75
    };
  }

  if (
    cruxResult.record.metrics.largest_contentful_paint_image_resource_load_delay
  ) {
    result.LCP_IMAGE_RESOURCE_LOAD_DELAY_MS = {
      p75: cruxResult.record.metrics
        .largest_contentful_paint_image_resource_load_delay.percentiles.p75
    };
  }

  if (
    cruxResult.record.metrics
      .largest_contentful_paint_image_element_render_delay
  ) {
    result.LCP_IMAGE_ELEMENT_RENDER_DELAY_MS = {
      p75: cruxResult.record.metrics
        .largest_contentful_paint_image_element_render_delay.percentiles.p75
    };
  }

  if (
    cruxResult.record.metrics.largest_contentful_paint_image_time_to_first_byte
  ) {
    result.LCP_IMAGE_TTFB_MS = {
      p75: cruxResult.record.metrics
        .largest_contentful_paint_image_time_to_first_byte.percentiles.p75
    };
  }

  if (
    cruxResult.record.metrics.form_factors &&
    cruxResult.record.metrics.form_factors.fractions
  ) {
    result.FORM_FACTORS_FRACTIONS = {
      desktop: cruxResult.record.metrics.form_factors.fractions.desktop,
      phone: cruxResult.record.metrics.form_factors.fractions.phone,
      tablet: cruxResult.record.metrics.form_factors.fractions.tablet
    };
  }

  if (
    cruxResult.record.metrics.largest_contentful_paint_resource_type &&
    cruxResult.record.metrics.largest_contentful_paint_resource_type.fractions
  ) {
    result.LCP_RESOURCE_TYPES_FRACTIONS = {
      text: cruxResult.record.metrics.largest_contentful_paint_resource_type
        .fractions.text,
      image:
        cruxResult.record.metrics.largest_contentful_paint_resource_type
          .fractions.image
    };
  }

  if (
    cruxResult.record.metrics.navigation_types &&
    cruxResult.record.metrics.navigation_types.fractions
  ) {
    result.NAVIGATION_TYPES_FRACTIONS =
      cruxResult.record.metrics.navigation_types.fractions;
  }

  result.data = cruxResult;
  return result;
}
