// ============================================
// NOTION API CONFIG
// Replace these with your actual values
// ============================================

const NOTION_CONFIG = {
  TOKEN: '',
  DATABASE_ID: '36566d9b3bc780aea66ae1a74c9552bc',
  PROXY: 'https://fieldreport.sf3365.workers.dev/notion'
};

// ============================================
// FETCH PUBLISHED BRIEFS FROM DATABASE
// ============================================
async function fetchBriefs() {
  try {
    const response = await fetch(`${NOTION_CONFIG.PROXY}/databases/${NOTION_CONFIG.DATABASE_ID}/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-notion-token': NOTION_CONFIG.TOKEN
      },
      body: JSON.stringify({
        filter: {
          property: 'Select',
          select: { equals: 'Published' }
        },
        sorts: [{ property: 'Date', direction: 'descending' }]
      })
    });
    const data = await response.json();
    return data.results || [];
  } catch (err) {
    console.error('Failed to fetch briefs:', err);
    return [];
  }
}

// ============================================
// FETCH SINGLE PAGE CONTENT
// ============================================
async function fetchPageContent(pageId) {
  try {
    // Fetch page properties
    const pageRes = await fetch(`${NOTION_CONFIG.PROXY}/pages/${pageId}`, {
      headers: { 'x-notion-token': NOTION_CONFIG.TOKEN }
    });
    const page = await pageRes.json();

    // Fetch page blocks (article body)
    const blocksRes = await fetch(`${NOTION_CONFIG.PROXY}/blocks/${pageId}/children`, {
      headers: { 'x-notion-token': NOTION_CONFIG.TOKEN }
    });
    const blocks = await blocksRes.json();

    return { page, blocks: blocks.results || [] };
  } catch (err) {
    console.error('Failed to fetch page:', err);
    return null;
  }
}

// ============================================
// PARSE BRIEF PROPERTIES
// ============================================
function parseBrief(page) {
  const p = page.properties;
  return {
    id: page.id,
    title: p.Title?.title?.[0]?.plain_text || 'Untitled',
    author: p.Author?.rich_text?.[0]?.plain_text || '',
    program: p.Program?.rich_text?.[0]?.plain_text || '',
    reviewer: p['Faculty Reviewer']?.rich_text?.[0]?.plain_text || '',
    country: p.Country?.rich_text?.[0]?.plain_text || '',
    tags: p.Tags?.multi_select?.map(t => t.name) || [],
    date: p.Date?.date?.start || '',
    excerpt: p.Excerpt?.rich_text?.[0]?.plain_text || '',
    substack: p['Substack Link']?.url || ''
  };
}

// ============================================
// RENDER NOTION BLOCKS TO HTML
// ============================================
function renderBlocks(blocks) {
  return blocks.map(block => {
    const type = block.type;
    const content = block[type];

    const richText = (arr) => (arr || []).map(t => {
      let text = t.plain_text;
      if (t.annotations?.bold) text = `<strong>${text}</strong>`;
      if (t.annotations?.italic) text = `<em>${text}</em>`;
      if (t.annotations?.code) text = `<code>${text}</code>`;
      if (t.href) text = `<a href="${t.href}" target="_blank">${text}</a>`;
      return text;
    }).join('');

    switch (type) {
      case 'paragraph':
        const text = richText(content.rich_text);
        return text ? `<p>${text}</p>` : '';
      case 'heading_1':
        return `<h2>${richText(content.rich_text)}</h2>`;
      case 'heading_2':
        return `<h2>${richText(content.rich_text)}</h2>`;
      case 'heading_3':
        return `<h3>${richText(content.rich_text)}</h3>`;
      case 'bulleted_list_item':
        return `<ul><li>${richText(content.rich_text)}</li></ul>`;
      case 'numbered_list_item':
        return `<ol><li>${richText(content.rich_text)}</li></ol>`;
      case 'quote':
        return `<blockquote>${richText(content.rich_text)}</blockquote>`;
      case 'divider':
        return `<hr style="border:none;border-top:1px solid rgba(201,168,76,0.2);margin:32px 0;">`;
      default:
        return '';
    }
  }).join('');
}

// ============================================
// FORMAT DATE
// ============================================
function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

// ============================================
// GET PAGE ID FROM URL PARAM
// ============================================
function getPageIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get('id');
}
