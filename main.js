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
      if (ok) ok.hidden = false;
      form.reset();
    }).catch(function () {
      if (err) err.hidden = false;
    }).finally(function () {
      if (button) button.disabled = false;
    });
  });
});
