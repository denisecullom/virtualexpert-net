// Free AI tools for VAs. Each tool only runs on the page that has its markup.
// Runs after main.js, so track() (Google Analytics) is available.
(function () {
  function ga(name, params) { if (typeof track === 'function') track(name, params); }
  function $(id) { return document.getElementById(id); }
  function num(id) { var v = parseFloat($(id).value); return isFinite(v) && v > 0 ? v : 0; }
  function money(n) { return '$' + Math.round(n).toLocaleString('en-US'); }
  function round25(n) { return Math.round(n / 25) * 25; }
  function hrs(n) { return (Math.round(n * 10) / 10).toLocaleString('en-US') + ' hrs'; }

  // Count a tool as "used" once per page view, the first time someone changes an input
  function usedOnce(tool) {
    var done = false;
    return function () {
      if (done) return;
      done = true;
      ga('tool_use', { tool_name: tool });
    };
  }

  function copyButton(btn, getText, tool) {
    btn.addEventListener('click', function () {
      var text = getText();
      var label = btn.textContent;
      var finish = function () {
        btn.textContent = 'Copied';
        setTimeout(function () { btn.textContent = label; }, 1500);
        ga('tool_copy', { tool_name: tool });
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(finish, function () { fallbackCopy(text); finish(); });
      } else { fallbackCopy(text); finish(); }
    });
  }
  function fallbackCopy(text) {
    var ta = document.createElement('textarea');
    ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta); ta.select();
    try { document.execCommand('copy'); } catch (e) { /* ignore */ }
    document.body.removeChild(ta);
  }

  // "Link to this tool" boxes
  document.querySelectorAll('[data-share-copy]').forEach(function (btn) {
    var code = btn.parentElement.querySelector('code');
    copyButton(btn, function () { return code.textContent; }, 'share_' + btn.getAttribute('data-share-copy'));
  });

  // -------------------------------------------------------------------------
  // 1. AI service rate calculator (/ai-rate-calculator)
  // Same formulas as Chapter 5 of the free starter guide:
  //   setup fee = build hours x hourly rate x 1.5
  //   monthly fee = hours saved a month x client's hourly value / 4,
  //   but never less than your running time x your rate (plus tool costs)
  // -------------------------------------------------------------------------
  if ($('rc-form')) {
    var rcUsed = usedOnce('rate_calculator');
    var calcRate = function () {
      var rate = num('rc-rate');
      var build = num('rc-build');
      var run = num('rc-run');
      var saved = num('rc-saved');
      var value = num('rc-value');
      var tools = num('rc-tools');

      var setup = round25(build * rate * 1.5);
      var valueFee = saved * value / 4;
      var floorFee = run * rate + tools;
      var monthly = round25(Math.max(valueFee, floorFee));
      var effective = run > 0 ? (monthly - tools) / run : 0;
      var clientValue = saved * value;

      $('rc-setup').textContent = money(setup);
      $('rc-monthly').innerHTML = money(monthly) + ' <small>a month</small>';
      $('rc-first-year').textContent = money(setup + monthly * 12);
      $('rc-effective').textContent = run > 0 ? money(effective) + ' an hour' : 'add your running time';
      $('rc-client-value').textContent = money(clientValue) + ' a month';
      $('rc-hourly-compare').textContent = money(run * rate) + ' a month';
      $('rc-basis').textContent = valueFee >= floorFee
        ? 'This fee is based on the value to your client: about a quarter of what the hours you save them are worth.'
        : 'The value-based fee came out below what your own time costs, so this fee covers your running time and tools instead. Look for a bigger time-saver for this client, or bundle two services.';

      var pitch = "I'd expect this to save you around " + Math.round(saved) + ' hours a month. ' +
        'Setup is ' + money(setup) + ', and then ' + money(monthly) + ' a month for me to run it, check its work and keep improving it.';
      $('rc-pitch').textContent = pitch;
    };
    $('rc-form').addEventListener('input', function () { rcUsed(); calcRate(); });
    $('rc-form').addEventListener('submit', function (e) { e.preventDefault(); });
    copyButton($('rc-copy'), function () { return $('rc-pitch').textContent; }, 'rate_calculator');
    calcRate();
  }

  // -------------------------------------------------------------------------
  // 2. Hours-saved calculator (/hours-saved-calculator)
  // Each task: hours a week the client (or their team) spends on it, and a
  // conservative share of that time AI-assisted work typically takes off.
  // -------------------------------------------------------------------------
  var TASKS = [
    { id: 'inbox', name: 'Email triage and replies', note: 'Sorting, drafting routine replies', hours: 5, save: 0.5 },
    { id: 'calendar', name: 'Scheduling and calendar', note: 'Booking, rescheduling, reminders', hours: 2, save: 0.4 },
    { id: 'meetings', name: 'Meeting notes and follow-up', note: 'Summaries, action items, recap emails', hours: 3, save: 0.6 },
    { id: 'social', name: 'Social posts and content', note: 'Drafting, repurposing, captions', hours: 4, save: 0.5 },
    { id: 'support', name: 'Customer support replies', note: 'First drafts for common questions', hours: 5, save: 0.4 },
    { id: 'books', name: 'Bookkeeping prep', note: 'Receipts, categorizing, month-end notes', hours: 2, save: 0.4 },
    { id: 'reports', name: 'Weekly reports', note: 'Pulling numbers, writing the summary', hours: 2, save: 0.6 },
    { id: 'research', name: 'Lead research and CRM updates', note: 'Finding contacts, cleaning records', hours: 3, save: 0.5 },
    { id: 'docs', name: 'SOPs and documents', note: 'Writing procedures, templates, onboarding', hours: 2, save: 0.5 }
  ];
  var WEEKS = 4.33;

  if ($('hs-form')) {
    var hsUsed = usedOnce('hours_saved_calculator');
    var list = $('hs-tasks');
    TASKS.forEach(function (t, i) {
      var row = document.createElement('div');
      row.className = 'ft-task';
      row.innerHTML =
        '<input type="checkbox" id="hs-on-' + t.id + '"' + (i < 4 ? ' checked' : '') + '>' +
        '<label for="hs-on-' + t.id + '">' + t.name + '<small>' + t.note + ' (AI saves about ' + Math.round(t.save * 100) + '%)</small></label>' +
        '<input type="number" min="0" max="80" step="0.5" id="hs-h-' + t.id + '" value="' + t.hours + '" aria-label="Hours a week on ' + t.name + '">';
      list.appendChild(row);
    });

    var calcHours = function () {
      var value = num('hs-value');
      var weekly = 0;
      var picked = [];
      TASKS.forEach(function (t) {
        var on = $('hs-on-' + t.id).checked;
        var h = num('hs-h-' + t.id);
        $('hs-h-' + t.id).closest('.ft-task').classList.toggle('off', !on);
        if (!on || !h) return;
        var s = h * t.save;
        weekly += s;
        picked.push({ name: t.name, saved: s * WEEKS });
      });
      var monthly = weekly * WEEKS;
      var monthValue = monthly * value;
      var fee = round25(monthValue / 4);

      $('hs-monthly').innerHTML = hrs(monthly).replace(' hrs', '') + ' <small>hours a month</small>';
      $('hs-value-out').textContent = money(monthValue) + ' a month';
      $('hs-year').textContent = money(monthValue * 12) + ' a year';
      $('hs-weekly').textContent = hrs(weekly) + ' a week';
      $('hs-fee').textContent = monthly > 0 ? money(fee) + ' a month' : '-';

      picked.sort(function (a, b) { return b.saved - a.saved; });
      var top = picked.slice(0, 3).map(function (p) { return p.name.toLowerCase() + ' (' + hrs(p.saved) + ')'; });
      $('hs-top').textContent = top.length ? top.join(', ') : 'Pick at least one task.';

      var summary = picked.length
        ? 'I looked at where your week goes. With AI handling the first pass on ' + top.join(', ') +
          ', I estimate we can free up about ' + Math.round(monthly) + ' hours a month. ' +
          'At ' + money(value) + ' an hour, that time is worth about ' + money(monthValue) + ' a month to the business. ' +
          'Want me to show you how it would work on one of these this week?'
        : 'Pick at least one task to build your summary.';
      $('hs-summary').textContent = summary;
    };
    $('hs-form').addEventListener('input', function () { hsUsed(); calcHours(); });
    $('hs-form').addEventListener('change', calcHours);
    $('hs-form').addEventListener('submit', function (e) { e.preventDefault(); });
    copyButton($('hs-copy'), function () { return $('hs-summary').textContent; }, 'hours_saved_calculator');
    calcHours();
  }

  // -------------------------------------------------------------------------
  // 3. AI prompt generator (/ai-prompt-generator)
  // Builds a structured prompt (role, context, task, rules, format) from the
  // VA's answers. Nothing is sent anywhere: it all happens in the browser.
  // -------------------------------------------------------------------------
  var JOBS = {
    inbox: {
      label: 'Sort an inbox and draft replies',
      task: 'Sort the emails I paste below into four groups: Urgent (needs [CLIENT] today), Needs a reply, FYI only, and Junk or promotions. For every email in "Needs a reply", draft a short reply in [CLIENT]\'s voice.',
      rules: ['Never promise a date, price, refund or meeting time unless it is already in the email thread.', 'If an email needs a decision only [CLIENT] can make, put it in Urgent and write one line saying what the decision is.'],
      format: 'A table with columns: Group, From, Subject, One-line summary. Then the draft replies, each under the subject line it answers.',
      input: 'Paste the emails here, with sender, subject and body.'
    },
    meeting: {
      label: 'Turn meeting notes into a recap',
      task: 'Turn the meeting notes or transcript below into a clear recap and a follow-up email to the attendees.',
      rules: ['Only include decisions and action items that were actually said. If an owner or due date is missing, write "Owner: TBC" or "Due: TBC" instead of guessing.', 'Keep the recap short enough to read in one minute.'],
      format: 'Three sections: Decisions, Action items (owner, task, due date), Open questions. Then the follow-up email, under 150 words.',
      input: 'Paste the meeting notes or transcript here.'
    },
    social: {
      label: 'Repurpose content into social posts',
      task: 'Turn the content below into a week of social posts for [CLIENT]: 5 posts for [PLATFORM], each with a different angle (a tip, a story, a myth, a question, a behind-the-scenes).',
      rules: ['Use only facts and claims that appear in the source content. Do not invent results, numbers or testimonials.', 'Each post opens with a line that makes the reader stop scrolling. No hashtag walls: three hashtags at most.'],
      format: 'Numbered posts, each with the post text, a suggested image idea and the best day to post it.',
      input: 'Paste the blog post, newsletter, video transcript or notes to repurpose.'
    },
    support: {
      label: 'Draft customer support replies',
      task: 'Draft a reply to each customer message below, using only the policies and answers in the reference notes.',
      rules: ['If the reference notes do not answer the question, do not make up an answer. Write "NEEDS [CLIENT]" and say what is missing.', 'Be warm and specific. Apologize once at most, and always end with a clear next step for the customer.'],
      format: 'For each message: the customer\'s question in one line, then the draft reply, then a confidence label (Ready to send / Check first / Needs [CLIENT]).',
      input: 'Paste the reference notes (policies, FAQs, prices) first, then the customer messages.'
    },
    books: {
      label: 'Prep bookkeeping and categorize expenses',
      task: 'Categorize the transactions below using [CLIENT]\'s chart of accounts and flag anything that needs a receipt or a question.',
      rules: ['Use only the categories I give you. If a transaction does not clearly fit one, mark it "Unsure" and say why.', 'Do not give tax advice. Flag anything that looks like a personal expense or a duplicate.'],
      format: 'A table with columns: Date, Description, Amount, Category, Flag. Then a short list of questions for [CLIENT] or their bookkeeper.',
      input: 'Paste the list of categories, then the transactions (date, description, amount).'
    },
    report: {
      label: 'Write a weekly business report',
      task: 'Write [CLIENT]\'s weekly business report from the numbers and notes below.',
      rules: ['Compare every number with last week if I give you last week\'s figure. Do not invent a comparison when one is missing.', 'Call out the one thing that went best and the one thing that needs attention, in plain words.'],
      format: 'A headline sentence, then a short table of the key numbers (this week, last week, change), then three bullet points: what went well, what needs attention, what to do next week.',
      input: 'Paste this week\'s numbers, last week\'s numbers and any notes.'
    },
    leads: {
      label: 'Research leads and clean up a CRM',
      task: 'Review the list of leads below for [CLIENT]. For each one, check the details look complete and consistent, and suggest the next step.',
      rules: ['Do not invent emails, phone numbers or job titles. If a field is missing, leave it blank and mark it "Missing".', 'Flag likely duplicates and leads that do not match [CLIENT]\'s ideal customer.'],
      format: 'A table with columns: Name, Company, Fit (Good / Maybe / Poor), Missing fields, Suggested next step.',
      input: 'Describe the ideal customer in one or two lines, then paste the lead list.'
    },
    sop: {
      label: 'Write a standard operating procedure',
      task: 'Turn my rough notes below into a step-by-step standard operating procedure that someone new could follow without asking questions.',
      rules: ['Number every step and start each one with a verb.', 'Where a step depends on a judgment call, add a short "If... then..." note. Where my notes skip a step, add a placeholder that says [CHECK: missing step].'],
      format: 'Title, purpose (one line), tools needed, numbered steps, common mistakes, and who to ask for help.',
      input: 'Paste your rough notes, a recording transcript or a list of the steps as you remember them.'
    },
    newsletter: {
      label: 'Draft an email newsletter',
      task: 'Draft this week\'s email newsletter for [CLIENT] from the notes below.',
      rules: ['Write like a person talking to one reader, not a brand talking to a list.', 'Only include offers, dates and links that appear in my notes.'],
      format: 'Three subject line options, a preview line, then the newsletter (under 350 words) with one clear call to action.',
      input: 'Paste the topic, key points, any links and the call to action.'
    },
    onboarding: {
      label: 'Create a new-client welcome pack',
      task: 'Create a welcome pack for [CLIENT]\'s new customers from the notes below.',
      rules: ['Make every next step specific: what the customer does, by when, and how.', 'Only include prices, policies and contact details that appear in my notes.'],
      format: 'A welcome email (under 200 words), a "what happens next" checklist, and the five questions new customers ask most, with answers.',
      input: 'Paste what the client offers, how they work, their policies and contact details.'
    }
  };
  var TONES = {
    warm: 'warm, friendly and professional',
    direct: 'direct, clear and to the point',
    formal: 'polished and formal',
    upbeat: 'upbeat and energetic',
    calm: 'calm, reassuring and patient'
  };

  if ($('pg-form')) {
    var pgUsed = usedOnce('prompt_generator');
    var sel = $('pg-job');
    Object.keys(JOBS).forEach(function (k) {
      var o = document.createElement('option');
      o.value = k; o.textContent = JOBS[k].label;
      sel.appendChild(o);
    });
    var preset = new URLSearchParams(window.location.search).get('task');
    if (preset && JOBS[preset]) sel.value = preset;

    var val = function (id) { return $(id).value.trim(); };
    var buildPrompt = function () {
      var job = JOBS[sel.value];
      var client = val('pg-client') || 'my client';
      var business = val('pg-business') || 'a small business';
      var audience = val('pg-audience');
      var tone = TONES[$('pg-tone').value];
      var platform = val('pg-platform') || 'LinkedIn';
      var extra = val('pg-extra');
      var fill = function (s) { return s.replace(/\[CLIENT\]/g, client).replace(/\[PLATFORM\]/g, platform); };

      $('pg-platform-wrap').hidden = sel.value !== 'social';

      var lines = [];
      lines.push('ROLE');
      lines.push('You are an experienced assistant helping me, a virtual assistant, do work for my client, ' + client + '.');
      lines.push('');
      lines.push('CONTEXT');
      lines.push('The business: ' + business.replace(/\.$/, '') + '.' + (audience ? ' Their customers: ' + audience.replace(/\.$/, '') + '.' : ''));
      lines.push('Voice: ' + tone + '. Write the way ' + client + ' would, in plain English, with no jargon or filler.');
      if (extra) lines.push('Also keep in mind: ' + extra);
      lines.push('');
      lines.push('TASK');
      lines.push(fill(job.task));
      lines.push('');
      lines.push('RULES');
      job.rules.forEach(function (r) { lines.push('- ' + fill(r)); });
      lines.push('- If anything is unclear or missing, ask me up to 3 questions before you start instead of guessing.');
      lines.push('- Do not repeat any personal details (card numbers, passwords, health or financial details) back in your answer.');
      lines.push('');
      lines.push('FORMAT');
      lines.push(fill(job.format));
      lines.push('');
      lines.push('INPUT');
      lines.push(job.input);
      lines.push('[paste here]');
      $('pg-output').textContent = lines.join('\n');
    };
    $('pg-form').addEventListener('input', function () { pgUsed(); buildPrompt(); });
    $('pg-form').addEventListener('change', buildPrompt);
    $('pg-form').addEventListener('submit', function (e) { e.preventDefault(); });
    copyButton($('pg-copy'), function () { return $('pg-output').textContent; }, 'prompt_generator');
    buildPrompt();
  }
})();
