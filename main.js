// ---------------------------------------------------------------------------
// MONEY SETTINGS: paste your links here, then push. Nothing else to change.
// Leave a link empty ('') and its buttons fall back to the launch list or the
// contact form, so the site never shows a broken button.
var SETTINGS = {
  // Checkout links: Stripe Payment Links or Lemon Squeezy checkout links.
  checkout: {
    guide: 'https://buy.stripe.com/4gMaEX2Fg084ei2dU387K00',      // The AI Client Playbook, $29
    templates: 'https://buy.stripe.com/4gM8wPenY8EAei2dU387K01',  // The AI Client Kit, $49
    bundle: 'https://buy.stripe.com/eVq5kDgw6aMI1vgdU387K02'      // Playbook + Kit bundle, $59
  },
  // Booking link for discovery calls (Calendly, Cal.com, TidyCal, etc.)
  booking: 'https://cal.com/denise-cullom/discovery-call',
  // Google Analytics 4 measurement ID (looks like 'G-XXXXXXXXXX'). Empty = off.
  analytics: 'G-XB3F9LCWN7'
};
// ---------------------------------------------------------------------------

// Google Analytics: loads only when SETTINGS.analytics has an ID.
// track() is safe to call either way; it does nothing when analytics is off.
var PRODUCTS = {
  guide: { item_id: 'guide', item_name: 'The AI Client Playbook', price: 29 },
  templates: { item_id: 'templates', item_name: 'The AI Client Kit', price: 49 },
  bundle: { item_id: 'bundle', item_name: 'Playbook + Kit bundle', price: 59 }
};
window.dataLayer = window.dataLayer || [];
function gtag() { window.dataLayer.push(arguments); }
function track(name, params) {
  if (SETTINGS.analytics) gtag('event', name, params || {});
}
if (SETTINGS.analytics) {
  var ga = document.createElement('script');
  ga.async = true;
  ga.src = 'https://www.googletagmanager.com/gtag/js?id=' + SETTINGS.analytics;
  document.head.appendChild(ga);
  gtag('js', new Date());
  gtag('config', SETTINGS.analytics);
}

// Purchases: Stripe sends buyers to /thanks/playbook|kit|bundle?session_id=...
// The session ID doubles as the transaction ID, so a reload isn't counted twice.
var thanks = window.location.pathname.match(/^\/thanks\/(playbook|kit|bundle)/);
var sessionId = new URLSearchParams(window.location.search).get('session_id');
if (thanks && sessionId) {
  var bought = PRODUCTS[{ playbook: 'guide', kit: 'templates', bundle: 'bundle' }[thanks[1]]];
  track('purchase', {
    transaction_id: sessionId,
    value: bought.price,
    currency: 'USD',
    items: [bought]
  });
}

// Buy buttons: <a data-buy="guide|templates|bundle">
var hasCheckout = false;
var useLemon = false;
document.querySelectorAll('[data-buy]').forEach(function (btn) {
  var url = SETTINGS.checkout[btn.getAttribute('data-buy')];
  if (!url) return;
  btn.href = url;
  if (url.indexOf('lemonsqueezy.com') !== -1) {
    btn.classList.add('lemonsqueezy-button'); // opens checkout as an overlay
    useLemon = true;
  }
  hasCheckout = true;
  btn.addEventListener('click', function () {
    var item = PRODUCTS[btn.getAttribute('data-buy')];
    track('begin_checkout', { value: item.price, currency: 'USD', items: [item] });
  });
});
if (useLemon) {
  // Lemon Squeezy overlay checkout; without it, links still open the checkout page
  var ls = document.createElement('script');
  ls.src = 'https://app.lemonsqueezy.com/js/lemon.js';
  ls.defer = true;
  document.head.appendChild(ls);
}
if (hasCheckout) {
  // Launch-list sections are only needed until checkout is live
  document.querySelectorAll('[data-prelaunch]').forEach(function (el) { el.hidden = true; });
  // Hide any buy button whose product has no link yet (its launch list is hidden too)
  document.querySelectorAll('[data-buy]').forEach(function (btn) {
    if (!SETTINGS.checkout[btn.getAttribute('data-buy')]) btn.hidden = true;
  });
}

// Booking buttons: <a data-book>
if (SETTINGS.booking) {
  document.querySelectorAll('[data-book]').forEach(function (btn) {
    btn.href = SETTINGS.booking;
    btn.target = '_blank';
    btn.rel = 'noopener';
    btn.addEventListener('click', function () {
      track('book_call_click', { page_path: window.location.pathname });
    });
  });
}

// Footer year
document.querySelectorAll('.year').forEach(function (el) {
  el.textContent = new Date().getFullYear();
});

// Mobile nav
var toggle = document.querySelector('.nav-toggle');
var links = document.getElementById('nav-links');
if (toggle && links) {
  toggle.addEventListener('click', function () {
    var open = links.classList.toggle('open');
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
}

// Pre-select the contact form topic from ?topic=... (e.g. /contact?topic=audit)
var topic = new URLSearchParams(window.location.search).get('topic');
var topicSelect = document.querySelector('select[name="topic"]');
if (topic && topicSelect) {
  Array.prototype.forEach.call(topicSelect.options, function (opt) {
    if (opt.value === topic) topicSelect.value = topic;
  });
}

// Netlify Forms: submit in place and show a message instead of leaving the page.
// Each form has class "js-form"; its success/error messages follow it, marked
// with data-ok and data-error.
document.querySelectorAll('form.js-form').forEach(function (form) {
  var wrap = form.parentElement;
  var ok = wrap.querySelector('[data-ok]');
  var err = wrap.querySelector('[data-error]');
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var button = form.querySelector('button[type="submit"]');
    if (ok) ok.hidden = true;
    if (err) err.hidden = true;
    if (button) button.disabled = true;
    fetch('/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(new FormData(form)).toString()
    }).then(function (res) {
      if (!res.ok) throw new Error(res.status);
      track(form.getAttribute('name') === 'contact' ? 'contact_form_submit' : 'generate_lead', {
        form_name: form.getAttribute('name')
      });
      var next = form.getAttribute('data-next');
      if (next) { window.location.href = next; return; }
      if (ok) ok.hidden = false;
      form.reset();
    }).catch(function () {
      if (err) err.hidden = false;
    }).finally(function () {
      if (button) button.disabled = false;
    });
  });
});

// Copy buttons on the free prompts page
document.querySelectorAll('.prompt .copy').forEach(function (btn) {
  btn.addEventListener('click', function () {
    var text = btn.parentElement.querySelector('.prompt-text').textContent;
    navigator.clipboard.writeText(text).then(function () {
      btn.textContent = 'Copied';
      setTimeout(function () { btn.textContent = 'Copy prompt'; }, 1500);
    });
  });
});
