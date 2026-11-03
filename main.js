// ---------------------------------------------------------------------------
// MONEY SETTINGS: paste your links here, then push. Nothing else to change.
// Leave a link empty ('') and its buttons fall back to the launch list or the
// contact form, so the site never shows a broken button.
var SETTINGS = {
  // Checkout links: Stripe Payment Links or Lemon Squeezy checkout links.
  checkout: {
    guide: 'https://buy.stripe.com/4gMaEX2Fg084ei2dU387K00',   // The AI Client Playbook + Kit, $29
    agents: 'https://buy.stripe.com/4gM00jcfQbQM4Hs17h87K03',  // 20 AI Agents That Pay for Themselves, $49
    bundle: 'https://buy.stripe.com/eVq5kDgw6aMI1vgdU387K02',  // All three, $59
    // Done-for-you client kits for VAs ($39 each, all four $79)
    kit_inbox: 'https://buy.stripe.com/eVq00j93E2gcb5QbLV87K07',    // Inbox & Calendar Kit, $39
    kit_social: 'https://buy.stripe.com/7sY4gz3Jk1c87TEdU387K08',   // Social Content Kit, $39
    kit_books: 'https://buy.stripe.com/00wdR93Jk3kgei203d87K09',    // Bookkeeping Prep Kit, $39
    kit_support: 'https://buy.stripe.com/4gM4gz3Jk2gca1M03d87K0a',  // Customer Support Kit, $39
    kits_all: 'https://buy.stripe.com/7sY00jgw62gcgqa6rB87K0b',     // All four kits, $79
    lab: 'https://buy.stripe.com/5kQaEX0x8f2Yb5QeY787K0c',          // AI VA Lab membership, $29/month (Stripe subscription)
    vacourse: 'https://buy.stripe.com/eVq9AT1Bc8EAei217h87K04'  // The AI-Ready VA Course, $297 (code FOUNDINGVA = $100 off)
  },
  // Affiliate links for the /tools page, by tool: claude, chatgpt, fathom, otter,
  // zapier, calcom, notion, asana, canva. Empty = the plain link to the tool's site.
  affiliate: {
    fathom: '',
    otter: '',
    zapier: '',
    calcom: '',
    notion: '',
    asana: '',
    canva: ''
  },
  // Booking link for discovery calls (Calendly, Cal.com, TidyCal, etc.)
  booking: 'https://cal.com/denise-cullom/discovery-call',
  // Google Analytics 4 measurement ID (looks like 'G-XXXXXXXXXX'). Empty = off.
  analytics: 'G-MSFM4M96VB'
};
// ---------------------------------------------------------------------------

