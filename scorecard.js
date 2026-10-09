// AI Client Pipeline Scorecard (/scorecard)
// Intro -> 11 questions (1 about stage, 10 scored) -> email -> results.
// Edit questions, tips or score bands here; scorecard.html only holds the layout.

// The stage question isn't scored; it helps decide which offer to recommend.
var STAGE = {
  id: 'stage',
  q: 'First, where is your business today?',
  options: [
    { text: "I'm just getting started (no steady clients yet)", value: 'starting' },
    { text: 'Under $3,000 a month', value: 'under3k' },
    { text: '$3,000 to $10,000 a month', value: '3to10k' },
    { text: 'Over $10,000 a month', value: 'over10k' }
  ]
};

// Two questions per stage of the pipeline, 10 points each, 100 in total.
// "tip" is what we tell people when this answer is one of their weakest.
var AREAS = [
  { id: 'find', name: 'Find' },
  { id: 'reach', name: 'Reach' },
  { id: 'follow', name: 'Follow up' },
  { id: 'close', name: 'Close' },
  { id: 'system', name: 'AI and routine' }
];

var QUESTIONS = [
  {
    area: 'find',
    q: 'How clearly can you describe your ideal client?',
    options: [
      { text: "Honestly, anyone who'll pay me", points: 0 },
      { text: 'A rough idea: an industry or type of person', points: 4 },
      { text: 'A specific niche and the problem I solve for them', points: 7 },
      { text: 'A niche, the problem, and the moments that make them buy now', points: 10 }
    ],
    leak: "Your target is too broad",
    tip: "Pick one niche and one painful problem you solve for it. Then ask AI: \"List 10 events that make a [niche] urgently need help with [problem].\" Those buying moments tell you who to contact this week."
  },
  {
    area: 'find',
    q: 'Where do your new leads come from today?',
    options: [
      { text: 'Mostly luck and word of mouth', points: 0 },
      { text: 'Referrals plus the occasional social post', points: 3 },
      { text: 'One channel I work most weeks', points: 7 },
      { text: 'Two or more channels, with a weekly target', points: 10 }
    ],
    leak: 'No reliable lead source',
    tip: 'Choose one channel where your clients already spend time (LinkedIn, a community, email) and set a weekly target, such as 20 new prospects. Use AI to research each one in a minute instead of ten.'
  },
  {
    area: 'reach',
    q: 'How many new sales conversations do you start in a typical week?',
    options: [
      { text: 'None', points: 0 },
      { text: '1 to 4', points: 4 },
      { text: '5 to 14', points: 7 },
      { text: '15 or more', points: 10 }
    ],
    leak: 'Too few conversations',
    tip: "Clients come from conversations, and most weeks you aren't starting enough. Block 30 minutes a day, aim for 3 personal messages in each block, and let AI write the first draft so it takes minutes, not an hour."
  },
  {
    area: 'reach',
    q: 'What do your first messages to prospects usually look like?',
    options: [
      { text: "I don't really send them", points: 0 },
      { text: 'The same template to everyone', points: 3 },
      { text: 'Personalized, but each one takes me ages', points: 6 },
      { text: 'Personalized from research, with AI drafting in my voice', points: 10 }
    ],
    leak: 'Outreach that sounds generic (or slow)',
    tip: 'Give AI three of your best past messages as examples of your voice, plus one real detail about the prospect. Ask for a message under 80 words with one clear question. Edit, then send.'
  },
  {
    area: 'follow',
    q: "When a prospect doesn't reply, what happens next?",
    options: [
      { text: 'I move on', points: 0 },
      { text: 'Maybe one nudge', points: 3 },
      { text: 'Two or three follow-ups, when I remember', points: 6 },
      { text: 'A set follow-up sequence with dates', points: 10 }
    ],
    leak: 'Follow-up stops too soon',
    tip: 'Most yeses come after the third touch. Write a 4-step follow-up sequence once (day 3, day 7, day 14, day 30), each adding something useful, and put the dates on your calendar.'
  },
  {
    area: 'follow',
    q: 'How do you keep track of your leads?',
    options: [
      { text: 'In my head or my inbox', points: 0 },
      { text: 'Scattered notes', points: 3 },
      { text: 'A spreadsheet I update sometimes', points: 6 },
      { text: 'A tracker or CRM I review every week', points: 10 }
    ],
    leak: 'Leads slip through the cracks',
    tip: 'Start a simple tracker with five columns: name, stage, last touch, next step, next date. Review it every Monday and do whatever is due. That one habit recovers more deals than any new channel.'
  },
  {
    area: 'close',
    q: 'Of the discovery calls you have, how many turn into clients?',
    options: [
      { text: 'I rarely get calls', points: 0 },
      { text: 'Fewer than 1 in 5', points: 3 },
      { text: 'About 1 in 3', points: 7 },
      { text: 'Half or more', points: 10 }
    ],
    leak: 'Calls that don\'t convert',
    tip: 'Before each call, have AI summarize the prospect\'s business and list 5 questions about their problem. Spend the first two thirds of the call on their situation, and only then talk about how you help.'
  },
  {
    area: 'close',
    q: 'How quickly do you send a proposal after a good call?',
    options: [
      { text: "I don't have a standard proposal", points: 0 },
      { text: 'Within a week', points: 4 },
      { text: 'Within two days', points: 7 },
      { text: 'Same day, from a template', points: 10 }
    ],
    leak: 'Proposals are slow',
    tip: 'Interest fades fast after a call. Build one proposal template, then paste your call notes into AI and ask it to fill in the problem, the outcome and three options. Aim to send it the same day.'
  },
  {
    area: 'system',
    q: 'How do you use AI to get clients?',
    options: [
      { text: 'Not at all yet', points: 0 },
      { text: 'Now and then, but the results sound generic', points: 3 },
      { text: 'Regularly, mostly for writing', points: 6 },
      { text: 'Saved prompts for research, outreach, follow-up and proposals', points: 10 }
    ],
    leak: "AI isn't doing the heavy lifting",
    tip: 'Save four prompts you reuse every week: one to research a prospect, one to draft a first message, one for follow-ups and one for proposals. Reusing the same tested prompts is what makes the output sound like you.'
  },
  {
    area: 'system',
    q: 'How much time do you protect each week for finding clients?',
    options: [
      { text: 'Only when work dries up', points: 0 },
      { text: 'Whenever I can squeeze it in', points: 3 },
      { text: 'A few hours most weeks', points: 6 },
      { text: 'Fixed blocks on my calendar every week', points: 10 }
    ],
    leak: 'Feast-or-famine schedule',
    tip: "Put two or three 45-minute pipeline blocks on your calendar every week, even when you're fully booked. Next month's clients come from this month's outreach."
  }
];

