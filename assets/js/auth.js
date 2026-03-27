/* ==========================================================================
   Dad Jokes VIP — Firebase Auth + Content Gate
   ==========================================================================

   Handles:
   1. Firebase initialization
   2. Google Sign-In via popup
   3. Content gating after 3 free page views
   4. Persistent auth state via Firebase + localStorage cache
   5. GA4 event tracking for sign-ups

   Usage:
     <script src="https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js"></script>
     <script src="https://www.gstatic.com/firebasejs/10.12.0/firebase-auth-compat.js"></script>
     <script src="https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore-compat.js"></script>
     <script src="/assets/js/auth.js"></script>

   Pages call:
     DadJokesAuth.gateContent({ totalItems: 50, itemLabel: 'jokes about Jessica' });

   ========================================================================== */

(function () {
  'use strict';

  /* ---------- Firebase Config ---------- */
  var firebaseConfig = {
    apiKey: "AIzaSyBXlF5rNZJk42zLA7A-A7N9QcuqOmECzUk",
    authDomain: "dad-jokes-76c85.firebaseapp.com",
    projectId: "dad-jokes-76c85",
    storageBucket: "dad-jokes-76c85.firebasestorage.app",
    messagingSenderId: "165634926020",
    appId: "1:165634926020:web:3f8ad9f397da9c3574f091",
    measurementId: "G-7DJD06WV2R"
  };

  /* ---------- Constants ---------- */
  var STORAGE_KEY_VIEWS = 'dj_views';
  var STORAGE_KEY_USER = 'dj_user';
  var FREE_VIEWS = 3;

  /* ---------- Initialize Firebase (only once) ---------- */
  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  }

  var auth = firebase.auth();
  var db = null;

  // Initialize Firestore lazily (only when needed)
  function getDb() {
    if (!db && firebase.firestore) {
      db = firebase.firestore();
    }
    return db;
  }


  /* ==========================================================================
     View Tracking
     ========================================================================== */

  /**
   * Get the current view count from localStorage.
   * @returns {number}
   */
  function getViewCount() {
    try {
      var count = parseInt(localStorage.getItem(STORAGE_KEY_VIEWS), 10);
      return isNaN(count) ? 0 : count;
    } catch (e) {
      return 0;
    }
  }

  /**
   * Increment the view counter. Call this on each gated page load.
   * @returns {number} The new count.
   */
  function incrementViews() {
    var count = getViewCount() + 1;
    try {
      localStorage.setItem(STORAGE_KEY_VIEWS, count.toString());
    } catch (e) {
      // localStorage might be full or blocked — fail silently
    }
    return count;
  }

  /**
   * Reset the view counter (called on sign-in).
   */
  function resetViews() {
    try {
      localStorage.removeItem(STORAGE_KEY_VIEWS);
    } catch (e) { /* noop */ }
  }


  /* ==========================================================================
     Cached User (fast check without waiting for Firebase)
     ========================================================================== */

  function getCachedUser() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY_USER);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  function setCachedUser(user) {
    try {
      if (user) {
        localStorage.setItem(STORAGE_KEY_USER, JSON.stringify({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL
        }));
      } else {
        localStorage.removeItem(STORAGE_KEY_USER);
      }
    } catch (e) { /* noop */ }
  }


  /* ==========================================================================
     Auth Gate DOM
     ========================================================================== */

  /**
   * Build and inject the auth gate overlay into the page.
   * @param {Object} opts
   * @param {number} opts.viewCount     - How many items the user has seen
   * @param {number} opts.totalItems    - Total items available (for messaging)
   * @param {string} opts.itemLabel     - e.g. "jokes about Jessica"
   */
  function createGateOverlay(opts) {
    var viewCount = opts.viewCount || FREE_VIEWS;
    var totalItems = opts.totalItems || 'hundreds of';
    var itemLabel = opts.itemLabel || 'jokes';

    // Don't create a duplicate
    if (document.querySelector('.auth-gate')) return;

    var overlay = document.createElement('div');
    overlay.className = 'auth-gate active';
    overlay.id = 'auth-gate';

    overlay.innerHTML =
      '<div class="auth-gate-backdrop"></div>' +
      '<div class="auth-gate-card">' +
        '<button class="auth-gate-dismiss" id="auth-gate-dismiss" aria-label="Dismiss">&times;</button>' +
        '<div class="auth-gate-emoji">' +
          '<span role="img" aria-label="Laughing face">&#128514;</span>' +
        '</div>' +
        '<h2 class="auth-gate-title">Sign in to keep reading</h2>' +
        '<p class="auth-gate-subtitle">' +
          'You\'ve seen ' + viewCount + ' of ' + totalItems + ' ' + itemLabel + '. ' +
          'Sign in free to unlock them all.' +
        '</p>' +
        '<button class="google-signin-btn" id="google-signin-btn">' +
          '<svg viewBox="0 0 24 24" width="20" height="20">' +
            '<path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>' +
            '<path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>' +
            '<path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>' +
            '<path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>' +
          '</svg>' +
          'Continue with Google' +
        '</button>' +
        '<div class="auth-gate-divider">or</div>' +
        '<p class="auth-gate-app-link">' +
          'Get the full experience in the ' +
          '<a href="https://apps.apple.com/app/id6743726261" target="_blank" rel="noopener">Dad Jokes app</a>' +
        '</p>' +
      '</div>';

    document.body.appendChild(overlay);

    // Prevent background scrolling
    document.body.style.overflow = 'hidden';

    // Bind events
    document.getElementById('google-signin-btn').addEventListener('click', handleGoogleSignIn);

    document.getElementById('auth-gate-dismiss').addEventListener('click', function () {
      dismissGate();
    });

    // Close on backdrop click
    overlay.querySelector('.auth-gate-backdrop').addEventListener('click', function () {
      dismissGate();
    });
  }

  /**
   * Remove the auth gate overlay.
   */
  function removeGate() {
    var gate = document.getElementById('auth-gate');
    if (gate) {
      gate.classList.remove('active');
      // Wait for CSS transition, then remove from DOM
      setTimeout(function () {
        if (gate.parentNode) gate.parentNode.removeChild(gate);
      }, 350);
    }
    document.body.style.overflow = '';
  }

  /**
   * Dismiss the gate (user doesn't want to sign in).
   * Redirects to app store instead of just closing.
   */
  function dismissGate() {
    var gate = document.getElementById('auth-gate');
    if (!gate) return;

    // Replace the card content with an app CTA
    var card = gate.querySelector('.auth-gate-card');
    if (card) {
      card.innerHTML =
        '<button class="auth-gate-dismiss" id="auth-gate-dismiss-final" aria-label="Close">&times;</button>' +
        '<div class="auth-gate-emoji">' +
          '<span role="img" aria-label="Phone">&#128241;</span>' +
        '</div>' +
        '<h2 class="auth-gate-title">Get the app instead</h2>' +
        '<p class="auth-gate-subtitle">' +
          'Unlimited jokes, daily notifications, and personalized roasts — all free.' +
        '</p>' +
        '<a href="https://apps.apple.com/app/id6743726261" target="_blank" rel="noopener" class="btn btn-cta btn-block">' +
          'Download Free' +
        '</a>' +
        '<br>' +
        '<button class="btn btn-ghost btn-block" id="auth-gate-close-final" style="min-height:40px;font-size:0.875rem;">No thanks</button>';

      // Bind close on the final dismiss
      document.getElementById('auth-gate-dismiss-final').addEventListener('click', function () {
        removeGate();
      });
      document.getElementById('auth-gate-close-final').addEventListener('click', function () {
        removeGate();
      });
    }
  }


  /* ==========================================================================
     Google Sign-In
     ========================================================================== */

  function handleGoogleSignIn() {
    var provider = new firebase.auth.GoogleAuthProvider();

    // Prefer popup on desktop, redirect on mobile (popup blockers are common)
    var isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    var signInPromise;
    if (isMobile) {
      signInPromise = auth.signInWithRedirect(provider).then(function () {
        return auth.getRedirectResult();
      });
    } else {
      signInPromise = auth.signInWithPopup(provider);
    }

    signInPromise
      .then(function (result) {
        onSignInSuccess(result.user, result.additionalUserInfo);
      })
      .catch(function (error) {
        console.warn('[DadJokesAuth] Sign-in error:', error.code, error.message);

        // If popup was blocked, fall back to redirect
        if (error.code === 'auth/popup-blocked') {
          auth.signInWithRedirect(provider);
        }
      });
  }

  /**
   * Handle successful sign-in.
   */
  function onSignInSuccess(user, additionalUserInfo) {
    if (!user) return;

    // Cache user locally
    setCachedUser(user);

    // Reset view counter — signed-in users have unlimited access
    resetViews();

    // Remove the gate overlay
    removeGate();

    // Track sign-up event in GA4
    if (typeof gtag === 'function') {
      gtag('event', 'web_signup', {
        method: 'Google',
        user_uid: user.uid,
        is_new_user: additionalUserInfo ? additionalUserInfo.isNewUser : false
      });
    }

    // Write to Firestore (non-blocking)
    try {
      var firestore = getDb();
      if (firestore) {
        firestore.collection('users').doc(user.uid).set({
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          webSignup: true,
          webSignupAt: firebase.firestore.FieldValue.serverTimestamp(),
          lastWebVisit: firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
      }
    } catch (e) {
      console.warn('[DadJokesAuth] Firestore write failed:', e);
    }

    // Notify any listeners
    if (typeof window._onDadJokesAuth === 'function') {
      window._onDadJokesAuth(user);
    }
  }


  /* ==========================================================================
     Auth State Listener
     ========================================================================== */

  // Listen for Firebase auth state changes
  auth.onAuthStateChanged(function (user) {
    if (user) {
      setCachedUser(user);
      resetViews();
      removeGate();

      // Update last visit timestamp (non-blocking)
      try {
        var firestore = getDb();
        if (firestore) {
          firestore.collection('users').doc(user.uid).set({
            lastWebVisit: firebase.firestore.FieldValue.serverTimestamp()
          }, { merge: true });
        }
      } catch (e) { /* noop */ }
    } else {
      setCachedUser(null);
    }
  });

  // Handle redirect result on page load (for mobile sign-in flow)
  auth.getRedirectResult().then(function (result) {
    if (result && result.user) {
      onSignInSuccess(result.user, result.additionalUserInfo);
    }
  }).catch(function (error) {
    if (error.code !== 'auth/credential-already-in-use') {
      console.warn('[DadJokesAuth] Redirect result error:', error.code);
    }
  });


  /* ==========================================================================
     Public API — window.DadJokesAuth
     ========================================================================== */

  window.DadJokesAuth = {

    /**
     * Check if the user is currently signed in.
     * Uses cached value for speed; Firebase will update async.
     * @returns {boolean}
     */
    isSignedIn: function () {
      return !!(auth.currentUser || getCachedUser());
    },

    /**
     * Get the current user object (cached or live).
     * @returns {Object|null}
     */
    getUser: function () {
      var live = auth.currentUser;
      if (live) {
        return {
          uid: live.uid,
          email: live.email,
          displayName: live.displayName,
          photoURL: live.photoURL
        };
      }
      return getCachedUser();
    },

    /**
     * Trigger Google Sign-In manually.
     */
    signIn: function () {
      handleGoogleSignIn();
    },

    /**
     * Sign out.
     */
    signOut: function () {
      auth.signOut().then(function () {
        setCachedUser(null);
        // Optionally reload so gate appears again
        window.location.reload();
      });
    },

    /**
     * Record a content view and show the gate if threshold is met.
     * Call this on every gated page (joke page, roast page, etc.).
     *
     * @param {Object}  opts
     * @param {number}  [opts.totalItems]   - Total items available (for messaging)
     * @param {string}  [opts.itemLabel]    - e.g. "jokes about Jessica"
     * @param {number}  [opts.freeViews]    - Override default free view count
     * @returns {boolean} true if content is gated (user should not see it)
     */
    gateContent: function (opts) {
      opts = opts || {};

      // Signed-in users bypass the gate entirely
      if (this.isSignedIn()) {
        return false;
      }

      var threshold = opts.freeViews || FREE_VIEWS;
      var views = incrementViews();

      if (views > threshold) {
        createGateOverlay({
          viewCount: views,
          totalItems: opts.totalItems,
          itemLabel: opts.itemLabel
        });
        return true;
      }

      return false;
    },

    /**
     * Get the current view count without incrementing.
     * @returns {number}
     */
    getViewCount: function () {
      return getViewCount();
    },

    /**
     * Register a callback for when auth state changes.
     * @param {Function} callback - receives (user) or (null)
     */
    onAuthChange: function (callback) {
      auth.onAuthStateChanged(function (user) {
        callback(user ? {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL
        } : null);
      });
    }
  };

})();
