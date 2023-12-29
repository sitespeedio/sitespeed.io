window.addEventListener('DOMContentLoaded', function () {
  let tabsRoot = document.querySelector('#tabs');

  let navigationLinks = document.querySelectorAll('#pageNavigation a');
  for (const navigationLink of navigationLinks) {
    navigationLink.addEventListener('click', event => {
      if (!location.hash) return;
      event.preventDefault();
      location.href = `${event.target.href}${location.hash}_ref`;
    });
  }

  let currentTab;
  if (location.hash.endsWith('_ref')) {
    const targetHash = location.hash.slice(0, -4);
    currentTab = tabsRoot.querySelector(targetHash);
    setTimeout(() => history.replaceState({}, location.hash, targetHash));
  } else {
    currentTab = tabsRoot.querySelector(location.hash || 'a');
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

  let charts = section.querySelectorAll('.ct-chart');
  for (const chart of charts) {
    if (chart.__chartist__) {
      chart.__chartist__.update();
    }
  }

  if (updateUrlFragment && history.replaceState) {
    history.replaceState(undefined, undefined, '#' + newSelection.id);
  }

  return false;
}