var TIERS = [
  { min: 85, name: 'A well-oiled pipeline', summary: 'You have a real system and it shows. The gains from here come from fine-tuning: better targeting, higher close rates and more of the work handed to AI.' },
  { min: 65, name: 'A solid pipeline with leaks', summary: "The basics are in place, but a few weak spots are quietly costing you clients. Fix the leaks below and the same effort will bring in noticeably more work." },
  { min: 40, name: 'A pipeline in progress', summary: "You're doing some of the right things, just not consistently. That's why work feels feast-or-famine. A simple weekly routine will steady it." },
  { min: 0, name: 'A leaky pipeline', summary: "Right now, new clients mostly arrive by chance. The good news: a few simple habits make a big difference fast, and AI makes them much easier to keep." }
];

// ---------------------------------------------------------------------------

(function () {
  var steps = [STAGE].concat(QUESTIONS);
  var answers = [];   // index of the chosen option for each step
  var current = 0;
  var result = null;

  var $ = function (id) { return document.getElementById(id); };
  var sections = { intro: $('sc-intro'), quiz: $('sc-quiz'), gate: $('sc-gate'), results: $('sc-results') };

  function show(name) {
    Object.keys(sections).forEach(function (key) { sections[key].hidden = key !== name; });
    window.scrollTo(0, 0);
  }

  function renderQuestion() {
    var step = steps[current];
    $('sc-count').textContent = 'Question ' + (current + 1) + ' of ' + steps.length +
      (step.area ? ' · ' + areaName(step.area) : '');
    $('sc-q').textContent = step.q;
    $('sc-bar').style.width = (current / steps.length * 100) + '%';
    $('sc-back').hidden = current === 0;
    var box = $('sc-options');
    box.innerHTML = '';
    step.options.forEach(function (opt, i) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'sc-option' + (answers[current] === i ? ' selected' : '');
      btn.textContent = opt.text;
      btn.addEventListener('click', function () { choose(i); });
      box.appendChild(btn);
    });
    $('sc-q').focus();
  }

  function choose(i) {
    answers[current] = i;
    if (current < steps.length - 1) {
      current++;
      renderQuestion();
    } else {
      finish();
    }
  }

  function areaName(id) {
    for (var i = 0; i < AREAS.length; i++) if (AREAS[i].id === id) return AREAS[i].name;
    return id;
  }

  function score() {
    var stage = STAGE.options[answers[0]].value;
    var total = 0;
    var byArea = {};
    AREAS.forEach(function (a) { byArea[a.id] = { got: 0, max: 0 }; });
    var scored = QUESTIONS.map(function (q, i) {
      var points = q.options[answers[i + 1]].points;
      total += points;
      byArea[q.area].got += points;
      byArea[q.area].max += 10;
      return { q: q, points: points, order: i };
    });
    // Biggest leaks: lowest points first; ties go to the earlier stage of the pipeline
    var leaks = scored.filter(function (s) { return s.points < 10; })
      .sort(function (a, b) { return a.points - b.points || a.order - b.order; })
      .slice(0, 3);
    var weakest = AREAS.slice().sort(function (a, b) {
      return byArea[a.id].got - byArea[b.id].got;
    })[0];
    var tier = TIERS.filter(function (t) { return total >= t.min; })[0];
    // Offer: established or high-scoring -> audit; middle -> Kit; low or brand new -> Playbook
    // (people with no clients yet always start with the Playbook)
    var rec = 'guide';
    if (stage === 'over10k' || (total >= 65 && stage !== 'starting')) rec = 'audit';
    else if (total >= 40 && stage !== 'starting') rec = 'templates';
    return { total: total, byArea: byArea, leaks: leaks, weakest: weakest, tier: tier, stage: stage, rec: rec };
  }

  function finish() {
    $('sc-bar').style.width = '100%';
    result = score();
    track('scorecard_complete', { score: result.total, tier: result.tier.name, stage: result.stage });
    var form = $('sc-form');
    form.score.value = result.total;
    form.tier.value = result.tier.name;
    form.stage.value = result.stage;
    form.weakest_area.value = result.weakest.name;
    form.recommended.value = result.rec;
    form.answers.value = QUESTIONS.map(function (q, i) {
      return (i + 1) + '. ' + q.options[answers[i + 1]].text + ' (' + q.options[answers[i + 1]].points + ')';
    }).join(' | ');
    show('gate');
    sections.gate.querySelector('h2').focus();
  }

  function renderResults() {
    var r = result;
    $('sc-score').textContent = r.total;
    $('sc-dial').setAttribute('aria-label', 'Score: ' + r.total + ' out of 100');
    var circle = $('sc-dial-fill');
    var length = 2 * Math.PI * 52;
    circle.style.strokeDasharray = length;
    circle.style.strokeDashoffset = length * (1 - r.total / 100);
    $('sc-tier').textContent = r.tier.name;
    $('sc-summary').textContent = r.tier.summary;

    var areas = $('sc-areas');
    areas.innerHTML = '';
    AREAS.forEach(function (a) {
      var pct = Math.round(r.byArea[a.id].got / r.byArea[a.id].max * 100);
      var row = document.createElement('div');
      row.className = 'sc-area' + (a.id === r.weakest.id ? ' weakest' : '');
      row.innerHTML = '<span class="sc-area-name"></span><span class="sc-area-bar"><span></span></span><b></b>';
      row.querySelector('.sc-area-name').textContent = a.name;
      row.querySelector('.sc-area-bar span').style.width = pct + '%';
      row.querySelector('b').textContent = pct + '%';
      areas.appendChild(row);
    });

    var leaks = $('sc-leaks');
    leaks.innerHTML = '';
    $('sc-leaks-title').textContent = r.leaks.length === 3 ? 'Your three biggest leaks'
      : r.leaks.length === 2 ? 'Your two biggest leaks' : 'Your biggest leak';
    if (!r.leaks.length) {
      var li = document.createElement('li');
      li.innerHTML = '<h3>No leaks found</h3><p>You scored full marks on every question. Time to raise your prices.</p>';
      leaks.appendChild(li);
    }
    r.leaks.forEach(function (s) {
      var li = document.createElement('li');
      li.innerHTML = '<p class="sc-leak-area"></p><h3></h3><p></p>';
      li.querySelector('.sc-leak-area').textContent = areaName(s.q.area) + ' · ' + s.points + ' of 10 points';
      li.querySelector('h3').textContent = s.q.leak;
      li.querySelectorAll('p')[1].textContent = s.q.tip;
      leaks.appendChild(li);
    });

    document.querySelectorAll('[data-rec]').forEach(function (el) {
      el.hidden = el.getAttribute('data-rec') !== r.rec;
    });
    show('results');
    $('sc-tier').focus();
  }

  $('sc-start').addEventListener('click', function () {
    track('scorecard_start', {});
    current = 0;
    show('quiz');
    renderQuestion();
  });

  $('sc-back').addEventListener('click', function () {
    if (current > 0) { current--; renderQuestion(); }
  });

  $('sc-retake').addEventListener('click', function () {
    answers = [];
    current = 0;
    show('quiz');
    renderQuestion();
  });

  // Save the lead to Netlify Forms, then show results. If saving fails, show
  // the results anyway: the visitor answered every question and earned them.
  $('sc-form').addEventListener('submit', function (e) {
    e.preventDefault();
    var form = e.target;
    var button = form.querySelector('button[type="submit"]');
    button.disabled = true;
    fetch('/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(new FormData(form)).toString()
    }).then(function (res) {
      if (!res.ok) throw new Error(res.status);
      track('generate_lead', { form_name: 'scorecard', value: result.total });
    }).catch(function () {}).finally(function () {
      button.disabled = false;
      renderResults();
    });
  });
})();
