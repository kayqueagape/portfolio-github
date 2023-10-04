import { useState, useEffect } from 'react';
import { getRepos, updateDescription, deleteDescription } from '../api';

function Admin() {
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [username, setUsername] = useState(() => localStorage.getItem('github_user') || '');
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState(null);

  const loadRepos = async (user) => {
    if (!user?.trim()) {
      setError('Digite seu usuário do GitHub');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await getRepos(user.trim());
      setRepos(data);
      localStorage.setItem('github_user', user.trim());
    } catch (e) {
      setError(e.message);
      setRepos([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (username) loadRepos(username);
    else setLoading(false);
  }, []);

  const startEdit = (repo) => {
    setEditingId(repo.id);
    setEditText(repo.description || '');
    setSaveMsg(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditText('');
    setSaveMsg(null);
  };

  const handleSave = async () => {
    if (editingId == null) return;
    setSaving(true);
    setSaveMsg(null);
    try {
      await updateDescription(editingId, editText);
      setRepos((prev) =>
        prev.map((r) => (r.id === editingId ? { ...r, description: editText, isCustomDescription: true } : r))
      );
      setSaveMsg('Salvo.');
      setTimeout(() => {
        setEditingId(null);
        setEditText('');
        setSaveMsg(null);
      }, 800);
    } catch (e) {
      setSaveMsg(e.message || 'Erro ao salvar');
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveCustom = async (repo) => {
    if (!repo.isCustomDescription) return;
    setSaving(true);
    try {
      await deleteDescription(repo.id);
      setRepos((prev) =>
        prev.map((r) =>
          r.id === repo.id ? { ...r, description: null, isCustomDescription: false } : r
        )
      );
    } catch (e) {
      setSaveMsg(e.message || 'Erro ao remover');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-100 mb-2">Admin — Editar descrições</h1>
        <p className="text-slate-400">Altere o texto “sobre o projeto” que aparece em cada repositório no portfólio.</p>
      </div>

      <div className="flex flex-wrap gap-3 items-center mb-6">
        <input
          type="text"
          placeholder="Usuário GitHub"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && loadRepos(username)}
          className="px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 w-56"
        />
        <button
          onClick={() => loadRepos(username)}
          disabled={loading}
          className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-medium disabled:opacity-50 transition"
        >
          Carregar repos
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-lg bg-red-900/30 border border-red-800 text-red-200">
          {error}
        </div>
      )}

      {saveMsg && (
        <div className={`mb-6 p-4 rounded-lg ${saveMsg === 'Salvo.' ? 'bg-emerald-900/30 border-emerald-800 text-emerald-200' : 'bg-red-900/30 border-red-800 text-red-200'} border`}>
          {saveMsg}
        </div>
      )}

      {loading && !repos.length ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 rounded-xl bg-slate-800/50 animate-pulse" />
          ))}
        </div>
      ) : repos.length === 0 && !error ? (
        <p className="text-slate-400">Digite o usuário e clique em Carregar repos.</p>
      ) : (
        <div className="space-y-4">
          {repos.map((repo) => (
            <div
              key={repo.id}
              className="p-5 rounded-xl bg-slate-800/60 border border-slate-700"
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <h2 className="font-semibold text-slate-100">{repo.name}</h2>
                {repo.isCustomDescription && (
                  <span className="text-xs px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300">
                    Descrição editada
                  </span>
                )}
              </div>

              {editingId === repo.id ? (
                <div className="space-y-3">
                  <textarea
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-600 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-y"
                    placeholder="O que é este projeto?"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-medium disabled:opacity-50"
                    >
                      {saving ? 'Salvando…' : 'Salvar'}
                    </button>
                    <button
                      onClick={cancelEdit}
                      disabled={saving}
                      className="px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm text-slate-400 flex-1 min-w-0">
                    {repo.description || 'Sem descrição'}
                  </p>
                  <button
                    onClick={() => startEdit(repo)}
                    className="text-sm px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200"
                  >
                    Editar
                  </button>
                  {repo.isCustomDescription && (
                    <button
                      onClick={() => handleRemoveCustom(repo)}
                      disabled={saving}
                      className="text-sm px-3 py-1.5 rounded-lg bg-red-900/50 hover:bg-red-800/50 text-red-200 disabled:opacity-50"
                    >
                      Remover edição
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Admin;
