// Human names for the Chrome-trace work categories shown in the HTML
// report (the CPU tab's category bars and the start page's CPU card).
// Falls back to the raw key so new categories still render.
const CATEGORY_NAMES = {
  parseHTML: 'Parsing HTML & CSS',
  styleLayout: 'Style & layout',
  scriptParseCompile: 'Parsing & compiling JavaScript',
  scriptEvaluation: 'Running JavaScript',
  paintCompositeRender: 'Paint & composite',
  garbageCollection: 'Garbage collection',
  other: 'Other browser work'
};

export function cpuCategoryName(key) {
  return CATEGORY_NAMES[key] || key;
}