// Google Analytics: loads only when SETTINGS.analytics has an ID.
// track() is safe to call either way; it does nothing when analytics is off.
//
// The funnel, as GA4 event names (see the funnel guide for the GA4 setup):
//   1. page_view           every visit (automatic)
//   2. view_item           a product page: /kits, /guide, /agents, /va-course, /membership
//   3. email_signup        a free download or list signup (also sent as generate_lead)
//   4. begin_checkout      a buy button click
//   5. entry_purchase      a first-step product: kits, Playbook + Kit, Agents, bundle
//   6. upgrade_purchase    the AI-Ready VA Course or the AI VA Lab membership
// Every sale also sends the standard GA4 purchase event, which carries the revenue.
// item_category on each product says which step it belongs to.
var PRODUCTS = {
  guide: { item_id: 'guide', item_name: 'The AI Client Playbook + Kit', price: 29, item_category: 'entry' },
  agents: { item_id: 'agents', item_name: '20 AI Agents That Pay for Themselves', price: 49, item_category: 'entry' },
  bundle: { item_id: 'bundle', item_name: 'The Complete AI Bundle', price: 59, item_category: 'entry' },
  kit_inbox: { item_id: 'kit_inbox', item_name: 'Inbox & Calendar Client Kit', price: 39, item_category: 'entry' },
  kit_social: { item_id: 'kit_social', item_name: 'Social Content Client Kit', price: 39, item_category: 'entry' },
  kit_books: { item_id: 'kit_books', item_name: 'Bookkeeping Prep Client Kit', price: 39, item_category: 'entry' },
  kit_support: { item_id: 'kit_support', item_name: 'Customer Support Client Kit', price: 39, item_category: 'entry' },
  kits_all: { item_id: 'kits_all', item_name: 'All four client kits', price: 79, item_category: 'entry' },
  lab: { item_id: 'lab', item_name: 'AI VA Lab membership (monthly)', price: 29, item_category: 'upgrade' },
  vacourse: { item_id: 'vacourse', item_name: 'The AI-Ready VA Course', price: 297, item_category: 'upgrade' },
  // Retired: the Kit is now part of the guide. Kept so /thanks/kit still records old-link purchases.
  templates: { item_id: 'templates', item_name: 'The AI Client Kit', price: 49, item_category: 'entry' },
  // VA network: one-time fees paid through Stripe links Denise emails after a hire / an approval
  placement: { item_id: 'placement', item_name: 'VA placement fee', price: 400, item_category: 'service' },
  va_listing: { item_id: 'va_listing', item_name: 'VA network listing fee', price: 49, item_category: 'service' }
};
window.dataLayer = window.dataLayer || [];
function gtag() { window.dataLayer.push(arguments); }
function track(name, params) {
  if (SETTINGS.analytics) gtag('event', name, params || {});
}
// track(), then run done() once GA4 has sent the event (or after 1 second),
// for events sent right before the browser leaves the page.
function trackThen(name, params, done) {
  if (!SETTINGS.analytics) { done(); return; }
  var called = false;
  function once() { if (!called) { called = true; done(); } }
  params = params || {};
  params.event_callback = once;
  track(name, params);
  setTimeout(once, 1000);
}
// Browser memory for funnel stage and purchases already counted. Private
// windows can block it, so every use is wrapped and failure is harmless.
function remember(key, value) {
  try {
    if (value === undefined) return window.localStorage.getItem('ve_' + key);
    window.localStorage.setItem('ve_' + key, value);
  } catch (e) { return null; }
}
// Funnel stage as a GA4 user property: lead -> customer -> upgraded. It only
// moves forward, and it is sent with every event from then on.
var STAGES = ['visitor', 'lead', 'customer', 'upgraded'];
function setStage(stage) {
  var current = remember('stage') || 'visitor';
  if (STAGES.indexOf(stage) > STAGES.indexOf(current)) {
    remember('stage', stage);
    current = stage;
  }
  if (SETTINGS.analytics && current !== 'visitor') gtag('set', 'user_properties', { customer_stage: current });
}
if (SETTINGS.analytics) {
  var ga = document.createElement('script');
  ga.async = true;
  ga.src = 'https://www.googletagmanager.com/gtag/js?id=' + SETTINGS.analytics;
  document.head.appendChild(ga);
  gtag('js', new Date());
  setStage('visitor'); // re-sends a stored stage before the first page_view
  gtag('config', SETTINGS.analytics);
}

// Product page views: the step between a visit and a checkout click
var PRODUCT_PAGES = {
  guide: ['guide', 'bundle'],
  agents: ['agents', 'bundle'],
  kits: ['kit_inbox', 'kit_social', 'kit_books', 'kit_support', 'kits_all'],
  'va-course': ['vacourse'],
  membership: ['lab']
};
var productPage = window.location.pathname.match(/^\/([a-z-]+?)(?:\.html)?\/?$/);
if (productPage && PRODUCT_PAGES[productPage[1]]) {
  var viewed = PRODUCT_PAGES[productPage[1]].map(function (k) { return PRODUCTS[k]; });
  track('view_item', { value: viewed[0].price, currency: 'USD', items: viewed });
}

