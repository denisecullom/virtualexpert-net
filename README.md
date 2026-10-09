# VirtualExpert.net website

Marketing site for VirtualExpert.net: "How to get clients with AI" for freelancers, virtual assistants, consultants and coaches. Plain HTML and CSS with no build step.

## Preview locally

From this folder, run:

```bash
python3 -m http.server 8000
```

Then open http://localhost:8000 in your browser. Press `Ctrl+C` to stop. (Links like `/guide` need Netlify's pretty URLs, so locally open `/guide.html`.)

## Pages

- `index.html`: homepage (problem, 4-step system, offer ladder, about, FAQ, free-prompts signup)
- `free-prompts.html`, `prompts-download.html`: free lead magnet and its delivery page
- `scorecard.html`, `scorecard.js`: **AI Client Pipeline Scorecard**, a free 10-question quiz that scores the visitor's pipeline out of 100, asks for their email, then shows their three biggest leaks and recommends the Playbook + Kit, the $59 bundle or the Audit. Questions, tips and score bands are at the top of `scorecard.js`
- `guide.html`: **The AI Client Playbook + Kit**, $29 (the guide plus the template pack: prompts, outreach scripts, follow-up sequences, tracker). `/templates` redirects here.
- `agents.html`: **20 AI Agents That Pay for Themselves**, $49 book (20 agent builds in Claude or ChatGPT, with a savings calculator)
- `thanks/`: download pages Stripe sends buyers to (`playbook`, `agents`, `bundle`; `kit` stays for buyers of the retired $49 Kit link)
- `consulting.html`: **Client Pipeline Audit**, 1:1 consulting
- `about.html`, `contact.html`, `privacy.html`, `404.html`
- `styles.css`: all styles (brand colors as CSS variables in `:root`)
- `main.js`: mobile menu, footer year, and in-page form submission
- `sitemap.xml`, `robots.txt`: help search engines find every page

## Making money: the settings block

All money links live in one place: the `SETTINGS` block at the top of `main.js`.

- `checkout.guide` ($29 Playbook + Kit), `checkout.agents` ($49 agents book), `checkout.bundle` ($59, all three): Stripe Payment Links (or Lemon Squeezy checkout links, which open as an overlay). Once a link is set, its buy buttons go to checkout and the "notify me" launch-list section on that page is hidden.
- `booking`: your Calendly / Cal.com / TidyCal link. Every "Book a discovery call" button uses it; when empty they go to the contact form.

Empty links fall back safely, so the site never shows a broken button.

## Free lead magnet

`/free-prompts` collects an email (Netlify form **free-prompts**) and sends people to `/prompts-download`, an unlisted page with the 10 prompts, copy buttons and "Save as PDF". The homepage has the same signup. The download page links to the Playbook + Kit and the agents book.

## Forms

All forms use Netlify Forms. Submissions appear in the Netlify dashboard under **Forms**:

- **contact**: contact and discovery-call requests
- **free-prompts**: lead-magnet signups (homepage and `/free-prompts`)
- **scorecard**: scorecard leads, with their score, tier, business stage, weakest area, recommended offer and every answer
- **launch-list**: "notify me" signups, with a `product` field (`guide` or `templates`, from before launch)

Forms only work on the live site, not in the local preview. To get emailed on each submission, add a notification in Netlify under **Site configuration → Notifications → Emails and webhooks → Form submission notifications**.

## Hosting

Hosted on Netlify. Every push to `main` deploys automatically. Settings live in `netlify.toml`.
