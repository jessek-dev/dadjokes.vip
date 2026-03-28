/* ==========================================================================
   Dad Jokes VIP — Mixpanel Tracking Module
   ==========================================================================

   Initializes the Mixpanel JS SDK and provides a clean tracking API that
   mirrors the event naming conventions used in the Flutter app.

   Usage:
     <script src="/assets/js/tracking.js"></script>

   API:
     DadJokesTracking.track(eventName, properties)
     DadJokesTracking.identify(userId)
     DadJokesTracking.setUserProperties(props)

   Every event automatically includes:
     - platform: 'web'
     - page_type: (auto-detected from URL)
     - page_url: current URL

   ========================================================================== */

(function () {
  'use strict';

  /* ---------- Mixpanel CDN Snippet ---------- */
  if (typeof mixpanel === 'undefined') {
    (function(c,a){if(!a.__SV){var b,d,h,e;window.mixpanel=a;a._i=[];a.init=function(b,d,g){function c(a,b){var d=b.split(".");2==d.length&&(a=a[d[0]],b=d[1]);a[b]=function(){a.push([b].concat(Array.prototype.slice.call(arguments,0)))}}var f=a;"undefined"!==typeof g?f=a[g]=[]:g="mixpanel";f.people=f.people||[];f.toString=function(a){var b="mixpanel";"mixpanel"!==g&&(b+="."+g);a||(b+=" (stub)");return b};f.people.toString=function(){return f.toString(1)+".people (stub)"};h="disable track track_pageview track_links track_forms register register_once alias unregister identify name_tag set_config people.set people.set_once people.increment people.append people.union people.track_charge people.clear_charges people.delete_user".split(" ");for(e=0;e<h.length;e++)c(f,h[e]);a._i.push([b,d,g])};a.__SV=1.2;}})(document,window.mixpanel||[]);
  }

  /* ---------- Configuration ---------- */
  var MIXPANEL_TOKEN = '62127065033cd52e52a7437836f57514';

  /* ---------- Initialize Mixpanel ---------- */
  mixpanel.init(MIXPANEL_TOKEN, {
    debug: false,
    track_pageview: false,   // We handle page views manually
    persistence: 'localStorage'
  });

  /* ---------- Detect page type from URL ---------- */
  function detectPageType() {
    var path = window.location.pathname;
    if (path.indexOf('/daily') === 0)      return 'daily';
    if (path.indexOf('/random') === 0)     return 'random';
    if (path.indexOf('/roast') === 0)      return 'roast';
    if (path.indexOf('/battle') === 0)     return 'battle';
    if (path.indexOf('/joke/') === 0)      return 'joke_detail';
    if (path.indexOf('/jokes') === 0)      return 'joke_browse';
    if (path.indexOf('/collection') === 0) return 'collection';
    if (path.indexOf('/category') === 0)   return 'category';
    if (path.indexOf('/app') === 0)        return 'app_page';
    if (path.indexOf('/privacy') === 0)    return 'privacy';
    if (path.indexOf('/support') === 0)    return 'support';
    if (path === '/' || path === '/index.html') return 'landing';
    return 'general';
  }

  var pageType = detectPageType();

  /* ---------- Default properties injected into every event ---------- */
  function defaultProps() {
    return {
      platform: 'web',
      page_type: pageType,
      page_url: window.location.href
    };
  }

  /* ==========================================================================
     Public API — window.DadJokesTracking
     ========================================================================== */

  window.DadJokesTracking = {

    /**
     * Track an event with automatic default properties merged in.
     *
     * @param {string} eventName  - snake_case event name
     * @param {Object} [props]    - Additional properties
     */
    track: function (eventName, props) {
      var merged = defaultProps();
      if (props) {
        for (var key in props) {
          if (props.hasOwnProperty(key)) {
            merged[key] = props[key];
          }
        }
      }

      try {
        mixpanel.track(eventName, merged);
      } catch (e) {
        console.warn('[DadJokesTracking] Failed to track:', eventName, e);
      }
    },

    /**
     * Identify a user (call after sign-in).
     * @param {string} userId
     */
    identify: function (userId) {
      try {
        mixpanel.identify(userId);
      } catch (e) { /* noop */ }
    },

    /**
     * Set user profile properties.
     * @param {Object} props
     */
    setUserProperties: function (props) {
      try {
        mixpanel.people.set(props);
      } catch (e) { /* noop */ }
    },

    /**
     * Get the auto-detected page type.
     * @returns {string}
     */
    getPageType: function () {
      return pageType;
    }
  };

  /* ---------- Auto-track page view on load ---------- */
  function trackPageView() {
    DadJokesTracking.track('page_viewed', {
      page_title: document.title,
      referrer: document.referrer
    });

    // Set people properties for last visit
    try {
      mixpanel.people.set({
        'Last Web Visit': new Date().toISOString(),
        'Last Page Type': pageType
      });
    } catch (e) { /* noop */ }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', trackPageView);
  } else {
    trackPageView();
  }

})();
