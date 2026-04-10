/**
 * Точка входа: инициализация, обработчики событий, проверка токена
 */

async function init() {
  try {
    const [userRes, reposRes] = await Promise.all([
      fetch("/api/user"),
      fetch("/api/repos"),
    ]);

    if (!userRes.ok || !reposRes.ok) throw new Error("API error");

    const user = await userRes.json();
    state.allRepos = await reposRes.json();

    document.getElementById("userInfo").innerHTML = `
      <img src="${user.avatar_url}" alt="${user.login}">
      <span><strong>${user.name || user.login}</strong> · ${user.public_repos} публичных · ${state.allRepos.length - user.public_repos} скрытых</span>
    `;

    checkTokenScopes(user);
    render();
  } catch (err) {
    dom.repoList.innerHTML = `<div class="empty"><p>❌ Ошибка загрузки: ${err.message}</p><p style="margin-top:8px">Проверьте GITHUB_TOKEN в файле .env</p></div>`;
  }
}

function checkTokenScopes(user) {
  const scopes = user.tokenScopes || [];
  const warning = document.getElementById("tokenWarning");
  const missing = [];

  // Fine-grained tokens may not report scopes — skip check if empty and token looks fine-grained
  if (
    scopes.length === 0 &&
    user.tokenPreview &&
    !user.tokenPreview.startsWith("ghp_")
  ) {
    return;
  }

  const hasRepo = scopes.some((s) => s === "repo" || s === "public_repo");
  const hasDelete = scopes.some((s) => s === "delete_repo");

  if (!hasRepo)
    missing.push(
      "<code>repo</code> — для смены видимости (публичный/скрытый)"
    );
  if (!hasDelete)
    missing.push("<code>delete_repo</code> — для удаления репозиториев");

  if (missing.length > 0) {
    warning.innerHTML = `
      <strong>⚠️ Недостаточно прав у токена (${user.tokenPreview || "токен"})</strong><br>
      Текущие права: ${scopes.length > 0 ? scopes.map((s) => "<code>" + s + "</code>").join(", ") : "не определены"}<br><br>
      Не хватает прав:<br>
      ${missing.map((m) => "• " + m).join("<br>")}<br><br>
      👉 <a href="https://github.com/settings/tokens" target="_blank">Пересоздайте токен</a> с нужными правами и обновите <code>.env</code>
    `;
    warning.classList.add("active");
  }
}

// --- Обработчики событий ---

// Клик по элементу списка репозиториев
dom.repoList.addEventListener("click", (e) => {
  const item = e.target.closest(".repo-item");
  if (!item || e.target.tagName === "A") return;
  const fullName = item.dataset.repo;
  if (state.selectedRepos.has(fullName)) {
    state.selectedRepos.delete(fullName);
  } else {
    state.selectedRepos.add(fullName);
  }
  render();
});

// Выбрать все
dom.selectAll.addEventListener("change", () => {
  const filtered = getFilteredRepos();
  if (dom.selectAll.checked) {
    filtered.forEach((r) => state.selectedRepos.add(r.full_name));
  } else {
    filtered.forEach((r) => state.selectedRepos.delete(r.full_name));
  }
  render();
});

// Поиск
dom.search.addEventListener("input", (e) => {
  state.searchQuery = e.target.value;
  render();
});

// Фильтры
document.querySelectorAll(".filter-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document
      .querySelectorAll(".filter-btn")
      .forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    state.currentFilter = btn.dataset.filter;
    render();
  });
});

// Кнопки действий
dom.btnMakePrivate.addEventListener("click", () => {
  changeVisibility([...state.selectedRepos], "private");
});

dom.btnMakePublic.addEventListener("click", () => {
  changeVisibility([...state.selectedRepos], "public");
});

dom.btnAllPrivate.addEventListener("click", () => {
  const repos = state.allRepos
    .filter((r) => !r.private)
    .map((r) => r.full_name);
  if (repos.length === 0) {
    showToast("Все репозитории уже скрыты", "info");
    return;
  }
  state.selectedRepos.clear();
  repos.forEach((r) => state.selectedRepos.add(r));
  changeVisibility(repos, "private");
});

dom.btnAllPublic.addEventListener("click", () => {
  const repos = state.allRepos
    .filter((r) => r.private)
    .map((r) => r.full_name);
  if (repos.length === 0) {
    showToast("Все репозитории уже публичные", "info");
    return;
  }
  state.selectedRepos.clear();
  repos.forEach((r) => state.selectedRepos.add(r));
  changeVisibility(repos, "public");
});

dom.btnDelete.addEventListener("click", () => {
  deleteRepos([...state.selectedRepos]);
});

// Старт
init();