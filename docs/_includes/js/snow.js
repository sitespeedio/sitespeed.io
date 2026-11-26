// Start the snow on the first scroll, mouse move or key press. A test tool
// that only loads the page never does that, so the snow does not change
// the visual metrics of the tests of the site (browsertime hides
// navigator.webdriver, so that cannot be used). When it snowed on the last
// page, the snow goes on at once from where it was.
const events = ['scroll', 'pointermove', 'keydown', 'touchstart'];
const storageKey = 'sitespeed.io-snow';
const snowTimeKey = 'sitespeed.io-snow-time';
const musicKey = 'sitespeed.io-music';
// Go on with the snow of the last page only if it was a short time ago
const sameVisit = 30 * 60 * 1000;
let snow;
let snowOn = false;
let snowStarted = 0;
let snowSeconds = 0;
let snowButton;
let musicButton;
let musicOn = false;
let musicPlaying = false;
let musicPosition = 0;
// The file names are content hashes, so the page tells where the files are
const scriptUrls = document.currentScript.dataset;

function makeSnow() {
  const element = document.createElement('div');
  element.className = 'snow';
  element.setAttribute('aria-hidden', 'true');
  for (const depth of [
    'far',
    'mid',
    'near',
    'crystals-far',
    'crystals',
    'crystals-near'
  ]) {
    const layer = document.createElement('div');
    layer.className = 'snow-layer snow-' + depth;
    element.append(layer);
  }
  // A real element and not a pseudo element, so it can be clicked
  const sleigh = document.createElement('div');
  sleigh.className = 'snow-sleigh';
  element.append(sleigh);
  return element;
}

function setSnow(on) {
  snowOn = on;
  // The class also starts the Christmas lights
  document.documentElement.classList.toggle('let-it-snow', on);
  if (on) {
    snow = snow || makeSnow();
    // Start the animations this many seconds in, so every flake is where
    // it was. Setting a style from a script is allowed by our CSP.
    snow.style.setProperty('--snow-delay', -snowSeconds + 's');
    snowStarted = performance.now();
    document.body.append(snow);
  } else if (snow) {
    snow.remove();
    snowSeconds = 0;
  }
  snowButton.textContent = on ? '❄ Stop the snow' : '❄ Let it snow';
  snowButton.setAttribute('aria-pressed', String(on));
}

function snowIsOn() {
  try {
    if (localStorage.getItem(storageKey) === 'off') {
      return false;
    }
  } catch {
    // No storage (private mode), use the default
  }
  return !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function readSnowTime() {
  try {
    const time = JSON.parse(localStorage.getItem(snowTimeKey));
    if (time && Date.now() - time.at < sameVisit) {
      return time.seconds;
    }
  } catch {
    // No storage (private mode), start the snow from the beginning
  }
}

function saveSnowTime() {
  try {
    if (snowOn) {
      const seconds = snowSeconds + (performance.now() - snowStarted) / 1000;
      localStorage.setItem(
        snowTimeKey,
        JSON.stringify({ seconds, at: Date.now() })
      );
    } else {
      localStorage.removeItem(snowTimeKey);
    }
  } catch {
    // No storage (private mode), the next page starts the snow again
  }
}

function rememberSnow(on) {
  try {
    localStorage.setItem(storageKey, on ? 'on' : 'off');
  } catch {
    // No storage (private mode), the choice is for this page only
  }
}

function readMusic() {
  try {
    const music = JSON.parse(localStorage.getItem(musicKey)) || {};
    musicOn = music.on === true;
    musicPosition = music.position || 0;
  } catch {
    // No storage (private mode), no music to go on with
  }
}

// Remember if the music plays and where, so the next page can go on
function saveMusic() {
  try {
    const position = musicPlaying
      ? window.christmasMusic.position
      : musicPosition;
    localStorage.setItem(musicKey, JSON.stringify({ on: musicOn, position }));
  } catch {
    // No storage (private mode), the music stops with the page
  }
}

// The button tells what really happens: after a new page the music waits
// for a click, so it says continue until it plays again
function setMusicButton() {
  if (musicPlaying) {
    musicButton.textContent = '🔕 Stop the music';
  } else if (musicOn) {
    musicButton.textContent = '🔔 Continue the music';
  } else {
    musicButton.textContent = '🔔 Christmas music';
  }
  musicButton.setAttribute('aria-pressed', String(musicPlaying));
}

function loadScript(url, ready) {
  const script = document.createElement('script');
  script.src = url;
  if (ready) {
    script.addEventListener('load', ready);
  }
  document.head.append(script);
}

// The music is in its own file, so it only loads when someone wants it
function loadMusic(ready) {
  if (window.christmasMusic) {
    ready();
  } else {
    loadScript(scriptUrls.music, ready);
  }
}

function startMusic(fromPosition) {
  musicOn = true;
  loadMusic(() => {
    if (musicOn && !musicPlaying) {
      window.christmasMusic.start(fromPosition);
      musicPlaying = true;
      setMusicButton();
    }
  });
}

function stopMusic() {
  musicOn = false;
  if (musicPlaying) {
    window.christmasMusic.stop();
    musicPlaying = false;
  }
  musicPosition = 0;
  setMusicButton();
  saveMusic();
}

// A browser only plays sound after a click or a key press on the page, so
// music that played on the last page goes on at the first one here
function goOnWithMusic(event) {
  if (event.target.closest && event.target.closest('.christmas-controls')) {
    // The buttons decide themselves
    return;
  }
  window.removeEventListener('pointerdown', goOnWithMusic);
  window.removeEventListener('keydown', goOnWithMusic);
  if (musicOn && !musicPlaying) {
    startMusic(musicPosition);
  }
}

function addControls() {
  const controls = document.createElement('div');
  controls.className = 'christmas-controls';

  snowButton = document.createElement('button');
  snowButton.type = 'button';
  snowButton.addEventListener('click', () => {
    const on = snowButton.getAttribute('aria-pressed') !== 'true';
    setSnow(on);
    rememberSnow(on);
  });

  musicButton = document.createElement('button');
  musicButton.type = 'button';
  musicButton.addEventListener('click', () => {
    if (musicPlaying) {
      stopMusic();
    } else {
      // Go on where the last page was, or start the song
      startMusic(musicOn ? musicPosition : 0);
      saveMusic();
    }
  });
  readMusic();
  setMusicButton();
  if (musicOn) {
    window.addEventListener('pointerdown', goOnWithMusic);
    window.addEventListener('keydown', goOnWithMusic);
  }
  window.addEventListener('pagehide', () => {
    saveMusic();
    saveSnowTime();
  });

  controls.append(snowButton, musicButton);
  document.body.append(controls);
}

// What js/christmas-surprises.js needs from this file
window.sitespeedChristmas = {
  setSnow(on) {
    setSnow(on);
    rememberSnow(on);
  },
  snow: () => (snowOn ? snow : undefined),
  loadMusic
};

function letItSnow(event) {
  for (const type of events) {
    window.removeEventListener(type, letItSnow);
  }
  addControls();
  setSnow(snowIsOn());
  if (event && event.type === 'keydown') {
    goOnWithMusic(event);
  }
  // The surprises are in their own file, loaded when the page is used
  loadScript(scriptUrls.surprises);
}

const lastSnow = readSnowTime();
if (lastSnow === undefined) {
  for (const event of events) {
    window.addEventListener(event, letItSnow, { passive: true });
  }
} else {
  snowSeconds = lastSnow;
  letItSnow();
}
