export function addOptions(yargs) {
  yargs
    .option('compare.id', {
      type: 'string',
      describe:
        'The id of the test. Will be used to find the baseline test, that is using the id as a part of the name. If you do not add an id, an id will be generated using the URL and that will only work if you baseline against the exact same URL.',
      group: 'compare'
    })
    .option('compare.baselinePath', {
      type: 'string',
      describe:
        'Specifies the path to the baseline data file. This file is used as a reference for comparison against the current test data.',
      group: 'compare'
    })
    .option('compare.saveBaseline', {
      type: 'boolean',
      default: false,
      describe:
        'Determines whether to save the current test data as the new baseline. Set to true to save the current data as baseline for future comparisons.',
      group: 'compare'
    })
    .option('compare.testType', {
      describe:
        'Selects the statistical test type to be used for comparison. Options are mannwhitneyu for the Mann-Whitney U test and wilcoxon for the Wilcoxon signed-rank test.',
      choices: ['mannwhitneyu', ' wilcoxon'],
      default: 'mannwhitneyu',
      group: 'compare'
    })
    .option('compare.alternative', {
      choices: ['less', ' greater', 'two-sided'],
      default: 'greater',
      describe:
        'Specifies the alternative hypothesis to be tested. Default is greater than means current data is greater than the baseline. two-sided means we look for different both ways and less means current is less than baseline. ',
      group: 'compare'
    })
    .option('compare.wilcoxon.correction', {
      type: 'boolean',
      describe:
        'Enables or disables the continuity correction in the Wilcoxon signed-rank test. Set to true to enable the correction.',
      default: false,
      group: 'compare'
    })
    .option('compare.wilcoxon.zeroMethod', {
      choices: ['wilcox', ' pratt', 'zsplit'],
      describe:
        'Specifies the method for handling zero differences in the Wilcoxon test. wilcox discards all zero-difference pairs, pratt includes all, and zsplit splits them evenly among positive and negative ranks.',
      default: 'zsplit',
      group: 'compare'
    })
    .option('compare.mannwhitneyu.useContinuity', {
      type: 'boolean',
      default: false,
      describe:
        'Determines whether to use continuity correction in the Mann-Whitney U test. Set to true to apply the correction.',
      group: 'compare'
    })
    .option('compare.mannwhitneyu.method', {
      choices: ['auto', ' exact', 'symptotic'],
      escribe:
        'Selects the method for calculating the Mann-Whitney U test. auto automatically selects between exact and asymptotic based on sample size, exact uses the exact distribution of U, and symptotic uses a normal approximation.',
      default: 'auto',
      group: 'compare'
    });
}
