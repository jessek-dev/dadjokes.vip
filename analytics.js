// Dad Jokes Analytics - Shared Configuration
// To be included on all pages for consistent tracking

// Analytics Configuration
const DADJOKES_ANALYTICS = {
  mixpanel: {
    token: '62127065033cd52e52a7437836f57514',
    debug: true
  },
  ga4: {
    measurementId: 'G-JRRXTJP94X'
  },
  gtm: {
    containerId: 'GTM-KV6S6MZ6'
  }
};

// Initialize Mixpanel if not already loaded
if (typeof mixpanel === 'undefined') {
  (function(c,a){if(!a.__SV){var b,d,h,e;window.mixpanel=a;a._i=[];a.init=function(b,d,g){function c(a,b){var d=b.split(".");2==d.length&&(a=a[d[0]],b=d[1]);a[b]=function(){a.push([b].concat(Array.prototype.slice.call(arguments,0)))}}var f=a;"undefined"!==typeof g?f=a[g]=[]:g="mixpanel";f.people=f.people||[];f.toString=function(a){var b="mixpanel";"mixpanel"!==g&&(b+="."+g);a||(b+=" (stub)");return b};f.people.toString=function(){return f.toString(1)+".people (stub)"};h="disable track track_pageview track_links track_forms register register_once alias unregister identify name_tag set_config people.set people.set_once people.increment people.append people.union people.track_charge people.clear_charges people.delete_user".split(" ");for(e=0;e<h.length;e++)c(f,h[e]);a._i.push([b,d,g])};a.__SV=1.2;}})(document,window.mixpanel||[]);

  // Initialize Mixpanel
  mixpanel.init(DADJOKES_ANALYTICS.mixpanel.token, {
    debug: DADJOKES_ANALYTICS.mixpanel.debug,
    track_pageview: true,
    persistence: 'localStorage'
  });
}

// Standard page tracking
function trackPageView(pageType = 'general') {
  const pageData = {
    page_title: document.title,
    page_url: window.location.href,
    page_type: pageType,
    referrer: document.referrer,
    user_agent: navigator.userAgent,
    timestamp: new Date().toISOString()
  };

  // Mixpanel tracking
  mixpanel.track('Page View', pageData);

  // Set user properties
  mixpanel.people.set({
    '$browser': navigator.userAgent,
    '$current_url': window.location.href,
    'Page Title': document.title,
    'Visit Date': new Date().toISOString().split('T')[0]
  });

  // GTM dataLayer push
  if (typeof window.dataLayer !== 'undefined') {
    window.dataLayer.push({
      event: 'page_view',
      page_type: pageType,
      page_title: document.title
    });
  }
}

// Track link clicks (especially external links)
function trackLinkClick(linkText, linkUrl, linkType = 'internal') {
  mixpanel.track('Link Clicked', {
    link_text: linkText,
    link_url: linkUrl,
    link_type: linkType,
    page_url: window.location.href,
    timestamp: new Date().toISOString()
  });

  if (typeof window.dataLayer !== 'undefined') {
    window.dataLayer.push({
      event: 'link_click',
      link_type: linkType,
      link_url: linkUrl
    });
  }
}

// Auto-initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  // Determine page type from URL
  const path = window.location.pathname;
  let pageType = 'general';
  
  if (path === '/' || path === '/index.html') pageType = 'landing';
  else if (path.includes('/app')) pageType = 'app_page';
  else if (path.includes('/privacy')) pageType = 'privacy';
  else if (path.includes('/support')) pageType = 'support';
  else if (path.includes('/ios')) pageType = 'ios_redirect';
  else if (path.includes('/android')) pageType = 'android_redirect';

  // Track page view
  trackPageView(pageType);

  // Auto-track external links
  document.querySelectorAll('a[href]').forEach(function(link) {
    link.addEventListener('click', function() {
      const href = link.getAttribute('href');
      const text = link.textContent || link.innerHTML;
      const isExternal = href.startsWith('http') && !href.includes('dadjokes.vip');
      
      trackLinkClick(text, href, isExternal ? 'external' : 'internal');
    });
  });

  console.log('🔍 Dad Jokes Analytics loaded for:', pageType);
});