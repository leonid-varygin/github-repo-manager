/**
 * API-операции: изменение видимости, удаление репозиториев
 */

async function changeVisibility(repos, visibility) {
  if (repos.length === 0) return;

  const action = visibility === "private" ? "скрыть" : "открыть";
  const reposToChange = repos.map((r) => {
    const [owner, repo] = r.split("/");
    return { owner, repo };
  });

  const confirmed = await showModal(
    `${visibility === "private" ? "🔒" : "🔓"} ${reposToChange.length === 1 ? "Изменить видимость" : `Изменить видимость (${reposToChange.length} реп.)`}`,
    `Вы уверены, что хотите ${action} следующие репозитории?`,
    reposToChange.map((r) => r.repo),
    visibility === "private" ? "btn-private" : "btn-public"
  );

  if (!confirmed) return;

  state.isProcessing = true;
  showProgress();
  updateSelection();

  let processed = 0;
  let successCount = 0;
  let errorCount = 0;

  for (const { owner, repo } of reposToChange) {
    updateProgress(processed, reposToChange.length, `${processed + 1} / ${reposToChange.length}: ${repo}`);

    try {
      const res = await fetch("/api/repos/visibility", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repos: [{ owner, repo }], visibility }),
      });
      const data = await res.json();

      if (data.successCount > 0) {
        successCount++;
        const idx = state.allRepos.findIndex(
          (r) => r.full_name === `${owner}/${repo}`
        );
        if (idx !== -1) state.allRepos[idx].private = visibility === "private";
      } else {
        errorCount++;
        const errMsg = data.results?.[0]?.error || "Неизвестная ошибка";
        const friendly = translateError(errMsg);
        showToast(`❌ ${repo}: ${friendly}`, "error");
      }
    } catch (err) {
      errorCount++;
      showToast(`❌ ${repo}: ${err.message}`, "error");
    }
    processed++;
  }

  finishProgress(
    errorCount === 0 ? `Готово! ✅` : `Готово! ⚠️ ${errorCount} ошибок`
  );
  state.isProcessing = false;
  state.selectedRepos.clear();
  render();
  hideProgress();

  if (errorCount === 0) {
    showToast(
      `✅ ${successCount} репозиториев ${visibility === "private" ? "скрыто" : "открыто"}`,
      "success"
    );
  } else if (successCount > 0) {
    showToast(
      `⚠️ ${successCount} успешно, ${errorCount} с ошибкой`,
      "error"
    );
  }
}

async function deleteRepos(repos) {
  if (repos.length === 0) return;

  const reposToDelete = repos.map((r) => {
    const [owner, repo] = r.split("/");
    return { owner, repo };
  });

  const repoNames = reposToDelete.map((r) => r.repo);

  const confirmed = await showDeleteModal(repoNames);
  if (!confirmed) return;

  state.isProcessing = true;
  showProgress();
  setProgressColor("var(--red)");
  updateSelection();

  let processed = 0;
  let successCount = 0;
  let errorCount = 0;

  for (const { owner, repo } of reposToDelete) {
    updateProgress(processed, reposToDelete.length, `Удаление ${processed + 1} / ${reposToDelete.length}: ${repo}`);

    try {
      const res = await fetch("/api/repos/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repos: [{ owner, repo }] }),
      });
      const data = await res.json();

      if (data.successCount > 0) {
        successCount++;
        state.allRepos = state.allRepos.filter(
          (r) => r.full_name !== `${owner}/${repo}`
        );
      } else {
        errorCount++;
      }
    } catch (err) {
      errorCount++;
    }
    processed++;
  }

  finishProgress(`Готово! Удалено ${successCount} репозиториев`);
  state.isProcessing = false;
  state.selectedRepos.clear();
  render();
  hideProgress();

  if (errorCount === 0) {
    showToast(`🗑️ ${successCount} репозиториев удалено`, "success");
  } else {
    showToast(
      `⚠️ ${successCount} удалено, ${errorCount} с ошибкой`,
      "error"
    );
  }
}