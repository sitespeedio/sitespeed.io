import sys
import json
from scipy.stats import wilcoxon, mannwhitneyu

def has_variability(sample):
    """Check if the sample has more than one unique value."""
    return len(set(sample)) > 1

def perform_test(test_type, baseline, current, **kwargs):
    """Perform the statistical test based on the test type."""
    if not has_variability(baseline) or not has_variability(current):
        return None, "No variability"

    if test_type == 'wilcoxon':
        return wilcoxon(baseline, current, **kwargs)
    elif test_type == 'mannwhitneyu':
        return mannwhitneyu(baseline, current, **kwargs)
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
        if p == "No variability":
            group_results[metric_name] = {'statistic': "N/A", 'p-value': "N/A"}
        else:
            group_results[metric_name] = {'statistic': stat, 'p-value': p}
    final_results[group_name] = group_results

print(json.dumps(final_results))
