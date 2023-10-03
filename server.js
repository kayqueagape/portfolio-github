import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { configDotenv } from 'dotenv';
configDotenv

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3001;

const GITHUB_USER = process.env.GITHUB_USER || 'profile';
const DATA_FILE = path.join(__dirname, 'data', 'descriptions.json');

app.use(cors());
app.use(express.json());

function ensureDataDir() {
  const dir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify({}, null, 2));
  }
}

function readDescriptions() {
  ensureDataDir();
  return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
}

function writeDescriptions(data) {
  ensureDataDir();
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
}

app.get('/api/repos', async (req, res) => {
  try {
    const username = req.query.user || GITHUB_USER;
    const url = `https://api.github.com/users/${encodeURIComponent(username)}/repos?per_page=100&sort=updated`;
    const response = await fetch(url, {
      headers: { 'Accept': 'application/vnd.github.v3+json' }
    });
    if (!response.ok) {
      return res.status(response.status).json({
        error: 'Unable to retrieve repositories',
        detail: response.status === 404 ? 'User not found' : await response.text()
      });
    }
    const repos = await response.json();
    const custom = readDescriptions();
    const merged = repos.map(repo => ({
      id: repo.id,
      name: repo.name,
      full_name: repo.full_name,
      description: custom[repo.id]?.text ?? repo.description ?? 'No description',
      isCustomDescription: !!custom[repo.id],
      html_url: repo.html_url,
      language: repo.language,
      stargazers_count: repo.stargazers_count,
      forks_count: repo.forks_count,
      updated_at: repo.updated_at,
      topics: repo.topics || []
    }));
    res.json(merged);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error retrieving repositories', detail: err.message });
  }
});

app.get('/api/repos/:id/description', (req, res) => {
  const custom = readDescriptions();
  const id = req.params.id;
  const desc = custom[id];
  res.json(desc ? { text: desc.text } : { text: null });
});

app.put('/api/repos/:id/description', (req, res) => {
  const id = req.params.id;
  const { text } = req.body;
  if (text === undefined) {
    return res.status(400).json({ error: '"text" the field is required' });
  }
  const custom = readDescriptions();
  custom[id] = { text: String(text).trim(), updatedAt: new Date().toISOString() };
  writeDescriptions(custom);
  res.json({ ok: true, description: custom[id] });
});

app.delete('/api/repos/:id/description', (req, res) => {
  const id = req.params.id;
  const custom = readDescriptions();
  delete custom[id];
  writeDescriptions(custom);
  res.json({ ok: true });
});

app.listen(PORT, () => {
  console.log(`API Running http://localhost:${PORT}`);
});
