/* eslint-disable no-undef */
// Drives the merged Rendering view (video + filmstrip). Everything is
// scoped to #rendering-view and the whole script no-ops when the view
// is missing, so it is safe on pages without a video or filmstrip.
// All state comes from data attributes rendered by the pug template —
// no JSON blob to keep in sync.
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
  let lightboxIndex = 0;

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
