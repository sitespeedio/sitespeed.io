// Christmas surprises. js/snow.js loads this file when the page is used
// for the first time.
// * Click the flying sleigh and Santa drops a present with a tip.
// * The Konami code starts a blizzard.
// * Click the big Santa cat on the start page five times and it sneezes.
// * A greeting in the console of the browser.
(function () {
  const christmas = window.sitespeedChristmas;

  const tips = [
    'Every kilobyte of JavaScript costs CPU time on a slow phone. Ship less of it.',
    'One test is not enough. Test many times and compare the runs.',
    'Cache files with a hash in the name for a year: Cache-Control: max-age=31536000, immutable.',
    'Test on a slow phone and a slow network, not only on your laptop.',
    'A budget for size and requests is stable in CI. Timings are not.',
    'Third party scripts can block your page. Load them async, defer or skip them.',
    // How to run synthetic tests that you can trust
    'Pin the CPU speed of your test machine: set the CPU governor to performance and turn off turbo, so the CPU runs at the same speed in every test.',
    'Run your tests on a dedicated machine. On a shared cloud server, other customers use the same CPU and your numbers change.',
    'Look at the CPU benchmark in the result. If it changes between tests, your test machine changes, not your page.',
    'Run one test at a time on a machine. Two browsers at the same time take CPU from each other.',
    'Throttle the network outside the browser (--connectivity.engine throttle), so every request gets the same latency.',
    'Replay the page with WebPageReplay, so the network and the server do not change your numbers.',
    'Pin the version of your Docker container. A new browser can change your metrics without any change on your page.',
    'Use the median of many runs, not the average. One slow run changes the average a lot.',
    'Record a video and look at it. A cookie banner or an error page can give you very fast numbers.',
    'Test with the same viewport every time. Another viewport can give you another LCP element.'
  ];
  let nextTip = Math.floor(Math.random() * tips.length);

  // The colours come from the CSS custom properties of the present
  const presentSvg =
    '<svg viewBox="0 0 40 40" width="40" height="40" aria-hidden="true">' +
    '<rect class="present-box" x="5" y="15" width="30" height="23" rx="2"/>' +
    '<rect class="present-ribbon" x="18" y="15" width="4" height="23"/>' +
    '<g class="present-lid">' +
    '<rect class="present-top" x="3" y="10" width="34" height="7" rx="2"/>' +
    '<rect class="present-ribbon" x="18" y="10" width="4" height="7"/>' +
    '<path class="present-bow" d="M20 10C13 2 7 7 15 10M20 10C27 2 33 7 25 10"/>' +
    '</g></svg>';

  // [box, lid, ribbon]
  const wrappings = [
    ['#c62828', '#e53935', '#f2c14e'],
    ['#2e7d32', '#43a047', '#e53935'],
    ['#1565c0', '#1e88e5', '#eceff1'],
    ['#f2b705', '#fbc02d', '#c62828'],
    ['#6a1b9a', '#8e24aa', '#f2c14e'],
    ['#eceff1', '#ffffff', '#c62828'],
    ['#d81b60', '#ec407a', '#ffffff']
  ];
  let lastWrapping = -1;

  // A new wrapping for every present, never the same twice in a row
  function wrap(present) {
    let index = Math.floor(Math.random() * (wrappings.length - 1));
    if (index >= lastWrapping) {
      index++;
    }
    lastWrapping = index;
    const [box, lid, ribbon] = wrappings[index];
    present.style.setProperty('--box', box);
    present.style.setProperty('--lid', lid);
    present.style.setProperty('--ribbon', ribbon);
  }

  function remove(element) {
    if (element) {
      element.remove();
    }
  }

  // Santa drops a present from the sleigh. It falls to the bottom of the
  // screen and opens with a web performance tip.
  function dropPresent(sleigh) {
    remove(document.querySelector('.christmas-present'));
    remove(document.querySelector('.christmas-tip'));
    const where = sleigh.getBoundingClientRect();
    const present = document.createElement('div');
    present.className = 'christmas-present';
    present.innerHTML = presentSvg;
    wrap(present);
    const left = Math.min(Math.max(where.left + 290, 10), window.innerWidth - 50);
    const top = where.top + 60;
    present.style.left = left + 'px';
    present.style.top = top + 'px';
    // Land above the snow and music buttons in the corner
    present.style.setProperty('--drop', window.innerHeight - top - 110 + 'px');
    document.body.append(present);
    present.addEventListener(
      'animationend',
      () => {
        present.classList.add('open');
        showTip(left);
      },
      { once: true }
    );
  }

  function showTip(left) {
    const tip = document.createElement('div');
    tip.className = 'christmas-tip';
    tip.setAttribute('role', 'status');
    const title = document.createElement('strong');
    title.textContent = '🎁 A present from Santa';
    const text = document.createElement('p');
    text.textContent = tips[nextTip];
    nextTip = (nextTip + 1) % tips.length;
    const close = document.createElement('button');
    close.type = 'button';
    close.textContent = '×';
    close.setAttribute('aria-label', 'Close');
    close.addEventListener('click', () => {
      remove(tip);
      remove(document.querySelector('.christmas-present'));
    });
    tip.append(close, title, text);
    tip.style.left = Math.min(Math.max(left - 140, 10), window.innerWidth - 330) + 'px';
    document.body.append(tip);
    setTimeout(() => {
      remove(tip);
      remove(document.querySelector('.christmas-present'));
    }, 15_000);
  }

  // ↑ ↑ ↓ ↓ ← → ← → B A starts a blizzard for half a minute
  const konami = [
    'ArrowUp',
    'ArrowUp',
    'ArrowDown',
    'ArrowDown',
    'ArrowLeft',
    'ArrowRight',
    'ArrowLeft',
    'ArrowRight',
    'b',
    'a'
  ];
  let typed = 0;
  let blizzardTimer;

  function blizzard() {
    christmas.setSnow(true);
    const snow = christmas.snow();
    if (!snow.querySelector('.snow-blizzard')) {
      for (const kind of [
        'gusts',
        'fine',
        'fast',
        'crystals',
        'faster',
        'huge'
      ]) {
        const layer = document.createElement('div');
        layer.className = 'snow-layer snow-blizzard snow-blizzard-' + kind;
        snow.append(layer);
      }
    }
    remove(document.querySelector('.christmas-achievement'));
    const banner = document.createElement('div');
    banner.className = 'christmas-achievement';
    banner.setAttribute('role', 'status');
    banner.textContent = '🏆 Achievement unlocked: Blizzard mode';
    document.body.append(banner);
    banner.addEventListener('animationend', () => remove(banner));
    christmas.loadMusic(() => window.christmasMusic.fanfare());
    clearTimeout(blizzardTimer);
    blizzardTimer = setTimeout(() => {
      for (const layer of document.querySelectorAll('.snow-blizzard')) {
        layer.remove();
      }
    }, 30_000);
  }

  window.addEventListener('keydown', event => {
    const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
    if (key === konami[typed]) {
      typed++;
      if (typed === konami.length) {
        typed = 0;
        blizzard();
      }
    } else {
      typed = key === konami[0] ? 1 : 0;
    }
  });

  // Five quick clicks on the big Santa cat on the start page and it sneezes
  let clicks = [];

  function sneeze(cat) {
    cat.classList.remove('sneeze');
    // Start the animation again also when it sneezed a moment ago
    void cat.offsetWidth;
    cat.classList.add('sneeze');
    const where = cat.getBoundingClientRect();
    // The nose of the cat is a little left of the middle of the image
    const x = where.left + where.width * 0.42;
    const y = where.top + where.height * 0.62;
    const bubble = document.createElement('div');
    bubble.className = 'christmas-atchoo';
    bubble.textContent = 'Atchoo!';
    bubble.style.left = x - 150 + 'px';
    bubble.style.top = y - 80 + 'px';
    document.body.append(bubble);
    bubble.addEventListener('animationend', () => remove(bubble));
    for (let i = 0; i < 14; i++) {
      const flake = document.createElement('div');
      flake.className = 'christmas-puff';
      flake.style.left = x + 'px';
      flake.style.top = y + 'px';
      const angle = Math.PI * (0.6 + Math.random() * 0.8);
      const distance = 60 + Math.random() * 90;
      flake.style.setProperty('--x', Math.cos(angle) * distance + 'px');
      flake.style.setProperty('--y', Math.sin(angle) * -distance + 30 + 'px');
      document.body.append(flake);
      flake.addEventListener('animationend', () => remove(flake));
    }
  }

  document.addEventListener('click', event => {
    const sleigh = event.target.closest('.snow-sleigh');
    if (sleigh) {
      dropPresent(sleigh);
      return;
    }
    const cat = event.target.closest('.christmas-logo');
    if (cat) {
      const now = Date.now();
      clicks = [...clicks.filter(time => now - time < 2000), now];
      if (clicks.length >= 5) {
        clicks = [];
        sneeze(cat);
      }
    }
  });

  console.log(
    '%c   /\\_/\\    Ho ho ho!\n  ( o.o )   Looking at our source?\n   > ^ <    sitespeed.io is open source, come and help us:\n            https://github.com/sitespeedio/sitespeed.io/blob/main/.github/CONTRIBUTING.md\n\n            Psst: ↑ ↑ ↓ ↓ ← → ← → B A',
    'font-family: monospace; color: #c62828'
  );
})();
