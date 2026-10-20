export function initializeConsent() {
(function(){const GA_MEASUREMENT_ID = "G-DZ2LML1S9W";
const CONSENT_VERSION = "2";
const STORAGE_KEY = "lm-consent";

  (function () {
    window.dataLayer = window.dataLayer || [];
    function gtag() {
      window.dataLayer.push(arguments);
    }
    window.gtag = gtag;

    /* Google advertising permissions remain denied. */
    gtag('consent', 'default', {
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
      analytics_storage: 'denied',
      wait_for_update: 500,
    });

    var loaded = false;
    function loadGa() {
      if (loaded) return;
      loaded = true;
      var s = document.createElement('script');
      s.async = true;
      s.src = '/runtime/analytics-disabled.js';
      document.head.appendChild(s);
      gtag('js', new Date());
      /* No anonymize_ip: GA4 ignores it. See the frontmatter. */
      gtag('config', GA_MEASUREMENT_ID);
    }

    function stored() {
      try {
        var fallback = history.state && history.state.lmConsentFallback;
        var raw = fallback ? JSON.stringify(fallback) : localStorage.getItem(STORAGE_KEY);
        if (!raw) return null;
        var v = JSON.parse(raw);
        return v && v.version === CONSENT_VERSION && (v.state === 'granted' || v.state === 'denied') && typeof v.marketing === 'boolean' ? v : null;
      } catch (e) {
        /* Safari private mode throws: treat as no answer given. */
        return null;
      }
    }

    var choice = stored();
    function save(state, marketing) {
      choice = { state: state, marketing: marketing === true, version: CONSENT_VERSION, at: new Date().toISOString() };
      try {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify(choice)
        );
        if (history.state && history.state.lmConsentFallback) {
          var clean = Object.assign({}, history.state); delete clean.lmConsentFallback; history.replaceState(clean, '');
        }
      } catch (e) {
        try { history.replaceState(Object.assign({}, history.state, { lmConsentFallback: choice }), ''); } catch (ignored) {}
      }
    }

    function grant() {
      gtag('consent', 'update', { analytics_storage: 'granted' });
      loadGa();
    }

    /* Withdrawal must remove what was set, not just stop new writes.
       Both host variants are required. See the frontmatter. */
    function clearGaCookies() {
      var host = location.hostname.replace(/^www\./, '');
      document.cookie.split(';').forEach(function (c) {
        var name = c.split('=')[0].trim();
        if (name.indexOf('_ga') !== 0) return;
        ['/', location.pathname].forEach(function (path) {
          [host, '.' + host, undefined].forEach(function (domain) {
            document.cookie =
              name +
              '=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=' +
              path +
              (domain ? '; domain=' + domain : '');
          });
        });
      });
    }

    var prior = choice;
    if (prior && prior.state === 'granted') grant();

    function show() {
      var el = document.getElementById('consent-banner');
      if (!el) return;
      el.querySelector('[data-consent-analytics]').checked = !!choice && choice.state === 'granted';
      el.querySelector('[data-consent-linkedin]').checked = !!choice && choice.marketing === true;
      el.querySelector('[data-consent-details]').open = false;
      el.hidden = false;
      document.documentElement.setAttribute('data-consent-open', '');
      /* The dialog, never the Accept button: focusing one of two equal
         options pre-selects it for anyone pressing Enter. */
      el.focus({ preventScroll: true });
    }

    function hide() {
      var el = document.getElementById('consent-banner');
      if (el) el.hidden = true;
      document.documentElement.removeAttribute('data-consent-open');
    }

    function answer(state, marketing) {
      var reload = (loaded && state !== 'granted') || (window.lmLinkedInNeedsReload && window.lmLinkedInNeedsReload() && !marketing);
      save(state, marketing);
      if (state === 'granted') grant();
      else {
        gtag('consent', 'update', { analytics_storage: 'denied' });
        clearGaCookies();
      }
      if (!marketing) {
        var host = location.hostname.replace(/^www\./, '');
        document.cookie.split(';').forEach(function (c) {
          var name = c.split('=')[0].trim();
          if (name.indexOf('li_') !== 0) return;
          [host, '.' + host, undefined].forEach(function (domain) {
            document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/' + (domain ? '; domain=' + domain : '');
          });
        });
        try { ['li_adsid', 'li_adsId'].forEach(function (key) { localStorage.removeItem(key); }); } catch (e) {}
      }
      hide();
      if (reload) {
        window.dispatchEvent(new Event('lm:before-consent-reload'));
        location.reload();
      } else window.dispatchEvent(new Event('lm:consent-changed'));
    }

    function wire() {
      var el = document.getElementById('consent-banner');
      if (!el) return;
      el.querySelector('[data-consent-accept]').addEventListener('click', function () {
        answer('granted', true);
      });
      el.querySelector('[data-consent-reject]').addEventListener('click', function () {
        answer('denied', false);
      });
      el.querySelector('[data-consent-save]').addEventListener('click', function () {
        answer(el.querySelector('[data-consent-analytics]').checked ? 'granted' : 'denied', el.querySelector('[data-consent-linkedin]').checked);
      });
      /* Any [data-consent-reopen] anywhere on the site, wired from here. */
      document.querySelectorAll('[data-consent-reopen]').forEach(function (btn) {
        btn.addEventListener('click', function () {
          show();
        });
      });
      if (!stored()) show();
    }

    /* Withdrawal has to be as easy as giving; footer + /cookies/ use these. */
    window.lmConsentReopen = function () {
      show();
    };
    window.lmConsentState = function () {
      return choice ? choice.state : null;
    };

    window.lmLinkedInConsentState = function () { return choice ? (choice.marketing === true ? 'granted' : 'denied') : null; };

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', wire);
    } else {
      wire();
    }
  })();
})();
}