// Purchases: Stripe sends buyers to /thanks/<page>?session_id=...
// The session ID doubles as the transaction ID, so a reload isn't counted twice.
var THANKS = {
  playbook: 'guide', agents: 'agents', kit: 'templates', bundle: 'bundle',
  'kit-inbox': 'kit_inbox', 'kit-social': 'kit_social', 'kit-books': 'kit_books',
  'kit-support': 'kit_support', kits: 'kits_all', lab: 'lab', 'va-course': 'vacourse',
  placement: 'placement', 'va-listing': 'va_listing'
};
var thanks = window.location.pathname.match(/^\/thanks\/([a-z-]+?)(?:\.html)?\/?$/);
if (thanks && !THANKS[thanks[1]]) thanks = null;
var sessionId = new URLSearchParams(window.location.search).get('session_id');
if (thanks && sessionId) {
  var bought = PRODUCTS[THANKS[thanks[1]]];
  var tier = bought.item_category;
  setStage(tier === 'upgrade' ? 'upgraded' : 'customer');
  track('purchase', {
    transaction_id: sessionId,
    value: bought.price,
    currency: 'USD',
    items: [bought]
  });
  // GA4 drops repeat purchase events with the same transaction_id, but not
  // custom events, so remember which sessions this browser already counted.
  var counted = remember('purchases') || '';
  if (counted.indexOf(sessionId) === -1) {
    remember('purchases', (counted + ' ' + sessionId).slice(-2000));
    var step = { entry: 'entry_purchase', upgrade: 'upgrade_purchase' }[tier];
    if (step) {
      track(step, {
        transaction_id: sessionId,
        value: bought.price,
        currency: 'USD',
        item_id: bought.item_id,
        item_name: bought.item_name,
        // true when this browser bought something before: a repeat or upgrade buyer
        repeat_buyer: counted.trim() ? 'yes' : 'no'
      });
    }
  }
}

// Buy buttons: <a data-buy="guide|agents|bundle|kit_inbox|...">. A button with
// data-keep stays visible (pointing at its own href, e.g. the contact form) until
// its checkout link is added, instead of being hidden.
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
// Launch-list sections are only needed until checkout is live.
// data-prelaunch="product" waits for that product's own link instead.
document.querySelectorAll('[data-prelaunch]').forEach(function (el) {
  var product = el.getAttribute('data-prelaunch');
  if (product ? SETTINGS.checkout[product] : hasCheckout) el.hidden = true;
});
// Hide any buy button (unless it has data-keep) whose product has no link yet and whose launch list is hidden
// (or, for a product with its own waitlist, until its link is added)
document.querySelectorAll('[data-buy]').forEach(function (btn) {
  var product = btn.getAttribute('data-buy');
  if (SETTINGS.checkout[product] || btn.hasAttribute('data-keep')) return;
  if (hasCheckout || document.querySelector('[data-prelaunch="' + product + '"]')) btn.hidden = true;
});

// Affiliate links on /tools: <a data-aff="tool"> uses SETTINGS.affiliate[tool] when set
document.querySelectorAll('[data-aff]').forEach(function (a) {
  var url = SETTINGS.affiliate[a.getAttribute('data-aff')];
  if (url) a.href = url;
  a.addEventListener('click', function () {
    track('select_content', { content_type: 'tool', item_id: a.getAttribute('data-aff') });
  });
});

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

// Which funnel step each form is. Email signups are the free downloads and the
// mailing list: they send email_signup plus generate_lead (the GA4 standard
// name, kept so earlier reports keep working).
var FORMS = {
  'ai-va-guide': 'email_signup',
  'ai-workforce': 'email_signup',
  'free-prompts': 'email_signup',
  'launch-list': 'email_signup',
  scorecard: 'email_signup',
  'va-request': 'hire_request',          // a company asking for a VA
  'va-application': 'va_application',   // a VA applying to the network
  'va-certification': 'certification_submit', // a course student sending work
  contact: 'contact_form_submit'
};
function trackForm(name, done) {
  var kind = FORMS[name] || 'generate_lead';
  var params = { form_name: name, page_path: window.location.pathname };
  if (kind === 'email_signup') {
    setStage('lead');
    track('generate_lead', { form_name: name, lead_type: 'email_signup' });
  }
  trackThen(kind, params, done || function () {});
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
      var next = form.getAttribute('data-next');
      var finish = function () {
        if (next) { window.location.href = next; return; }
        if (ok) ok.hidden = false;
        form.reset();
      };
      trackForm(form.getAttribute('name'), finish);
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
