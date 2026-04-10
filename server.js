require('dotenv').config();
const express = require('express');
const { Octokit } = require('octokit');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Проверка наличия токена
if (!process.env.GITHUB_TOKEN || process.env.GITHUB_TOKEN === 'ghp_your_token_here') {
  console.error('❌ Ошибка: Установите GITHUB_TOKEN в файле .env');
  console.error('   Скопируйте .env.example в .env и вставьте ваш токен');
  process.exit(1);
}

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Получить информацию о текущем пользователе + права токена
app.get('/api/user', async (req, res) => {
  try {
    const response = await octokit.rest.users.getAuthenticated();
    const data = response.data;

    // Получаем права токена из заголовков
    const scopes = response.headers['x-oauth-scopes'] || '';
    const tokenScopes = scopes ? scopes.split(',').map(s => s.trim()) : [];

    res.json({
      ...data,
      tokenScopes,
      tokenPreview: process.env.GITHUB_TOKEN.substring(0, 4) + '...' + process.env.GITHUB_TOKEN.slice(-4),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Получить все репозитории пользователя
app.get('/api/repos', async (req, res) => {
  try {
    const repos = [];
    let page = 1;
    const perPage = 100;

    while (true) {
      const { data } = await octokit.rest.repos.listForAuthenticatedUser({
        affiliation: 'owner',
        sort: 'name',
        direction: 'asc',
        per_page: perPage,
        page,
      });

      repos.push(...data);
      if (data.length < perPage) break;
      page++;
    }

    res.json(repos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Изменить видимость репозиториев (массово)
app.patch('/api/repos/visibility', async (req, res) => {
  const { repos, visibility } = req.body; // repos: [{owner, repo}], visibility: 'private' | 'public'

  if (!repos || !Array.isArray(repos) || !visibility) {
    return res.status(400).json({ error: 'Укажите repos (массив) и visibility (private/public)' });
  }

  const results = [];
  let successCount = 0;
  let errorCount = 0;

  for (const { owner, repo } of repos) {
    try {
      const { data } = await octokit.rest.repos.update({
        owner,
        repo,
        private: visibility === 'private',
      });
      results.push({ repo, status: 'ok', private: data.private });
      successCount++;
    } catch (error) {
      results.push({ repo, status: 'error', error: error.message });
      errorCount++;
    }
  }

  res.json({ successCount, errorCount, results });
});

// Удалить репозитории (массово)
app.delete('/api/repos/delete', async (req, res) => {
  const { repos } = req.body; // repos: [{owner, repo}]

  if (!repos || !Array.isArray(repos) || repos.length === 0) {
    return res.status(400).json({ error: 'Укажите repos (массив) для удаления' });
  }

  const results = [];
  let successCount = 0;
  let errorCount = 0;

  for (const { owner, repo } of repos) {
    try {
      await octokit.rest.repos.delete({ owner, repo });
      results.push({ repo, status: 'ok' });
      successCount++;
    } catch (error) {
      results.push({ repo, status: 'error', error: error.message });
      errorCount++;
    }
  }

  res.json({ successCount, errorCount, results });
});

app.listen(PORT, () => {
  console.log(`🚀 Сервер запущен: http://localhost:${PORT}`);
  console.log(`📦 Откройте в браузере для управления репозиториями`);
});