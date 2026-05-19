// ============================================
// ARTICLE PAGE — loads single brief from Notion
// ============================================

async function initArticle() {
  const pageId = getPageIdFromUrl();
  if (!pageId) {
    document.getElementById('article-content').innerHTML =
      '<div class="loading-state">Brief not found.</div>';
    return;
  }

  const result = await fetchPageContent(pageId);
  if (!result) {
    document.getElementById('article-content').innerHTML =
      '<div class="loading-state">Failed to load brief.</div>';
    return;
  }

  const brief = parseBrief(result.page);
  const bodyHTML = renderBlocks(result.blocks);

  // Update page title
  document.title = `${brief.title} — The Field Report`;

  // Render article
  document.getElementById('article-content').innerHTML = `
    <a href="briefs.html" style="font-family:var(--mono);font-size:11px;letter-spacing:0.08em;color:var(--gold);display:inline-block;margin-bottom:40px;">← All Briefs</a>
    <span class="article-eyebrow">${brief.country || 'Global'}</span>
    <h1 class="article-title">${brief.title}</h1>
    <div class="article-tags">
      ${brief.tags.map(t => `<span class="tag">${t}</span>`).join('')}
    </div>
    <div class="article-byline">
      ${brief.author ? `<div class="byline-item"><span class="byline-label">Author</span><span class="byline-value">${brief.author}</span></div>` : ''}
      ${brief.program ? `<div class="byline-item"><span class="byline-label">Program</span><span class="byline-value">${brief.program}</span></div>` : ''}
      ${brief.reviewer ? `<div class="byline-item"><span class="byline-label">Faculty Reviewer</span><span class="byline-value">${brief.reviewer}</span></div>` : ''}
      ${brief.date ? `<div class="byline-item"><span class="byline-label">Published</span><span class="byline-value">${formatDate(brief.date)}</span></div>` : ''}
    </div>
    <div class="article-body">${bodyHTML || '<p>Content loading...</p>'}</div>
    ${brief.substack ? `<div style="margin-top:40px;padding-top:24px;border-top:1px solid rgba(201,168,76,0.15)"><a href="${brief.substack}" target="_blank" class="btn btn-ghost">Read original →</a></div>` : ''}
  `;

  // Load related briefs
  loadRelated(pageId, brief.tags);
}

async function loadRelated(currentId, tags) {
  const all = await fetchBriefs();
  const related = all
    .map(parseBrief)
    .filter(b => b.id !== currentId && b.tags.some(t => tags.includes(t)))
    .slice(0, 3);

  const container = document.getElementById('related-briefs');
  if (related.length === 0) {
    container.closest('.related-section').style.display = 'none';
    return;
  }

  container.innerHTML = related.map(brief => `
    <a class="brief-card" href="article.html?id=${brief.id}">
      <div class="brief-card-tags">
        ${brief.tags.map(t => `<span class="tag">${t}</span>`).join('')}
      </div>
      <h3 class="brief-card-title">${brief.title}</h3>
      <p class="brief-card-excerpt">${brief.excerpt || ''}</p>
      <div class="brief-card-meta">
        <span>${brief.author}</span>
        <span class="brief-card-country">${brief.country || ''}</span>
      </div>
    </a>
  `).join('');
}

initArticle();
