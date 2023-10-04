import { useState, useEffect } from 'react';
import { getRepos } from '../api';

function Home() {
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [username, setUsername] = useState(() => localStorage.getItem('github_user') || '');

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

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-100 mb-2">Meus repositórios</h1>
        <p className="text-slate-400">Conectado ao GitHub — altere as descrições na área Admin.</p>
      </div>

      <div className="flex flex-wrap gap-3 items-center mb-6">
        <input
          type="text"
          placeholder="Usuário GitHub (ex: octocat)"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && loadRepos(username)}
          className="px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent w-64"
        />
        <button
          onClick={() => loadRepos(username)}
          disabled={loading}
          className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-medium disabled:opacity-50 transition"
        >
          {loading ? 'Carregando…' : 'Buscar'}
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-lg bg-red-900/30 border border-red-800 text-red-200">
          {error}
        </div>
      )}

      {loading && !repos.length ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-40 rounded-xl bg-slate-800/50 animate-pulse" />
          ))}
        </div>
      ) : repos.length === 0 && !error ? (
        <p className="text-slate-400">Digite um usuário e clique em Buscar.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {repos.map((repo) => (
            <a
              key={repo.id}
              href={repo.html_url}
              target="_blank"
              rel="noopener noreferrer"
              className="block p-5 rounded-xl bg-slate-800/60 border border-slate-700 hover:border-cyan-500/50 hover:bg-slate-800 transition group"
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <h2 className="font-semibold text-slate-100 group-hover:text-cyan-400 transition truncate">
                  {repo.name}
                </h2>
                {repo.isCustomDescription && (
                  <span className="shrink-0 text-xs px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300">
                    Editado
                  </span>
                )}
              </div>
              <p className="text-sm text-slate-400 line-clamp-3 mb-3">{repo.description || 'Sem descrição'}</p>
              <div className="flex flex-wrap gap-2 text-xs text-slate-500">
                {repo.language && (
                  <span className="px-2 py-0.5 rounded bg-slate-700/80">{repo.language}</span>
                )}
                <span>★ {repo.stargazers_count}</span>
                <span>Fork {repo.forks_count}</span>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

export default Home;
