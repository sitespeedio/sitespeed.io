import sys
import json
from scipy.stats import wilcoxon, mannwhitneyu

def has_variability(sample):
    """Check if the sample has more than one unique value."""
    return len(set(sample)) > 1

def perform_test(test_type, baseline, current, **kwargs):
    """Perform the statistical test based on the test type."""
    if not has_variability(baseline) or not has_variability(current):
        if baseline == current:
            return None, "Datasets are identical"
        else:
            return None, "No variability"
    if (len(set(baseline)) != len(set(current))) and test_type == 'wilcoxon':
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
        if p == "No variability" or p == "Datasets are identical" or p == "Datasets have different lengths":
            group_results[metric_name] = {'statistic': "N/A", 'p-value': p}
        else:
            group_results[metric_name] = {'statistic': stat, 'p-value': p}
    final_results[group_name] = group_results

print(json.dumps(final_results))
