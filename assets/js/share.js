/* ==========================================================================
   Dad Jokes VIP — Shared Sharing Utilities
   ==========================================================================

   Provides copy, native share, Twitter share, and toast functionality
   used consistently across all pages.

   Usage:
     <script src="/assets/js/share.js"></script>

   API:
     DadJokesShare.copyText(text, buttonEl)  — Copy text, animate button
     DadJokesShare.shareNative(title, text, url) — Web Share API with fallback
     DadJokesShare.shareTwitter(text, url)  — Open Twitter/X share
     DadJokesShare.showToast(message, duration) — Show pill notification

   ========================================================================== */

(function () {
  'use strict';

  /* ---------- Toast singleton ---------- */

  var toastEl = null;
  var toastTimer = null;

  /**
   * Get or create the toast element (lazy init).
   * @returns {HTMLElement}
   */
  function getToast() {
    if (toastEl) return toastEl;

    toastEl = document.createElement('div');
    toastEl.className = 'toast';
    toastEl.setAttribute('role', 'status');
    toastEl.setAttribute('aria-live', 'polite');
    document.body.appendChild(toastEl);

    return toastEl;
  }


  /* ---------- SVG icons (inline, no external deps) ---------- */

  var ICON_COPY =
    '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
      '<rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>' +
      '<path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>' +
    '</svg>';

  var ICON_CHECK =
    '<svg class="share-btn-icon--check" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">' +
      '<polyline points="20 6 9 17 4 12"/>' +
    '</svg>';


  /* ==========================================================================
     Public API
     ========================================================================== */

  window.DadJokesShare = {

    /**
     * Copy text to clipboard with animated button feedback.
     *
     * @param {string}      text      - The text to copy
     * @param {HTMLElement}  [buttonEl] - The button to animate (optional)
     */
    copyText: function (text, buttonEl) {
      // Modern Clipboard API
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(function () {
          onCopySuccess(buttonEl);
        }).catch(function () {
          fallbackCopy(text, buttonEl);
        });
      } else {
        fallbackCopy(text, buttonEl);
      }
    },

    /**
     * Share via the Web Share API (mobile-native sharing).
     * Falls back to copying the URL if Web Share is unavailable.
     *
     * @param {string} title - Share title
     * @param {string} text  - Share text/body
     * @param {string} url   - URL to share
     */
    shareNative: function (title, text, url) {
      if (navigator.share) {
        navigator.share({
          title: title,
          text: text,
          url: url
        }).catch(function (err) {
          // User cancelled — that's fine, don't show an error
          if (err.name !== 'AbortError') {
            console.warn('[DadJokesShare] Native share failed:', err);
          }
        });
      } else {
        // Fallback: copy the URL
        this.copyText(url || text);
        this.showToast('Link copied!');
      }
    },

    /**
     * Share to Twitter/X. Opens a new window with pre-filled tweet.
     *
     * @param {string} text - Tweet text
     * @param {string} [url] - URL to include
     */
    shareTwitter: function (text, url) {
      var tweetUrl = 'https://twitter.com/intent/tweet?text=' +
        encodeURIComponent(text);

      if (url) {
        tweetUrl += '&url=' + encodeURIComponent(url);
      }

      window.open(tweetUrl, '_blank', 'width=550,height=420,noopener,noreferrer');
    },

    /**
     * Show a small pill-shaped toast notification.
     * Slides up from the bottom, stays for the given duration, then slides out.
     *
     * @param {string} message  - Message to display
     * @param {number} [duration=2000] - How long to show (ms)
     */
    showToast: function (message, duration) {
      duration = duration || 2000;

      var toast = getToast();
      toast.textContent = message;

      // Clear any existing timer
      if (toastTimer) {
        clearTimeout(toastTimer);
      }

      // Force reflow so transition fires even if already visible
      toast.classList.remove('visible');
      void toast.offsetHeight;

      // Show
      toast.classList.add('visible');

      // Hide after duration
      toastTimer = setTimeout(function () {
        toast.classList.remove('visible');
        toastTimer = null;
      }, duration);
    },

    /**
     * Initialize native share buttons on the page.
     * Shows buttons with class `share-btn--native` only if Web Share API exists.
     */
    initNativeShareButtons: function () {
      if (navigator.share) {
        var buttons = document.querySelectorAll('.share-btn--native');
        for (var i = 0; i < buttons.length; i++) {
          buttons[i].classList.add('visible');
        }
      }
    }
  };


  /* ==========================================================================
     Internal Helpers
     ========================================================================== */

  /**
   * Handle successful copy — animate button and show toast.
   */
  function onCopySuccess(buttonEl) {
    // Haptic feedback if available
    if (navigator.vibrate) {
      try { navigator.vibrate(10); } catch (e) { /* noop */ }
    }

    // Show toast
    window.DadJokesShare.showToast('Copied!');

    // Animate the button if provided
    if (buttonEl) {
      var originalHTML = buttonEl.innerHTML;
      var originalWidth = buttonEl.offsetWidth;

      // Lock width to prevent layout shift
      buttonEl.style.minWidth = originalWidth + 'px';
      buttonEl.innerHTML = ICON_CHECK + ' Copied!';
      buttonEl.classList.add('copied');

      setTimeout(function () {
        buttonEl.innerHTML = originalHTML;
        buttonEl.classList.remove('copied');
        buttonEl.style.minWidth = '';
      }, 2000);
    }
  }

  /**
   * Fallback copy using a temporary textarea (for older browsers).
   */
  function fallbackCopy(text, buttonEl) {
    var textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();

    try {
      var ok = document.execCommand('copy');
      if (ok) {
        onCopySuccess(buttonEl);
      } else {
        window.DadJokesShare.showToast('Copy failed — try manually');
      }
    } catch (e) {
      window.DadJokesShare.showToast('Copy failed — try manually');
    }

    document.body.removeChild(textarea);
  }


  /* ==========================================================================
     Auto-init on DOM ready
     ========================================================================== */

  function onReady() {
    // Show native share buttons if the API is available
    window.DadJokesShare.initNativeShareButtons();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', onReady);
  } else {
    onReady();
  }

})();
