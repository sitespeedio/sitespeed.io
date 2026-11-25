// Christmas music as video game tunes, played by the browser with the Web
// Audio API like an old game console: a square wave melody, fast chord
// arpeggios, a triangle bass and noise drums. The playlist is We Wish You
// a Merry Christmas, Jingle Bells, Silent Night and Hej tomtegubbar, all
// in the public domain, and no sound file is needed. js/snow.js loads this
// file when someone wants music.
(function () {
  // MIDI note numbers: 60 is C4
  const C4 = 60;
  const D4 = 62;
  const E4 = 64;
  const F4 = 65;
  const Fs4 = 66;
  const G4 = 67;
  const Gs4 = 68;
  const A4 = 69;
  const B4 = 71;
  const C5 = 72;
  const Cs5 = 73;
  const D5 = 74;
  const E5 = 76;
  const F5 = 77;
  const Fs5 = 78;
  const G5 = 79;
  const A5 = 81;

  // [bass, the fifth of the bass, chord]
  const C = [48, 43, [60, 64, 67]];
  const F = [41, 48, [60, 65, 69]];
  const G = [43, 50, [59, 62, 67]];
  const D = [50, 45, [62, 66, 69]];
  const D7 = [50, 45, [60, 62, 66]];
  const E = [52, 47, [59, 64, 68]];
  const Am = [45, 52, [60, 64, 69]];
  const A = [45, 52, [61, 64, 69]];

  // [note, beats]. A note of 0 is a rest.
  const weWish = [
    [C5, 1], [C5, 1 / 2], [D5, 1 / 2], [C5, 1 / 2], [B4, 1 / 2],
    [A4, 1], [A4, 1], [A4, 1],
    [D5, 1], [D5, 1 / 2], [E5, 1 / 2], [D5, 1 / 2], [C5, 1 / 2],
    [B4, 1], [G4, 1], [G4, 1],
    [E5, 1], [E5, 1 / 2], [F5, 1 / 2], [E5, 1 / 2], [D5, 1 / 2],
    [C5, 1], [A4, 1], [G4, 1 / 2], [G4, 1 / 2],
    [A4, 1], [D5, 1], [B4, 1]
  ];
  const weWishChords = [C, F, D7, G, E, Am, G, C];

  const jingleVerse = [
    [G4, 1], [E5, 1], [D5, 1], [C5, 1],
    [G4, 3], [G4, 1 / 2], [G4, 1 / 2],
    [G4, 1], [E5, 1], [D5, 1], [C5, 1],
    [A4, 4],
    [A4, 1], [F5, 1], [E5, 1], [D5, 1],
    [B4, 4],
    [G5, 1], [G5, 1], [F5, 1], [D5, 1],
    [E5, 4],
    [G4, 1], [E5, 1], [D5, 1], [C5, 1],
    [G4, 4],
    [G4, 1], [E5, 1], [D5, 1], [C5, 1],
    [A4, 3], [A4, 1],
    [A4, 1], [F5, 1], [E5, 1], [D5, 1],
    [G5, 1], [G5, 1], [G5, 1], [G5, 1],
    [A5, 1], [G5, 1], [F5, 1], [D5, 1],
    [C5, 2], [G5, 2]
  ];
  const jingleChorusStart = [
    [E5, 1], [E5, 1], [E5, 2],
    [E5, 1], [E5, 1], [E5, 2],
    [E5, 1], [G5, 1], [C5, 3 / 2], [D5, 1 / 2],
    [E5, 4],
    [F5, 1], [F5, 1], [F5, 3 / 2], [F5, 1 / 2],
    [F5, 1], [E5, 1], [E5, 1], [E5, 1 / 2], [E5, 1 / 2]
  ];
  const jingleChorus = [
    ...jingleChorusStart,
    [E5, 1], [D5, 1], [D5, 1], [E5, 1],
    [D5, 2], [G5, 2],
    ...jingleChorusStart,
    [G5, 1], [G5, 1], [F5, 1], [D5, 1],
    [C5, 4]
  ];

  const silentNight = [
    [G4, 3 / 2], [A4, 1 / 2], [G4, 1], [E4, 3],
    [G4, 3 / 2], [A4, 1 / 2], [G4, 1], [E4, 3],
    [D5, 2], [D5, 1], [B4, 3],
    [C5, 2], [C5, 1], [G4, 3],
    [A4, 2], [A4, 1], [C5, 3 / 2], [B4, 1 / 2], [A4, 1],
    [G4, 3 / 2], [A4, 1 / 2], [G4, 1], [E4, 3],
    [A4, 2], [A4, 1], [C5, 3 / 2], [B4, 1 / 2], [A4, 1],
    [G4, 3 / 2], [A4, 1 / 2], [G4, 1], [E4, 3],
    [D5, 2], [D5, 1], [F5, 3 / 2], [D5, 1 / 2], [B4, 1],
    [C5, 3], [E5, 3],
    [C5, 3 / 2], [G4, 1 / 2], [E4, 1], [G4, 3 / 2], [F4, 1 / 2], [D4, 1],
    [C4, 6]
  ];
  const silentNightChords = [
    C, C, C, C, G, G, C, C, F, F, C, C, F, F, C, C, G, G, C, C, C, G, C, C
  ];

  // From FolkWiki, tune 2832 (variation 1), in D major
  const hejTomtegubbar = [
    [A4, 1 / 2],
    [D5, 2 / 3], [A4, 2 / 3], [B4, 2 / 3], [A4, 3 / 4], [G4, 1 / 4],
    [Fs4, 1 / 2], [G4, 1 / 6], [A4, 2 / 3], [A4, 2 / 3], [D5, 3 / 4], [D5, 1 / 4],
    [Cs5, 1 / 3], [D5, 1 / 3], [E5, 4 / 3], [D5, 3 / 4], [Cs5, 1 / 4],
    [Cs5, 1 / 4], [D5, 3 / 4], [D5, 3 / 2], [A4, 1 / 2],
    [D5, 2 / 3], [A4, 2 / 3], [B4, 2 / 3], [A4, 3 / 4], [G4, 1 / 4],
    [Fs4, 1 / 2], [G4, 1 / 6], [A4, 2 / 3], [A4, 2 / 3], [D5, 3 / 4], [D5, 1 / 4],
    [Cs5, 1 / 3], [D5, 1 / 3], [E5, 4 / 3], [D5, 3 / 4], [Cs5, 1 / 4],
    [Cs5, 1 / 4], [D5, 3 / 4], [D5, 3 / 2], [Cs5, 1 / 2],
    [D5, 1 / 3], [Fs5, 1 / 3], [E5, 2 / 3], [E5, 2 / 3], [Cs5, 3 / 4], [Cs5, 1 / 4],
    [D5, 1 / 4], [Fs5, 3 / 4], [E5, 7 / 4], [Cs5, 1 / 4],
    [D5, 1 / 3], [Fs5, 1 / 3], [E5, 2 / 3], [E5, 2 / 3], [Cs5, 3 / 4], [Cs5, 1 / 4],
    [B4, 1 / 2], [A4, 1 / 4], [Gs4, 1 / 4], [A4, 3 / 2], [A4, 1 / 2],
    [D5, 2 / 3], [A4, 2 / 3], [B4, 2 / 3], [A4, 3 / 4], [G4, 1 / 4],
    [Fs4, 1 / 2], [G4, 1 / 6], [A4, 2 / 3], [A4, 2 / 3], [D5, 3 / 4], [D5, 1 / 4],
    [Cs5, 1 / 3], [D5, 1 / 3], [E5, 4 / 3], [D5, 3 / 4], [Cs5, 1 / 4],
    [Cs5, 1 / 4], [D5, 3 / 4], [D5, 1]
  ];
  const hejChords = [D, D, A, D, D, D, A, D, A, A, A, E, D, D, A, D];

  // The playlist as one list of steps of half a beat, each with what to
  // play and how long it is, so every song can have its own tempo
  const steps = [];

  function addBars(beat, beatsPerBar, chords, melody, start, drums) {
    const first = steps.length;
    for (const chord of chords) {
      for (let half = 0; half < beatsPerBar * 2; half++) {
        const step = { seconds: beat / 2, beat, notes: [], drums };
        if (chord && half === 0) {
          step.bass = chord[0];
        } else if (chord && beatsPerBar === 4 && half === 4) {
          step.bass = chord[1];
        } else if (chord && half % 2 === 0) {
          step.chord = chord[2];
        }
        step.hihat = half % 2 === 0 ? 1 : 0.5;
        steps.push(step);
      }
    }
    // A melody note can start between two steps (triplets, sixteenths)
    let at = start || 0;
    for (const [note, beats] of melody || []) {
      if (note) {
        const index = Math.floor(at * 2 + 1e-6);
        steps[first + index].notes.push([note, at - index / 2, beats]);
      }
      at += beats;
    }
  }

  // We Wish You a Merry Christmas, 3/4, twice
  addBars(0.36, 3, [C], [[G4, 1]], 2, true);
  addBars(0.36, 3, weWishChords, [...weWish, [C5, 2], [G4, 1]], 0, true);
  addBars(0.36, 3, weWishChords, [...weWish, [C5, 3]], 0, true);
  addBars(0.36, 3, [undefined]);
  // Jingle Bells, 4/4: intro, verse and the chorus twice
  const jingleChords = [C, C, C, F, F, G, G, C, C, C, C, F, F, G, G, C];
  const chorusChords = [C, C, C, C, F, C, D7, G, C, C, C, C, F, C, G, C];
  addBars(0.23, 4, [C, G], [], 0, true);
  addBars(0.23, 4, jingleChords, jingleVerse, 0, true);
  addBars(0.23, 4, chorusChords, jingleChorus, 0, true);
  addBars(0.23, 4, chorusChords, jingleChorus, 0, true);
  addBars(0.23, 4, [undefined]);
  // Silent Night, 3/4, slow and without drums
  addBars(0.42, 3, silentNightChords, silentNight, 0, false);
  addBars(0.42, 3, [undefined]);
  // Hej tomtegubbar, a polska in 3/4, twice
  addBars(0.4, 3, [D], [[A4, 1 / 2]], 5 / 2, true);
  // The first time ends with the "Hej" that starts the second time
  const hejOnce = hejTomtegubbar.slice(1);
  addBars(0.4, 3, hejChords, [...hejOnce, [0, 1 / 2], [A4, 1 / 2]], 0, true);
  addBars(0.4, 3, hejChords, hejOnce, 0, true);
  addBars(0.4, 3, [undefined]);

  let audio;
  let output;
  let noise;
  let pulse;
  let timer;
  let step = 0;
  let stepTime = 0;

  const frequency = note => 440 * Math.pow(2, (note - 69) / 12);

  // A note that holds and then stops short, like a game console
  function chip(time, note, length, volume, wave) {
    const oscillator = audio.createOscillator();
    const gain = audio.createGain();
    if (wave === 'pulse') {
      oscillator.setPeriodicWave(pulse);
    } else {
      oscillator.type = wave;
    }
    oscillator.frequency.value = frequency(note);
    gain.gain.setValueAtTime(volume, time);
    gain.gain.setValueAtTime(volume, time + length * 0.85);
    gain.gain.linearRampToValueAtTime(0, time + length);
    oscillator.connect(gain).connect(output);
    oscillator.start(time);
    oscillator.stop(time + length + 0.01);
  }

  function drum(time, filterType, filterFrequency, length, volume) {
    const source = audio.createBufferSource();
    const filter = audio.createBiquadFilter();
    const gain = audio.createGain();
    source.buffer = noise;
    filter.type = filterType;
    filter.frequency.value = filterFrequency;
    gain.gain.setValueAtTime(volume, time);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + length);
    source.connect(filter).connect(gain).connect(output);
    source.start(time, Math.random() * 0.5, length + 0.02);
  }

  function kick(time) {
    const oscillator = audio.createOscillator();
    const gain = audio.createGain();
    oscillator.type = 'triangle';
    oscillator.frequency.setValueAtTime(160, time);
    oscillator.frequency.exponentialRampToValueAtTime(40, time + 0.12);
    gain.gain.setValueAtTime(0.5, time);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.15);
    oscillator.connect(gain).connect(output);
    oscillator.start(time);
    oscillator.stop(time + 0.16);
  }

  function play(time, { beat, notes, bass, chord, hihat, drums }) {
    for (const [note, after, beats] of notes) {
      chip(time + after * beat, note, beats * beat, 0.09, 'pulse');
    }
    if (bass) {
      chip(time, bass, beat * 0.9, 0.3, 'triangle');
      if (drums) {
        kick(time);
      }
    }
    if (chord) {
      // The chord as a fast arpeggio over the whole beat
      const arpeggio = [...chord, chord[1] + 12, ...chord, chord[1] + 12];
      const length = beat / arpeggio.length;
      for (const [index, chordNote] of arpeggio.entries()) {
        chip(time + index * length, chordNote + 12, length, 0.035, 'square');
      }
      if (drums) {
        drum(time, 'bandpass', 1800, 0.12, 0.35);
      }
    }
    if (drums && hihat) {
      drum(time, 'highpass', 8000, 0.03, 0.12 * hihat);
    }
  }

  // Plans the notes a little ahead, so the timing stays exact even if the
  // page is busy
  function schedule() {
    while (stepTime < audio.currentTime + 0.4) {
      play(stepTime, steps[step]);
      stepTime += steps[step].seconds;
      step = (step + 1) % steps.length;
    }
  }

  function makeNoise() {
    const buffer = audio.createBuffer(1, audio.sampleRate, audio.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    return buffer;
  }

  // A square wave that is high a quarter of the time, the classic sound of
  // game console melodies
  function makePulse() {
    const size = 32;
    const real = new Float32Array(size);
    const imag = new Float32Array(size);
    for (let n = 1; n < size; n++) {
      imag[n] = (2 / (n * Math.PI)) * Math.sin(n * Math.PI * 0.25);
    }
    return audio.createPeriodicWave(real, imag);
  }

  window.christmasMusic = {
    // Start at a step of the playlist, so the next page can go on from there
    start(fromStep) {
      audio = new AudioContext();
      noise = makeNoise();
      pulse = makePulse();
      const compressor = audio.createDynamicsCompressor();
      compressor.connect(audio.destination);
      output = audio.createGain();
      output.gain.value = 0.7;
      output.connect(compressor);
      step = Math.floor(fromStep || 0) % steps.length;
      stepTime = audio.currentTime + 0.1;
      timer = setInterval(schedule, 100);
      schedule();
    },
    stop() {
      clearInterval(timer);
      // Closing the audio also stops the notes that are already planned
      audio.close();
      audio = undefined;
    },
    get position() {
      return step;
    },
    // A short 8-bit fanfare for an achievement, on its own audio so it
    // plays also when the music does not
    fanfare() {
      const fanfareAudio = new AudioContext();
      let time = fanfareAudio.currentTime + 0.05;
      for (const [note, length] of [
        [G4, 0.09],
        [C5, 0.09],
        [E5, 0.09],
        [G5, 0.18],
        [E5, 0.09],
        [G5, 0.5]
      ]) {
        const oscillator = fanfareAudio.createOscillator();
        const gain = fanfareAudio.createGain();
        oscillator.type = 'square';
        oscillator.frequency.value = frequency(note);
        gain.gain.setValueAtTime(0.08, time);
        gain.gain.setValueAtTime(0.08, time + length * 0.85);
        gain.gain.linearRampToValueAtTime(0, time + length);
        oscillator.connect(gain).connect(fanfareAudio.destination);
        oscillator.start(time);
        oscillator.stop(time + length);
        time += length;
      }
      setTimeout(() => fanfareAudio.close(), 1500);
    }
  };
})();
