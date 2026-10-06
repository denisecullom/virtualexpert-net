# VirtualExpert.net website

Marketing site for VirtualExpert.net: "How to get clients with AI" for freelancers, virtual assistants, consultants and coaches. Plain HTML and CSS with no build step.

## Preview locally

From this folder, run:

```bash
python3 -m http.server 8000
```

Then open http://localhost:8000 in your browser. Press `Ctrl+C` to stop. (Links like `/guide` need Netlify's pretty URLs, so locally open `/guide.html`.)

## Pages

- `index.html`: homepage (problem, 4-step system, offer ladder, about, FAQ, newsletter signup)
- `guide.html`: **The AI Client Playbook**, $29 guide
- `templates.html`: **The AI Client Kit**, $49 template pack (prompts, outreach scripts, follow-up sequences)
- `consulting.html`: **Client Pipeline Audit**, 1:1 consulting
- `about.html`, `contact.html`, `privacy.html`, `404.html`
- `styles.css`: all styles (brand colors as CSS variables in `:root`)
- `main.js`: mobile menu, footer year, and in-page form submission
- `sitemap.xml`, `robots.txt`: help search engines find every page

## Turning on sales

The buy buttons on the Guide and Templates pages point to a "Notify me" launch list for now. When a product is ready, create a checkout link (Gumroad, Lemon Squeezy or a Stripe Payment Link) and replace `href="#notify"` on the button marked `data-buy="guide"` or `data-buy="templates"`. You can then delete that page's `#notify` section.

## Forms

All forms use Netlify Forms. Submissions appear in the Netlify dashboard under **Forms**:

- **contact**: contact and discovery-call requests
- **newsletter**: weekly tip signups from the homepage
- **launch-list**: "notify me" signups, with a `product` field (`guide` or `templates`)

Forms only work on the live site, not in the local preview. To get emailed on each submission, add a notification in Netlify under **Site configuration → Notifications → Emails and webhooks → Form submission notifications**.

## Hosting

Hosted on Netlify. Every push to `main` deploys automatically. Settings live in `netlify.toml`.
