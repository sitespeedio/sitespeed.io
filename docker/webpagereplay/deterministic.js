// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

function __performDeterministicOverrides() {
  'use strict';

  self.__WPR_DETERMINISTIC_INJECTED = true;

  // Math.random
  (function() {
    // WPR_CONSTANT_RANDOM_RESULT is provided during injection and its value can
    // be controlled by the user.
    // * If WPR_CONSTANT_RANDOM_RESULT is non-null, the sequence consists
    //   purely of repetitions of that value. This ensures that the same value
    //   sequences are seen between recording and replay, *even* if the calls
    //   to Math.random() are reordered (which happens often).
    // * If WPR_CONSTANT_RANDOM_RESULT is null, the sequence is non-constant.
    //   This breaks fewer sites' logic because it doesn't invalidate the
    //   implicit assumption that Math.random() would rarely return any given
    //   value.
    const constant_random_result = WPR_CONSTANT_RANDOM_RESULT;
    if (constant_random_result != null) {
      Math.random = function() { return constant_random_result; };
    } else {
      let random_seed = 0.462;
      Math.random = function() {
        random_seed = (random_seed + 0.13297) % 1;
        return random_seed;
      };
    }
  })();

  // crypto.getRandomValues
  (function() {
    if (typeof (crypto) == 'object' &&
        typeof (crypto.getRandomValues) == 'function') {
      crypto.getRandomValues = function(arr) {
        const scale = Math.pow(256, arr.BYTES_PER_ELEMENT);
        for (let i = 0; i < arr.length; i++) {
          arr[i] = Math.floor(Math.random() * scale);
        }
        return arr;
      };
    }
  })();

  // Date
  (function() {
    let date_count = 0;
    const date_count_threshold = 25;
    const orig_date = Date;
    // Time since epoch in milliseconds. This is replaced by script injector
    // with the date when the recording is done.
    let time_seed = WPR_TIME_SEED_TIMESTAMP;
    Date = function() {
      if (this instanceof Date) {
        date_count++;
        if (date_count > date_count_threshold) {
          time_seed += 50;
          date_count = 1;
        }
        switch (arguments.length) {
        case 0:
          return new orig_date(time_seed);
        case 1:
          return new orig_date(arguments[0]);
        default:
          return new orig_date(arguments[0], arguments[1],
                               arguments.length >= 3 ? arguments[2] : 1,
                               arguments.length >= 4 ? arguments[3] : 0,
                               arguments.length >= 5 ? arguments[4] : 0,
                               arguments.length >= 6 ? arguments[5] : 0,
                               arguments.length >= 7 ? arguments[6] : 0);
        }
      }
      return new Date().toString();
    };
    Date.__proto__ = orig_date;
    Date.prototype = orig_date.prototype;
    Date.prototype.constructor = Date;
    orig_date.now = function() { return new Date().getTime(); };
    orig_date.prototype.getTimezoneOffset = function() {
      const dst2010Start = 1268560800000;
      const dst2010End = 1289120400000;
      if (this.getTime() >= dst2010Start && this.getTime() < dst2010End)
        return 420;
      return 480;
    };
  })();

  // navigator.onLine and associated events.
  (function() {
    // Property
    Object.defineProperty(navigator, "onLine",
                          {value : true, configurable : true});

    // Event handler properties
    ["online", "offline"].forEach(val => {
      Object.defineProperty(self, "on" + val, {
        set : function(value) { return false; },
        get : function() { return null; },
        configurable : false
      });
    });

    // Event listeners
    const originalAddEventListener = self.addEventListener;
    self.addEventListener = function(type, listener, optionsOrUseCapture) {
      if (type === "online" || type === "offline") {
        return undefined;
      }
      return originalAddEventListener.call(this, type, listener,
                                           optionsOrUseCapture);
    };
  })();

  // navigator.connection and associated event.
  (function() {
    class MockConnection extends EventTarget {
      constructor() {
        super();
        this.effectiveType = '4g';
        this.rtt = 100;
        this.downlink = 5;
        this.saveData = false;
        this.onchange = null;
      }
    }

    Object.defineProperty(navigator, "connection",
                          {value : new MockConnection(), configurable : true});
  })();
}

if (typeof self === 'object' && self) {
  if (self.__WPR_DETERMINISTIC_INJECTED) {
    // Script already injected.
  } else {
    __performDeterministicOverrides();
  }
} else {
  // Environment lacks 'self' global (e.g. Node.js); skipping overrides.
}
