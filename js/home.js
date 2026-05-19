// ============================================
// HOME PAGE — loads latest 3 briefs + stats
// ============================================

async function initHome() {
  const briefs = await fetchBriefs();

  // Update stats
  const countries = [...new Set(briefs.map(b => parseBrief(b).country).filter(Boolean))];
  document.getElementById('stat-briefs').textContent = briefs.length;
  document.getElementById('stat-countries').textContent = countries.length;

  // Render latest 3 briefs
  const container = document.getElementById('latest-briefs');
  const latest = briefs.slice(0, 3).map(parseBrief);

  if (latest.length === 0) {
    container.innerHTML = '<div class="empty-state">No briefs published yet — check back soon.</div>';
    return;
  }

  container.innerHTML = latest.map(brief => `
    <a class="brief-card" href="article.html?id=${brief.id}">
      <div class="brief-card-tags">
        ${brief.tags.map(t => `<span class="tag">${t}</span>`).join('')}
      </div>
      <h3 class="brief-card-title">${brief.title}</h3>
      <p class="brief-card-excerpt">${brief.excerpt || ''}</p>
      <div class="brief-card-meta">
        <span>${brief.author}${brief.program ? ` · ${brief.program}` : ''}</span>
        <span class="brief-card-country">${brief.country || ''}</span>
      </div>
    </a>
  `).join('');
}

initHome();
