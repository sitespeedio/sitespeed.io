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
  const tabAliases = {
    '#video': '#rendering',
    '#filmstrip': '#rendering',
    '#screenshots': '#rendering',
    '#requests-render-blocking': '#rendering'
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
