import { get } from '../../support/objectPath.js';
import { size, time, milliwattHours } from '../../support/helpers/index.js';

function escape(value) {
  const text = value === undefined || value === null ? '' : String(value);
  return /[",\n\r]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

function unit(format) {
  if (format === time.ms) return ' (ms)';
  if (format === size.format) return ' (bytes)';
  if (format === milliwattHours) return ' (Wh)';
  return '';
}

/**
 * One row per tested page with the same metrics as the Pages table
 * (--html.pageSummaryMetrics), as raw values for spreadsheets.
 */
export function pagesToCsv(pages, metrics, friendlyNames, urlsMetaData = {}) {
  const columns = [];
  for (const metric of metrics) {
    const [group, key] = metric.split('.');
    for (const tool of Object.keys(friendlyNames)) {
      const definition = friendlyNames[tool][group]?.[key];
      if (definition) {
        columns.push({
          tool,
          // objectPath.get splits on dots only, so ['a-b'] must become .a-b
          path: definition.path.replaceAll(/\['([^']+)'\]/g, '.$1'),
          name: definition.name + unit(definition.format),
          isHttpErrors: key.toLowerCase() === 'httperrors'
        });
        break;
      }
    }
  }

  const lines = [['URL', 'Alias', ...columns.map(column => column.name)]];
  for (const [url, pageInfo] of Object.entries(pages)) {
    const alias =
      get(pageInfo, 'data.browsertime.pageSummary.info.alias') ||
      urlsMetaData[url]?.urlAlias;
    const row = [url, alias];
    for (const column of columns) {
      const value = get(pageInfo.data, [column.tool, 'pageSummary']);
      const raw = value ? get(value, column.path) : undefined;
      row.push(
        column.isHttpErrors && raw
          ? Object.keys(raw).filter(code => code > 399).length
          : raw
      );
    }
    lines.push(row);
  }
  return (
    lines.map(line => line.map(value => escape(value)).join(',')).join('\n') +
    '\n'
  );
}
