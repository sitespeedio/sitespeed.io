/* eslint-disable no-undef */
globalThis.addEventListener('DOMContentLoaded', function () {
  let tabsRoot = document.querySelector('#tabs');

  let navigationLinks = document.querySelectorAll('#pageNavigation a');
  for (const navigationLink of navigationLinks) {
    navigationLink.addEventListener('click', event => {
      if (!location.hash) return;
      event.preventDefault();
      location.href = `${event.target.href}${location.hash}_ref`;
    });
  }

  // #video, #filmstrip and #screenshots used to be tabs of their own,
  // and #requests-render-blocking used to live on the PageXray tab;
  // they are all merged into the Rendering tab but old deep links must
  // keep opening it. The original hash stays in the URL so the anchors
  // with those ids inside the section keep working.
  // The Rendering tab's why-section deep-links into the CPU tab's
  // forced-reflows table and animations card; a reload (or a shared
  // link) with one of those hashes must open the CPU tab.
  // The Long Animation Frames deep dive moved from the Metrics tab to
  // the CPU tab — old #longAnimationFrames deep links must keep
  // landing on it.
  // The CPU tab's "what kind of work blocked" remedy lines deep-link
  // the other way: into the Rendering tab's selector/invalidation
  // sections and the PageXray tab's coverage section.
  const tabAliases = {
    '#video': '#rendering',
    '#filmstrip': '#rendering',
    '#instability': '#rendering',
    '#screenshots': '#rendering',
    '#requests-render-blocking': '#rendering',
    '#frames': '#rendering',
    '#cpu-frames': '#rendering',
    '#cpu-forced-reflows': '#cpu',
    '#cpu-animations': '#cpu',
    '#cpu-loaf-blocking': '#cpu',
    '#longAnimationFrames': '#cpu',
    '#css-selectors': '#rendering',
    '#style-invalidations': '#rendering',
    // The rest of the why-section: quicklinks work with the tab open,
    // but a SHARED link with one of these hashes loads fresh and needs
    // the map or it lands on the default tab with the target hidden.
    '#slow-ttfb': '#rendering',
    '#recalculate-style': '#rendering',
    '#reflows-before-paint': '#rendering',
    '#main-thread-animations': '#rendering',
    '#coverage': '#pagexray'
  };

  let currentTab;
  if (location.hash.endsWith('_ref')) {
    const targetHash = location.hash.slice(0, -4);
    currentTab = tabsRoot.querySelector(tabAliases[targetHash] || targetHash);
    setTimeout(() => history.replaceState({}, location.hash, targetHash));
  } else {
    const targetHash = tabAliases[location.hash] || location.hash;
    currentTab = tabsRoot.querySelector(targetHash || 'a');
  }

  if (!currentTab) currentTab = tabsRoot.querySelector('a');

  let sections = document.querySelectorAll('#tabSections section');
  for (const section of sections) {
    section.style.display = 'none';
  }
  selectTab(currentTab, false);
});

function selectTab(newSelection, updateUrlFragment) {
  let tabsRoot = document.querySelector('#tabs');
  let sectionRoot = document.querySelector('#tabSections');

  let previousSelection = tabsRoot.querySelector('[selected]');

  if (previousSelection) {
    previousSelection.removeAttribute('selected');
    let section = sectionRoot.querySelector(
      '#' + previousSelection.id + '-panel'
    );
    section.style.display = 'none';
  }

  newSelection.setAttribute('selected', '');
  let section = sectionRoot.querySelector('#' + newSelection.id + '-panel');
  section.style.display = 'block';

  if (updateUrlFragment && history.replaceState) {
    history.replaceState(undefined, undefined, '#' + newSelection.id);
  }

  return false;
}
