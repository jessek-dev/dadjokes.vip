/**
 * Dad Jokes — Daily Joke Embed Widget
 *
 * Usage:
 *   <div id="dadjoke-widget"></div>
 *   <script src="https://dadjokes.vip/embed/embed.js"></script>
 *
 * Options (data attributes on the div):
 *   data-theme="light" (default) or "dark"
 */
(function() {
  'use strict';

  var ENDPOINT = 'https://dadjokes.vip/embed/daily.json';
  var SITE_URL = 'https://dadjokes.vip';
  var APP_URL = 'https://apps.apple.com/app/id6743726261';

  // Find the widget container
  var container = document.getElementById('dadjoke-widget');
  if (!container) return;

  var theme = container.getAttribute('data-theme') || 'light';

  // Styles
  var colors = theme === 'dark'
    ? { bg: '#1E3A5F', text: '#fff', dim: 'rgba(255,255,255,0.6)', border: 'rgba(255,255,255,0.1)', punch: '#FF9B9B', link: '#FF9B9B', reveal: 'rgba(255,255,255,0.5)', revealHover: 'rgba(255,255,255,0.8)' }
    : { bg: '#fff', text: '#1A1A2E', dim: '#8E8E9A', border: '#ECEAE6', punch: '#FF6B6B', link: '#FF6B6B', reveal: '#8E8E9A', revealHover: '#1A1A2E' };

  // Create shadow DOM for style isolation
  var shadow;
  if (container.attachShadow) {
    shadow = container.attachShadow({ mode: 'open' });
  } else {
    shadow = container; // Fallback for old browsers
  }

  // Render loading state
  shadow.innerHTML = '<div style="font-family:-apple-system,system-ui,sans-serif;padding:20px;text-align:center;color:' + colors.dim + ';font-size:14px;">Loading joke...</div>';

  // Fetch daily joke
  fetch(ENDPOINT)
    .then(function(r) { return r.json(); })
    .then(function(joke) { render(joke); })
    .catch(function() { shadow.innerHTML = '<div style="padding:16px;text-align:center;color:#999;font-size:13px;">Could not load joke</div>'; });

  function render(joke) {
    var id = 'dj-' + Math.random().toString(36).substr(2, 6);

    shadow.innerHTML = '' +
      '<style>' +
        '#' + id + '{font-family:-apple-system,system-ui,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;' +
          'background:' + colors.bg + ';border:1px solid ' + colors.border + ';border-radius:16px;padding:24px 20px 16px;max-width:400px;text-align:center;box-sizing:border-box;}' +
        '#' + id + ' .dj-label{font-size:11px;font-weight:700;letter-spacing:0.05em;text-transform:uppercase;color:' + colors.dim + ';margin-bottom:14px;}' +
        '#' + id + ' .dj-setup{font-size:18px;font-weight:700;line-height:1.45;color:' + colors.text + ';margin-bottom:12px;}' +
        '#' + id + ' .dj-punch{font-size:16px;font-weight:800;line-height:1.4;color:' + colors.punch + ';margin-bottom:12px;display:none;}' +
        '#' + id + ' .dj-reveal{background:none;border:none;cursor:pointer;font-family:inherit;font-size:13px;font-weight:600;color:' + colors.reveal + ';padding:6px 0;-webkit-tap-highlight-color:transparent;}' +
        '#' + id + ' .dj-reveal:hover{color:' + colors.revealHover + ';}' +
        '#' + id + ' .dj-footer{margin-top:14px;padding-top:12px;border-top:1px solid ' + colors.border + ';font-size:11px;}' +
        '#' + id + ' .dj-footer a{color:' + colors.link + ';text-decoration:none;font-weight:600;}' +
        '#' + id + ' .dj-footer a:hover{text-decoration:underline;}' +
      '</style>' +
      '<div id="' + id + '">' +
        '<div class="dj-label">Dad Joke of the Day</div>' +
        '<div class="dj-setup">' + escapeHtml(joke.setup) + '</div>' +
        '<div class="dj-punch" id="' + id + '-punch">' + escapeHtml(joke.punchline) + '</div>' +
        '<button class="dj-reveal" id="' + id + '-btn" onclick="this.style.display=\'none\';document.getElementById(\'' + id + '-punch\').style.display=\'block\';">&#9660; Tap for punchline</button>' +
        '<div class="dj-footer">' +
          'Powered by <a href="' + SITE_URL + '/daily/" target="_blank" rel="noopener">Dad Jokes</a>' +
        '</div>' +
      '</div>';

    // Shadow DOM onclick won't work with inline handlers — attach manually
    var btn = shadow.getElementById(id + '-btn');
    var punch = shadow.getElementById(id + '-punch');
    if (btn && punch) {
      btn.addEventListener('click', function() {
        punch.style.display = 'block';
        btn.style.display = 'none';
      });
    }
  }

  function escapeHtml(str) {
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
})();
