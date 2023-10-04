const API_BASE = import.meta.env.VITE_API_URL || '';

export async function getRepos(username) {
  const url = username ? `${API_BASE}/api/repos?user=${encodeURIComponent(username)}` : `${API_BASE}/api/repos`;
  const res = await fetch(url);
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || data.detail || 'Erro ao carregar repositórios');
  }
  return res.json();
}

export async function getDescription(repoId) {
  const res = await fetch(`${API_BASE}/api/repos/${repoId}/description`);
  if (!res.ok) throw new Error('Erro ao carregar descrição');
  const data = await res.json();
  return data.text;
}

export async function updateDescription(repoId, text) {
  const res = await fetch(`${API_BASE}/api/repos/${repoId}/description`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text })
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Erro ao salvar');
  }
  return res.json();
}

export async function deleteDescription(repoId) {
  const res = await fetch(`${API_BASE}/api/repos/${repoId}/description`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Erro ao remover descrição');
  return res.json();
}
