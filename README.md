# The Field Report — Setup Guide

## What's in this folder

```
fieldreport/
  index.html        — Homepage
  briefs.html       — All briefs archive with tag filtering
  article.html      — Individual brief page (dynamic)
  about.html        — About page
  contribute.html   — Contribute page with form
  map.html          — Live map (embedded in homepage)
  css/style.css     — All styles
  js/notion.js      — Notion API helper
  js/home.js        — Homepage logic
  js/briefs.js      — Briefs archive logic
  js/article.js     — Article page logic
```

---

## Step 1 — Set up the CORS proxy

The Notion API blocks direct browser requests, so you need a small proxy.
The easiest free option is a Cloudflare Worker.

1. Go to **workers.cloudflare.com** and create a free account
2. Create a new Worker and paste this code:

```javascript
export default {
  async fetch(request) {
    const url = new URL(request.url);
    const notionPath = url.pathname.replace('/notion', '');
    const notionUrl = `https://api.notion.com/v1${notionPath}`;
    
    const token = request.headers.get('x-notion-token');
    
    const response = await fetch(notionUrl, {
      method: request.method,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json'
      },
      body: request.method !== 'GET' ? request.body : undefined
    });
    
    const data = await response.json();
    
    return new Response(JSON.stringify(data), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': '*'
      }
    });
  }
}
```

3. Deploy it — you'll get a URL like `https://your-worker.workers.dev`

---

## Step 2 — Add your credentials

Open `js/notion.js` and replace:

```javascript
TOKEN: 'YOUR_NOTION_TOKEN_HERE',
PROXY: 'https://YOUR_PROXY_URL/notion'
```

With your actual token and Cloudflare Worker URL.

---

## Step 3 — Deploy to GitHub Pages

1. Create a new GitHub repo called `the-field-report`
2. Upload all files maintaining the folder structure
3. Go to Settings → Pages → Source: main branch → root folder
4. Your site will be live at `https://yourusername.github.io/the-field-report`

---

## Step 4 — Wire up the Contribute form

1. Create a Google Form with these fields:
   - Name, Program, Email, Paper title & link, Country, Faculty Reviewer, Notes
2. Get the formResponse URL (see earlier instructions)
3. Replace `YOUR_GOOGLE_FORM_ACTION_URL` in `contribute.html`
4. Replace each `entry.XXXXX` with your actual field IDs

---

## How writers publish a brief

1. Open Notion → The Field Report → Briefs database
2. Click **New** to create a row
3. Fill in: Title, Author, Program, Faculty Reviewer, Country, Tags, Date, Excerpt
4. Write the full article content by clicking **Open** on the row
5. Change **Status** to **Published**
6. Done — appears on the site within seconds

---

## Updating stats on the homepage

Stats (briefs published, countries covered) auto-calculate from the database.
Writers and Reviewers counts are hardcoded in `index.html` — update them manually
as the team grows.
