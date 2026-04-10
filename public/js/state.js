/**
 * Глобальное состояние приложения и ссылки на DOM-элементы
 */

const state = {
  allRepos: [],
  selectedRepos: new Set(),
  currentFilter: "all",
  searchQuery: "",
  isProcessing: false,
};

const langColors = {
  JavaScript: "#f1e05a",
  TypeScript: "#3178c6",
  Python: "#3572A5",
  Java: "#b07219",
  "C++": "#f34b7d",
  C: "#555555",
  "C#": "#178600",
  Go: "#00ADD8",
  Rust: "#dea584",
  Ruby: "#701516",
  PHP: "#4F5D95",
  Swift: "#F05138",
  Kotlin: "#A97BFF",
  Dart: "#00B4AB",
  Shell: "#89e051",
  HTML: "#e34c26",
  CSS: "#563d7c",
  Vue: "#41b883",
  Svelte: "#ff3e00",
};

const dom = {
  repoList: document.getElementById("repoList"),
  selectAll: document.getElementById("selectAll"),
  selectedCount: document.getElementById("selectedCount"),
  search: document.getElementById("search"),
  stats: document.getElementById("stats"),
  progress: document.getElementById("progress"),
  progressFill: document.getElementById("progressFill"),
  progressText: document.getElementById("progressText"),
  btnMakePrivate: document.getElementById("btnMakePrivate"),
  btnMakePublic: document.getElementById("btnMakePublic"),
  btnAllPrivate: document.getElementById("btnAllPrivate"),
  btnAllPublic: document.getElementById("btnAllPublic"),
  btnDelete: document.getElementById("btnDelete"),
};