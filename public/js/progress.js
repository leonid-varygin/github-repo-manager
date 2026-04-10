/**
 * Управление прогресс-баром
 */

function showProgress() {
  dom.progress.classList.add("active");
  dom.progressFill.style.width = "0%";
  dom.progressFill.style.background = "";
}

function updateProgress(processed, total, text) {
  dom.progressFill.style.width = `${(processed / total) * 100}%`;
  dom.progressText.textContent = text;
}

function finishProgress(text) {
  dom.progressFill.style.width = "100%";
  dom.progressText.textContent = text;
}

function setProgressColor(color) {
  dom.progressFill.style.background = color;
}

function hideProgress(delay = 3000) {
  setTimeout(() => {
    dom.progress.classList.remove("active");
    dom.progressFill.style.background = "";
  }, delay);
}