import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export const AuthScreen = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, signup } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await signup(email, password);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-semibold mb-2">⏱️</h1>
          <h2 className="text-2xl font-semibold mb-2">Attention Tracker</h2>
          <p className="text-zinc-500 text-sm">Deep Work & Shallow Work</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl outline-none focus:border-white transition-colors"
              required
            />
          </div>

          <div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mot de passe"
              className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl outline-none focus:border-white transition-colors"
              required
              minLength={6}
            />
          </div>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-white text-black rounded-xl font-medium hover:bg-zinc-200 transition-colors disabled:opacity-50"
          >
            {loading ? 'Chargement...' : isLogin ? 'Se connecter' : 'Créer un compte'}
          </button>

          <button
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
            }}
            className="w-full text-sm text-zinc-500 hover:text-white transition-colors"
          >
            {isLogin ? 'Pas de compte ? Créer un compte' : 'Déjà un compte ? Se connecter'}
          </button>
        </form>
      </div>
    </div>
  );
};
