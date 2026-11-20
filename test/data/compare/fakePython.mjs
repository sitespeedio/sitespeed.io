#!/usr/bin/env node
// Stands in for Python with scipy: it answers like statistical.py
// with a fixed result for each metric.
let input = '';
for await (const chunk of process.stdin) input += chunk;
const { metrics } = JSON.parse(input);
const result = {};
for (const [group, groupMetrics] of Object.entries(metrics)) {
  result[group] = {};
  for (const name of Object.keys(groupMetrics)) {
    result[group][name] = { statistic: 1, 'p-value': 0.5, 'ks-p-value': 0.5 };
  }
}
console.log(JSON.stringify(result));
