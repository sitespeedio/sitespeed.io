/* eslint-disable no-undef */
// Drives the merged Rendering view (video + filmstrip). Everything is
// scoped to #rendering-view and the whole script no-ops when the view
// is missing, so it is safe on pages without a video or filmstrip.
// All state comes from data attributes rendered by the pug template —
// no JSON blob to keep in sync.
function loadFrameImage(source) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', reject);
    image.src = source;
  });
}

globalThis.addEventListener('DOMContentLoaded', function () {
  const view = document.querySelector('#rendering-view');
  if (!view) {
    return;
  }

  const video = view.querySelector('.rendering-video');
  const preview = view.querySelector('.rendering-preview');
  const playButton = view.querySelector('#rendering-play');
  const clock = view.querySelector('#rendering-clock');
  const timeline = view.querySelector('#rendering-timeline');
  const axis = view.querySelector('#rendering-axis');
  const fill = view.querySelector('#rendering-fill');
  const playhead = view.querySelector('#rendering-playhead');
  const stripScroll = view.querySelector('.rendering-strip-scroll');
  const end = timeline ? Number(timeline.dataset.end) : 0;
  const chips = [...view.querySelectorAll('.rendering-chip')];
  const flags = [...view.querySelectorAll('.rendering-flag')];
  const frames = [...view.querySelectorAll('.rendering-frame')].map(
    element => ({
      element,
      t: Number(element.dataset.t),
      src: element.querySelector('img').src
    })
  );

  let cursor = 0;
  let stripTimer;
  let rafId;

  function isPlaying() {
    return (video && !video.paused) || stripTimer !== undefined;
  }

  // Most recent frame at or before the cursor — what the page looked
  // like at time T is whatever was last painted, never the frame that
  // happens to be closest in absolute distance.
  function frameIndexAt(t) {
    let index = 0;
    for (const [i, frame] of frames.entries()) {
      if (frame.t <= t) {
        index = i;
      } else {
        break;
      }
    }
    return index;
  }

  function keepFrameVisible(element) {
    if (!stripScroll) {
      return;
    }
    const left = element.offsetLeft;
    const right = left + element.offsetWidth;
    if (left < stripScroll.scrollLeft) {
      stripScroll.scrollLeft = left - 16;
    } else if (right > stripScroll.scrollLeft + stripScroll.clientWidth) {
      stripScroll.scrollLeft = right - stripScroll.clientWidth + 16;
    }
  }

  function render(t) {
    cursor = t;
    if (clock) {
      clock.textContent = (t / 1000).toFixed(3) + ' s';
    }
    const pct = end > 0 ? Math.min((t / end) * 100, 100) : 0;
    if (playhead) {
      playhead.style.left = pct + '%';
    }
    if (fill) {
      fill.style.width = pct + '%';
    }
    for (const chip of chips) {
      chip.classList.toggle(
        'rendering-chip--passed',
        t >= Number(chip.dataset.t)
      );
    }
    if (frames.length > 0) {
      const index = frameIndexAt(t);
      for (const [i, frame] of frames.entries()) {
        frame.element.classList.toggle('rendering-frame--current', i === index);
      }
      if (!video && preview) {
        preview.src = frames[index].src;
      }
      if (isPlaying()) {
        keepFrameVisible(frames[index].element);
      }
    }
  }

  function seek(t) {
    if (video) {
      video.currentTime = t / 1000;
    }
    render(t);
  }

  // Filmstrip-only playback: replay the strip at its real pace by
  // scheduling each frame with the actual delta to the next one.
  function stopStripPlay() {
    if (stripTimer !== undefined) {
      clearTimeout(stripTimer);
      stripTimer = undefined;
    }
    if (playButton) {
      playButton.textContent = '▶ Play';
    }
  }

  function stepStripPlay(index) {
    render(frames[index].t);
    if (index >= frames.length - 1) {
      stripTimer = undefined;
      playButton.textContent = '▶ Play';
      return;
    }
    const delay = Math.max(frames[index + 1].t - frames[index].t, 40);
    stripTimer = setTimeout(() => stepStripPlay(index + 1), delay);
  }

  function startStripPlay() {
    playButton.textContent = '❚❚ Pause';
    let index = frameIndexAt(cursor);
    if (index >= frames.length - 1) {
      index = 0;
    }
    stepStripPlay(index);
  }

  if (video) {
    const syncFromVideo = () => render(video.currentTime * 1000);
    const tick = () => {
      syncFromVideo();
      rafId = requestAnimationFrame(tick);
    };
    video.addEventListener('play', () => {
      playButton.textContent = '❚❚ Pause';
      rafId = requestAnimationFrame(tick);
    });
    video.addEventListener('pause', () => {
      playButton.textContent = '▶ Play';
      cancelAnimationFrame(rafId);
      syncFromVideo();
    });
    video.addEventListener('seeked', syncFromVideo);
  }

  if (playButton) {
    playButton.addEventListener('click', () => {
      if (video) {
        if (video.paused) {
          video.play();
        } else {
          video.pause();
        }
      } else if (frames.length > 0) {
        if (stripTimer === undefined) {
          startStripPlay();
        } else {
          stopStripPlay();
        }
      }
    });
  }

  const speedButtons = [...view.querySelectorAll('.rendering-speed')];
  for (const button of speedButtons) {
    button.addEventListener('click', () => {
      for (const other of speedButtons) {
        other.classList.remove('rendering-speed--active');
      }
      button.classList.add('rendering-speed--active');
      if (video) {
        video.playbackRate = Number(button.dataset.speed);
      }
    });
  }

  function step(direction) {
    if (frames.length === 0) {
      return;
    }
    const index = Math.min(
      Math.max(frameIndexAt(cursor) + direction, 0),
      frames.length - 1
    );
    if (video) {
      video.pause();
    }
    stopStripPlay();
    seek(frames[index].t);
  }

  const stepBack = view.querySelector('#rendering-step-back');
  const stepForward = view.querySelector('#rendering-step-forward');
  if (stepBack) {
    stepBack.addEventListener('click', () => step(-1));
  }
  if (stepForward) {
    stepForward.addEventListener('click', () => step(1));
  }

  const jump = view.querySelector('#rendering-jump');
  if (jump) {
    jump.addEventListener('click', () => seek(Number(jump.dataset.t)));
  }

  for (const chip of [...chips, ...flags]) {
    chip.addEventListener('click', () => seek(Number(chip.dataset.t)));
  }

  if (axis && end > 0) {
    const seekFromPointer = event => {
      const rect = axis.getBoundingClientRect();
      const ratio = Math.min(
        Math.max((event.clientX - rect.left) / rect.width, 0),
        1
      );
      seek(Math.round(ratio * end));
    };
    axis.addEventListener('pointerdown', event => {
      axis.setPointerCapture(event.pointerId);
      seekFromPointer(event);
    });
    axis.addEventListener('pointermove', event => {
      if (event.buttons > 0) {
        seekFromPointer(event);
      }
    });
  }

  // Lightbox — dependency free. Opened from the magnifier on each
  // frame, or by clicking the large preview in filmstrip-only mode.
  const lightbox = view.querySelector('#rendering-lightbox');
  const lightboxImg = view.querySelector('#rendering-lightbox-img');
  const lightboxMeta = view.querySelector('#rendering-lightbox-meta');
  const lightboxOriginal = view.querySelector('#rendering-lightbox-original');
  const lightboxDiff = view.querySelector('#rendering-lightbox-diff');
  const lightboxCanvas = view.querySelector('#rendering-lightbox-canvas');
  const lightboxBlend = view.querySelector('#rendering-lightbox-blend');
  const lightboxBlendBase = view.querySelector(
    '#rendering-lightbox-blend-base'
  );
  const lightboxBlendTop = view.querySelector('#rendering-lightbox-blend-top');
  let lightboxIndex = 0;
  let diffOn = false;
  let diffToken = 0;
  // Set after the first tainted-canvas SecurityError (file://) — from
  // then on the CSS blend fallback renders directly instead of
  // throwing once per frame.
  let diffBlendMode = false;

  function renderBlendDiff() {
    lightboxBlendBase.src = frames[lightboxIndex - 1].src;
    lightboxBlendTop.src = frames[lightboxIndex].src;
    lightboxCanvas.hidden = true;
    lightboxBlend.hidden = false;
    lightboxMeta.textContent +=
      ' · approximate diff (serve the report over http(s) for exact changed-pixel counts)';
  }

  // Answers "what actually changed at this moment?": the frame dimmed
  // with every pixel that differs from the PREVIOUS filmstrip frame
  // painted in red. The same per-pixel threshold that separates real
  // change from compression noise when analysing filmstrips by hand
  // (sum of channel deltas > 30). A changed share in the caption sets
  // the scale — whole-page re-rasterization noise reads as a text
  // ghost outline at around one percent.
  async function renderDiff() {
    const token = ++diffToken;
    try {
      const [previous, current] = await Promise.all([
        loadFrameImage(frames[lightboxIndex - 1].src),
        loadFrameImage(frames[lightboxIndex].src)
      ]);
      if (token !== diffToken) {
        return;
      }
      const width = current.naturalWidth;
      const height = current.naturalHeight;
      lightboxCanvas.width = width;
      lightboxCanvas.height = height;
      const context = lightboxCanvas.getContext('2d', {
        willReadFrequently: true
      });
      context.drawImage(previous, 0, 0, width, height);
      // Throws SecurityError on file:// where the canvas is tainted —
      // caught below, the report needs to be served over HTTP.
      const before = context.getImageData(0, 0, width, height);
      context.clearRect(0, 0, width, height);
      context.drawImage(current, 0, 0, width, height);
      const after = context.getImageData(0, 0, width, height);
      const a = before.data;
      const b = after.data;
      let changed = 0;
      for (let index = 0; index < b.length; index += 4) {
        const delta =
          Math.abs(a[index] - b[index]) +
          Math.abs(a[index + 1] - b[index + 1]) +
          Math.abs(a[index + 2] - b[index + 2]);
        if (delta > 30) {
          changed++;
          b[index] = 224;
          b[index + 1] = 28;
          b[index + 2] = 60;
        } else {
          // Dim the unchanged pixels toward white so the highlights carry.
          b[index] = 255 - (255 - b[index]) * 0.2;
          b[index + 1] = 255 - (255 - b[index + 1]) * 0.2;
          b[index + 2] = 255 - (255 - b[index + 2]) * 0.2;
        }
      }
      context.putImageData(after, 0, 0);
      const share = ((changed / (width * height)) * 100).toFixed(
        changed > 0 && changed < (width * height) / 100 ? 2 : 0
      );
      lightboxMeta.textContent +=
        ' · ' + changed.toLocaleString() + ' px changed (' + share + ' %)';
    } catch {
      if (token === diffToken) {
        diffBlendMode = true;
        renderBlendDiff();
      }
    }
  }

  function updateLightbox() {
    const frame = frames[lightboxIndex];
    lightboxImg.src = frame.src;
    lightboxOriginal.href = frame.src;
    const time = frame.element.querySelector('.rendering-frame-time');
    const pct = frame.element.querySelector('.rendering-frame-pct');
    lightboxMeta.textContent =
      'Frame ' +
      (lightboxIndex + 1) +
      ' of ' +
      frames.length +
      ' · ' +
      time.textContent +
      (pct ? ' · ' + pct.textContent : '');
    if (lightboxDiff) {
      // The first frame has nothing to diff against.
      lightboxDiff.disabled = lightboxIndex === 0;
      const showDiff = diffOn && lightboxIndex > 0;
      lightboxDiff.setAttribute('aria-pressed', String(showDiff));
      // Best diff first: an image precomputed by browsertime
      // (--videoParams.filmstripDiff) is exact, carries counts and
      // needs no pixel access, so it also works on file://. Without
      // one, the canvas computes the same view at click time, and on
      // file:// (tainted canvas) the CSS blend approximates it.
      const precomputed = showDiff ? frame.element.dataset.diff : undefined;
      lightboxCanvas.hidden = true;
      lightboxBlend.hidden = true;
      lightboxImg.hidden = showDiff && !precomputed;
      if (precomputed) {
        lightboxImg.src = precomputed;
        if (frame.element.dataset.diffChanged !== undefined) {
          lightboxMeta.textContent +=
            ' · ' +
            Number(frame.element.dataset.diffChanged).toLocaleString() +
            ' px changed (' +
            frame.element.dataset.diffShare +
            ' %)';
        }
      } else if (showDiff && diffBlendMode) {
        renderBlendDiff();
      } else if (showDiff) {
        lightboxCanvas.hidden = false;
        renderDiff();
      }
    }
  }

  function openLightbox(index) {
    if (!lightbox) {
      return;
    }
    lightboxIndex = index;
    updateLightbox();
    lightbox.hidden = false;
  }

  function closeLightbox() {
    lightbox.hidden = true;
  }

  function lightboxStep(direction) {
    lightboxIndex = Math.min(
      Math.max(lightboxIndex + direction, 0),
      frames.length - 1
    );
    updateLightbox();
  }

  if (lightbox) {
    view
      .querySelector('#rendering-lightbox-close')
      .addEventListener('click', closeLightbox);
    view
      .querySelector('#rendering-lightbox-backdrop')
      .addEventListener('click', closeLightbox);
    view
      .querySelector('#rendering-lightbox-prev')
      .addEventListener('click', () => lightboxStep(-1));
    view
      .querySelector('#rendering-lightbox-next')
      .addEventListener('click', () => lightboxStep(1));
    if (lightboxDiff) {
      lightboxDiff.addEventListener('click', () => {
        diffOn = !diffOn;
        updateLightbox();
      });
    }
  }

  for (const [index, frame] of frames.entries()) {
    frame.element.addEventListener('click', () => seek(frame.t));
    const zoomButton = frame.element.querySelector('.rendering-frame-zoom');
    if (zoomButton) {
      zoomButton.addEventListener('click', event => {
        event.stopPropagation();
        openLightbox(index);
      });
    }
  }

  if (preview && !video) {
    preview.addEventListener('click', () => openLightbox(frameIndexAt(cursor)));
  }

  const zoom = view.querySelector('#rendering-zoom');
  const strip = view.querySelector('#rendering-strip');
  if (zoom && strip) {
    zoom.addEventListener('input', () => {
      strip.style.setProperty('--rendering-frame-width', zoom.value + 'px');
    });
  }

  // Keyboard: ←/→ steps frames, space plays/pauses — but only while the
  // Rendering section is the visible tab, and never while the user is
  // typing in a form control. When the lightbox is open the keys drive
  // the lightbox instead.
  document.addEventListener('keydown', event => {
    const target = event.target;
    if (
      target &&
      (target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT' ||
        target.isContentEditable)
    ) {
      return;
    }
    if (lightbox && !lightbox.hidden) {
      switch (event.key) {
        case 'ArrowLeft': {
          lightboxStep(-1);
          event.preventDefault();
          break;
        }
        case 'ArrowRight': {
          lightboxStep(1);
          event.preventDefault();
          break;
        }
        case 'Escape': {
          closeLightbox();
          event.preventDefault();
          break;
        }
        // No default
      }
      return;
    }
    if (view.offsetParent === null) {
      return;
    }
    switch (event.key) {
      case 'ArrowLeft': {
        step(-1);
        event.preventDefault();
        break;
      }
      case 'ArrowRight': {
        step(1);
        event.preventDefault();
        break;
      }
      case ' ': {
        if (playButton) {
          playButton.click();
        }
        event.preventDefault();
        break;
      }
      // No default
    }
  });

  render(0);
});
