// ============================================
// BRIEFS PAGE — filterable archive
// ============================================

let allBriefs = [];

async function initBriefs() {
  allBriefs = (await fetchBriefs()).map(parseBrief);
  buildTagFilters();
  renderBriefs(allBriefs);
}

function buildTagFilters() {
  const allTags = [...new Set(allBriefs.flatMap(b => b.tags))].sort();
  const bar = document.getElementById('tag-filters');
  allTags.forEach(tag => {
    const btn = document.createElement('button');
    btn.className = 'tag-btn';
    btn.dataset.tag = tag;
    btn.textContent = tag;
    btn.addEventListener('click', () => filterByTag(tag));
    bar.appendChild(btn);
  });

  // All button listener
  bar.querySelector('[data-tag="all"]').addEventListener('click', () => filterByTag('all'));
}

function filterByTag(tag) {
  document.querySelectorAll('.tag-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tag === tag);
  });
  const filtered = tag === 'all' ? allBriefs : allBriefs.filter(b => b.tags.includes(tag));
  renderBriefs(filtered);
}

function renderBriefs(briefs) {
  const container = document.getElementById('briefs-list');

  if (briefs.length === 0) {
    container.innerHTML = '<div class="loading-state">No briefs found.</div>';
    return;
  }

  container.innerHTML = briefs.map(brief => `
    <a class="brief-row" href="article.html?id=${brief.id}">
      <div class="brief-row-left">
        <div class="brief-row-tags">
          ${brief.tags.map(t => `<span class="tag">${t}</span>`).join('')}
        </div>
        <div class="brief-row-title">${brief.title}</div>
        <div class="brief-row-meta">
          <span>${brief.author}</span>
          ${brief.program ? `<span>${brief.program}</span>` : ''}
          ${brief.reviewer ? `<span>Reviewed by ${brief.reviewer}</span>` : ''}
        </div>
      </div>
      <div class="brief-row-right">
        ${brief.country ? `<div>${brief.country}</div>` : ''}
        <div>${formatDate(brief.date)}</div>
      </div>
    </a>
  `).join('');
}

initBriefs();
