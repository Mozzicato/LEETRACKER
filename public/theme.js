/* THEME — light, dark, or follow the machine.

   Loaded synchronously from <head> on both pages, ahead of any paint. A
   deferred script would let the white ground land first and flash, which at
   3am is the whole problem we are solving.

   The stored value is the choice, not the result: "auto" stores nothing and
   lets the prefers-color-scheme rule in styles.css decide, so a machine that
   switches at sunset carries the sheet with it. */

(function () {
  var KEY = 'lit-theme';
  var MODES = ['auto', 'light', 'dark'];
  var GROUND = { light: '#ffffff', dark: '#101219' };

  /* Private windows and blocked site data both throw on access. */
  function read() {
    try {
      var stored = localStorage.getItem(KEY);
      return MODES.indexOf(stored) > 0 ? stored : 'auto';
    } catch (e) { return 'auto'; }
  }

  function write(mode) {
    try {
      if (mode === 'auto') localStorage.removeItem(KEY);
      else localStorage.setItem(KEY, mode);
    } catch (e) { /* the theme still applies for this page's lifetime */ }
  }

  function systemPrefersDark() {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  function resolved(mode) {
    return mode === 'auto' ? (systemPrefersDark() ? 'dark' : 'light') : mode;
  }

  function apply(mode) {
    var root = document.documentElement;
    if (mode === 'auto') root.removeAttribute('data-theme');
    else root.setAttribute('data-theme', mode);

    /* The address bar on mobile is part of the page as far as the eye is
       concerned, so it moves too. The tag is in <head> above this script. */
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', GROUND[resolved(mode)]);
  }

  var current = read();
  apply(current);

  /* Following the machine means following it as it changes, not just at boot. */
  if (window.matchMedia) {
    var query = window.matchMedia('(prefers-color-scheme: dark)');
    var onChange = function () { if (current === 'auto') apply('auto'); };
    if (query.addEventListener) query.addEventListener('change', onChange);
    else if (query.addListener) query.addListener(onChange);
  }

  window.LitTheme = {
    get: function () { return current; },
    resolved: function () { return resolved(current); },
    set: function (mode) {
      current = MODES.indexOf(mode) > -1 ? mode : 'auto';
      write(current);
      apply(current);
      return current;
    },
    cycle: function () {
      return this.set(MODES[(MODES.indexOf(current) + 1) % MODES.length]);
    }
  };
})();

/* Wires up any #theme-toggle on the page. Both the sheet and the sign-in page
   have one, and neither should have to know how the cycling works. */
(function () {
  var LABEL = { auto: '◐ System', light: '☀ Light', dark: '☾ Dark' };

  function paint(button) {
    var mode = window.LitTheme.get();
    button.textContent = LABEL[mode];
    button.setAttribute('aria-label', 'Theme: ' + mode + '. Click to change.');
  }

  function ready() {
    var button = document.getElementById('theme-toggle');
    if (!button) return;
    paint(button);
    button.addEventListener('click', function () {
      window.LitTheme.cycle();
      paint(button);
    });
  }

  /* This file is deliberately parsed before <body> exists. */
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ready);
  else ready();
})();
