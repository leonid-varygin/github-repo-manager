/**
 * Рендеринг списка репозиториев и обновление UI
 */

function getFilteredRepos() {
  return state.allRepos.filter((r) => {
    const matchFilter =
      state.currentFilter === "all" ||
      (state.currentFilter === "public" && !r.private) ||
      (state.currentFilter === "private" && r.private);
    const matchSearch =
      !state.searchQuery ||
      r.name.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
      (r.description &&
        r.description.toLowerCase().includes(state.searchQuery.toLowerCase()));
    return matchFilter && matchSearch;
  });
}

function render() {
  const filtered = getFilteredRepos();
  const publicCount = state.allRepos.filter((r) => !r.private).length;
  const privateCount = state.allRepos.filter((r) => r.private).length;

  // Stats
  dom.stats.innerHTML = `
    <div class="stat"><span class="stat-dot public"></span> ${publicCount} публичных</div>
    <div class="stat"><span class="stat-dot private"></span> ${privateCount} скрытых</div>
    <div class="stat">Всего: ${state.allRepos.length}</div>
  `;

  if (filtered.length === 0) {
    dom.repoList.innerHTML = `<div class="empty">
      <svg width="48" height="48" viewBox="0 0 16 16" fill="var(--text-secondary)">
        <path d="M2 2.5A2.5 2.5 0 0 1 4.5 0h8.75a.75.75 0 0 1 .75.75v12.5a.75.75 0 0 1-.75.75h-2.5a.75.75 0 0 1 0-1.5h1.75v-2h-8a1 1 0 0 0-.714 1.7.75.75 0 1 1-1.072 1.05A2.495 2.495 0 0 1 2 11.5Zm10.5-1h-8a1 1 0 0 0-1 1v6.708A2.486 2.486 0 0 1 4.5 9h8ZM5 12.25a.25.25 0 0 1 .25-.25h3.5a.25.25 0 0 1 .25.25v3.25a.25.25 0 0 1-.4.2l-1.45-1.087a.25.25 0 0 0-.3 0L5.4 15.7a.25.25 0 0 1-.4-.2Z"/>
      </svg>
      <p>Репозитории не найдены</p>
    </div>`;
    return;
  }

  dom.repoList.innerHTML =
    '<div class="repo-list">' +
    filtered
      .map((r) => {
        const checked = state.selectedRepos.has(r.full_name) ? "checked" : "";
        const color =
          r.language && langColors[r.language]
            ? langColors[r.language]
            : "#8b949e";
        return `
          <div class="repo-item" data-repo="${r.full_name}">
            <input type="checkbox" class="repo-checkbox" ${checked} data-repo="${r.full_name}">
            <div class="repo-info">
              <div>
                <a class="repo-name" href="${r.html_url}" target="_blank" onclick="event.stopPropagation()">
                  ${r.name}
                </a>
              </div>
              ${r.description ? `<div class="repo-desc">${escapeHtml(r.description)}</div>` : ""}
            </div>
            <div class="repo-meta">
              ${r.language ? `<span class="repo-lang"><span class="lang-dot" style="background:${color}"></span>${r.language}</span>` : ""}
              ${r.fork ? '<span class="badge" style="background:rgba(139,148,158,0.15);color:var(--text-secondary);border:1px solid rgba(139,148,158,0.3)">Форк</span>' : ""}
              <span class="badge ${r.private ? "badge-private" : "badge-public"}">${r.private ? "Скрытый" : "Публичный"}</span>
            </div>
          </div>
        `;
      })
      .join("") +
    "</div>";

  updateSelection();
}

function updateSelection() {
  const count = state.selectedRepos.size;
  dom.selectedCount.textContent = `Выбрано: ${count}`;
  dom.btnMakePrivate.disabled = count === 0 || state.isProcessing;
  dom.btnMakePublic.disabled = count === 0 || state.isProcessing;
  dom.btnAllPrivate.disabled = state.isProcessing;
  dom.btnAllPublic.disabled = state.isProcessing;
  dom.btnDelete.disabled = count === 0 || state.isProcessing;

  const filtered = getFilteredRepos();
  const allFilteredSelected =
    filtered.length > 0 &&
    filtered.every((r) => state.selectedRepos.has(r.full_name));
  dom.selectAll.checked = allFilteredSelected;
  dom.selectAll.indeterminate =
    !allFilteredSelected &&
    filtered.some((r) => state.selectedRepos.has(r.full_name));
}