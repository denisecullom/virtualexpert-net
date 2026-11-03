// Sends new signups from the site's free-guide forms to MailerLite.
//
// Netlify runs this automatically after every form submission that passes its
// spam filter (the function name "submission-created" is what makes that
// happen). The Netlify form itself still stores every submission as before, so
// nothing is lost if MailerLite is down or not set up yet.
//
// Setup: in Netlify, Site configuration > Environment variables, add
// MAILERLITE_API_KEY (MailerLite > Integrations > API > Generate new token).
// Groups are created in MailerLite on first use, so there is nothing else to do.

// Which MailerLite group each form joins. Forms not listed here (contact,
// hire-a-va, become-a-va, certification) are not marketing signups and are
// never sent to MailerLite.
var GROUPS = {
  'ai-va-guide': 'AI-Ready VA Guide',        // starts the welcome sequence
  'scorecard': 'Pipeline Scorecard',
  'ai-workforce': 'AI Workforce Blueprint',
  'free-prompts': 'Free Client Prompts'
};

// The launch-list form is shared by several pages; the "product" field says which.
var LAUNCH_LIST = {
  'va-course': 'VA Course Waitlist',
  'default': 'Launch List'
};

// Every VirtualExpert signup also joins this site-wide group, which keeps
// VirtualExpert subscribers apart from Denise's other sites in the same account.
var SITE_GROUP = 'VirtualExpert';

var API = 'https://connect.mailerlite.com/api';

function groupFor(form, data) {
  if (form === 'launch-list') return LAUNCH_LIST[data.product] || LAUNCH_LIST['default'];
  return GROUPS[form] || null;
}

async function ml(path, key, options) {
  var res = await fetch(API + path, Object.assign({
    headers: {
      'Authorization': 'Bearer ' + key,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  }, options || {}));
  var body = await res.json().catch(function () { return {}; });
  if (!res.ok) throw new Error('MailerLite ' + path + ' ' + res.status + ' ' + JSON.stringify(body));
  return body;
}

// Find the group by exact name, or create it.
async function groupId(name, key) {
  var found = await ml('/groups?limit=100&filter[name]=' + encodeURIComponent(name), key);
  var match = (found.data || []).find(function (g) { return g.name === name; });
  if (match) return match.id;
  var made = await ml('/groups', key, { method: 'POST', body: JSON.stringify({ name: name }) });
  return made.data.id;
}

exports.handler = async function (event) {
  var payload = (JSON.parse(event.body || '{}').payload) || {};
  var form = payload.form_name;
  var data = payload.data || {};
  var email = (data.email || payload.email || '').trim();
  var group = groupFor(form, data);

  if (!group || !email) return { statusCode: 200, body: 'skipped' };

  var key = process.env.MAILERLITE_API_KEY;
  if (!key) {
    console.log('MAILERLITE_API_KEY not set; ' + form + ' signup kept in Netlify Forms only');
    return { statusCode: 200, body: 'no key' };
  }

  try {
    var ids = [await groupId(SITE_GROUP, key), await groupId(group, key)];
    var fields = {};
    if (data.name) fields.name = String(data.name).trim().split(/\s+/)[0];
    // Adds the subscriber, or adds the group to an existing subscriber
    // without removing any groups they are already in.
    await ml('/subscribers', key, {
      method: 'POST',
      body: JSON.stringify({ email: email, fields: fields, groups: ids })
    });
    console.log('Added ' + form + ' signup to MailerLite groups "' + SITE_GROUP + '" and "' + group + '"');
    return { statusCode: 200, body: 'ok' };
  } catch (err) {
    // Log and carry on: the submission is already saved in Netlify Forms.
    console.error(err.message);
    return { statusCode: 200, body: 'error logged' };
  }
};
