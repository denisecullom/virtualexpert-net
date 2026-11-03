#!/usr/bin/env python3
"""Rebuild sitemap.xml from the site's HTML pages.

Netlify runs this on every deploy (see netlify.toml), so any new page or blog
article is added to the sitemap automatically. You can also run it locally:

    python3 scripts/build_sitemap.py

Rules:
- Every .html page is included, except 404.html, /thanks/*, /files/*, and any
  page with a robots "noindex" meta tag.
- The URL comes from the page's <link rel="canonical"> (falls back to the
  pretty URL Netlify serves, e.g. about.html -> /about).
- <lastmod> comes from the page's "dateModified" schema date, else the date of
  the last git commit that touched the file, else it is left out.
"""
import os
import re
import subprocess
import sys
from html import escape

SITE = "https://virtualexpert.net"
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SKIP_DIRS = {".git", "thanks", "files", "scripts", "images", "node_modules"}
SKIP_FILES = {"404.html"}

CANON_RE = re.compile(r'<link\s+rel="canonical"\s+href="([^"]+)"', re.I)
NOINDEX_RE = re.compile(r'<meta\s+name="robots"\s+content="[^"]*noindex', re.I)
MODIFIED_RE = re.compile(r'"dateModified"\s*:\s*"(\d{4}-\d{2}-\d{2})')
PUBLISHED_RE = re.compile(r'"datePublished"\s*:\s*"(\d{4}-\d{2}-\d{2})')


def git_date(rel):
    try:
        out = subprocess.run(
            ["git", "log", "-1", "--format=%cs", "--", rel],
            cwd=ROOT, capture_output=True, text=True, timeout=20,
        ).stdout.strip()
        return out or None
    except Exception:
        return None


def pretty_url(rel):
    path = rel[:-5]  # drop .html
    if path == "index":
        return SITE + "/"
    if path.endswith("/index"):
        path = path[: -len("/index")]
    return f"{SITE}/{path}"


def collect():
    pages = []
    for dirpath, dirnames, filenames in os.walk(ROOT):
        dirnames[:] = [d for d in dirnames if d not in SKIP_DIRS and not d.startswith(".")]
        for name in filenames:
            if not name.endswith(".html") or name in SKIP_FILES:
                continue
            full = os.path.join(dirpath, name)
            rel = os.path.relpath(full, ROOT).replace(os.sep, "/")
            with open(full, encoding="utf-8") as f:
                html = f.read()
            if NOINDEX_RE.search(html):
                continue
            m = CANON_RE.search(html)
            url = m.group(1) if m else pretty_url(rel)
            if not url.startswith(SITE):
                continue
            mod = MODIFIED_RE.search(html) or PUBLISHED_RE.search(html)
            lastmod = mod.group(1) if mod else git_date(rel)
            pages.append((url, lastmod, rel))
    return pages


def sort_key(page):
    url, lastmod, rel = page
    if url == SITE + "/":
        return (0, "", url)
    if url == SITE + "/blog":
        return (1, "", url)
    if rel.startswith("blog/"):
        # newest articles first
        return (2, "".join(chr(255 - ord(c)) for c in (lastmod or "")), url)
    return (3, "", url)


def main():
    pages = sorted(collect(), key=sort_key)
    lines = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ]
    for url, lastmod, _ in pages:
        lm = f"<lastmod>{lastmod}</lastmod>" if lastmod else ""
        lines.append(f"  <url><loc>{escape(url)}</loc>{lm}</url>")
    lines.append("</urlset>")
    with open(os.path.join(ROOT, "sitemap.xml"), "w", encoding="utf-8") as f:
        f.write("\n".join(lines) + "\n")
    print(f"sitemap.xml: {len(pages)} pages")


if __name__ == "__main__":
    sys.exit(main())
