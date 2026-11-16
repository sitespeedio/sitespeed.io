import sys
import json
from scipy.stats import wilcoxon, mannwhitneyu, ks_2samp

def perform_test(test_type, baseline, current, **kwargs):
    """Perform the statistical test based on the test type."""
    # Identical samples cannot differ, and they make Wilcoxon degenerate
    # (every paired difference is zero), so short-circuit them. Constant
    # but DIFFERENT samples must reach the test: in a replay/lab setup the
    # most deterministic metrics have zero variance within a session, and
    # a clean shift (all runs 303 ms -> all runs 310 ms) is the strongest
    # possible signal. The old has_variability guard skipped the test
    # whenever either sample was constant, which suppressed exactly those.
    if baseline == current:
        return None, "Datasets are identical"
    if (len(baseline) != len(current)) and test_type == 'wilcoxon':
        return None, "Datasets have different lengths"

    if test_type == 'wilcoxon':
        return wilcoxon(current, baseline, **kwargs)
    elif test_type == 'mannwhitneyu':
        return mannwhitneyu(current, baseline, **kwargs)
    else:
        raise ValueError("Invalid test type. Choose 'wilcoxon' or 'mannwhitneyu'.")

input_data = json.loads(sys.stdin.read())
options = input_data['options']
test_type = options.pop('test_type')
final_results = {}

# Iterate over each metric group in the metrics dictionary
for group_name, metrics in input_data['metrics'].items():
    group_results = {}
    for metric_name, metric_data in metrics.items():
        stat, p = perform_test(test_type, metric_data['baseline'], metric_data['current'], **options)
        if p == "Datasets are identical" or p == "Datasets have different lengths":
            group_results[metric_name] = {'statistic': "N/A", 'p-value': p}
        else:
            # Kolmogorov-Smirnov compares the whole distributions, so it
            # catches what a rank test misses: the median holding while the
            # spread grows or the runs split into two groups (an
            # intermittent slow path). Unpaired, so it runs for both test
            # types and for unequal sample sizes.
            ks_stat, ks_p = ks_2samp(metric_data['current'], metric_data['baseline'])
            group_results[metric_name] = {'statistic': stat, 'p-value': p, 'ks-p-value': ks_p}
    final_results[group_name] = group_results

print(json.dumps(final_results))
