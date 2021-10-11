window.addEventListener('DOMContentLoaded', function () {
  let tabsRoot = document.querySelector('#tabs');

  let navigationLinks = document.querySelectorAll('#pageNavigation a');
  for (let i = 0; i < navigationLinks.length; ++i) {
    navigationLinks[i].addEventListener('click', event => {
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
  for (let i = 0; i < sections.length; i++) {
    sections[i].style.display = 'none';
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
  for (let i = 0; i < charts.length; i++) {
    if (charts[i].__chartist__) {
      charts[i].__chartist__.update();
    }
  }

  if (updateUrlFragment && history.replaceState) {
    history.replaceState(null, null, '#' + newSelection.id);
  }

  return false;
}
