/**
 * Утилиты: экранирование HTML, перевод ошибок
 */

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function translateError(errMsg) {
  if (errMsg.includes("Public forks can't be made private")) {
    return "Публичные форки нельзя сделать скрытыми — это ограничение GitHub";
  }
  if (
    errMsg.includes("Resource not accessible by personal access token")
  ) {
    return "Недостаточно прав у токена (нужен scope: repo)";
  }
  if (errMsg.includes("Validation Failed")) {
    return "Ошибка валидации: " + errMsg;
  }
  if (errMsg.includes("Not Found")) {
    return "Репозиторий не найден";
  }
  return errMsg;
}