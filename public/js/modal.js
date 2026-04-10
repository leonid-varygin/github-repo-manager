/**
 * Модальные окна: подтверждение и удаление
 */

function showModal(title, desc, list, confirmClass) {
  return new Promise((resolve) => {
    const modal = document.getElementById("confirmModal");
    document.getElementById("modalTitle").textContent = title;
    document.getElementById("modalDesc").textContent = desc;
    document.getElementById("modalList").innerHTML = list
      .map((n) => `<li>${escapeHtml(n)}</li>`)
      .join("");

    const confirmBtn = document.getElementById("modalConfirm");
    confirmBtn.className = `btn ${confirmClass || ""}`;
    confirmBtn.textContent = "Подтвердить";

    modal.classList.add("active");

    const cleanup = () => {
      modal.classList.remove("active");
      confirmBtn.removeEventListener("click", onConfirm);
      document
        .getElementById("modalCancel")
        .removeEventListener("click", onCancel);
    };

    const onConfirm = () => {
      cleanup();
      resolve(true);
    };
    const onCancel = () => {
      cleanup();
      resolve(false);
    };

    confirmBtn.addEventListener("click", onConfirm);
    document
      .getElementById("modalCancel")
      .addEventListener("click", onCancel);
  });
}

function showDeleteModal(repoNames) {
  return new Promise((resolve) => {
    const modal = document.getElementById("deleteModal");
    document.getElementById("deleteDesc").textContent =
      `Будет удалено ${repoNames.length} репозиториев:`;
    document.getElementById("deleteList").innerHTML = repoNames
      .map((n) => `<li style="color:var(--red)">${escapeHtml(n)}</li>`)
      .join("");

    const confirmPhrase =
      repoNames.length === 1 ? repoNames[0] : "удалить все";
    document.getElementById("deleteExtra").innerHTML = `
      <p style="margin-top:12px">Введите <strong style="color:var(--red)">${escapeHtml(confirmPhrase)}</strong> для подтверждения:</p>
      <input type="text" class="delete-input" id="deleteInput" placeholder="${confirmPhrase}" autocomplete="off">
    `;

    const confirmBtn = document.getElementById("deleteConfirm");
    confirmBtn.disabled = true;

    modal.classList.add("active");

    setTimeout(() => document.getElementById("deleteInput")?.focus(), 100);

    const inputEl = document.getElementById("deleteInput");
    inputEl.addEventListener("input", () => {
      confirmBtn.disabled =
        inputEl.value.trim().toLowerCase() !== confirmPhrase.toLowerCase();
    });

    const cleanup = () => {
      modal.classList.remove("active");
      confirmBtn.removeEventListener("click", onConfirm);
      document
        .getElementById("deleteCancel")
        .removeEventListener("click", onCancel);
      inputEl.removeEventListener("keydown", onKeydown);
    };

    const onConfirm = () => {
      cleanup();
      resolve(true);
    };
    const onCancel = () => {
      cleanup();
      resolve(false);
    };
    const onKeydown = (e) => {
      if (e.key === "Enter" && !confirmBtn.disabled) {
        cleanup();
        resolve(true);
      }
    };

    confirmBtn.addEventListener("click", onConfirm);
    document
      .getElementById("deleteCancel")
      .addEventListener("click", onCancel);
    inputEl.addEventListener("keydown", onKeydown);
  });
}