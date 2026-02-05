// frontend/src/pages/LoginPage.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import { authAPI } from '../services/api';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useGame();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let resp;
      if (isLogin) {
        resp = await authAPI.login({ email: formData.email, password: formData.password });
      } else {
        resp = await authAPI.register({ username: formData.username, email: formData.email, password: formData.password });
      }
      if (resp.data.success) {
        const token = resp.data.data?.token || resp.data.token;
        const user = resp.data.data?.user || resp.data.data;
        if (token) localStorage.setItem('authToken', token);
        if (user) login(user);
        navigate('/home');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || (isLogin ? 'Login failed' : 'Registration failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background-dark px-4 py-8">
      {/* Logo/Header */}
      <div className="flex flex-col items-center mb-12 mt-8">
        <div className="size-20 bg-primary rounded-full flex items-center justify-center mb-4">
          <span className="material-symbols-outlined text-background-dark text-4xl fill">
            location_on
          </span>
        </div>
        <h1 className="text-white text-3xl font-black tracking-tight">TerraRun</h1>
        <p className="text-primary text-sm font-bold uppercase tracking-widest mt-1">
          Territory Conquest
        </p>
      </div>

      {/* Tab Switcher */}
      <div className="flex gap-2 mb-8">
        <button
          onClick={() => setIsLogin(true)}
          className={`flex-1 h-12 rounded-xl font-bold transition-all ${
            isLogin
              ? 'bg-primary text-background-dark'
              : 'bg-card-dark text-white/60 border border-white/10'
          }`}
        >
          Login
        </button>
        <button
          onClick={() => setIsLogin(false)}
          className={`flex-1 h-12 rounded-xl font-bold transition-all ${
            !isLogin
              ? 'bg-primary text-background-dark'
              : 'bg-card-dark text-white/60 border border-white/10'
          }`}
        >
          Register
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {!isLogin && (
          <div>
            <label className="text-white/70 text-sm font-medium mb-2 block">Username</label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              className="w-full h-12 bg-card-dark border border-white/10 rounded-xl px-4 text-white placeholder:text-white/40 focus:border-primary focus:outline-none transition-colors"
              placeholder="Choose a username"
              required={!isLogin}
            />
          </div>
        )}

        <div>
          <label className="text-white/70 text-sm font-medium mb-2 block">Email</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full h-12 bg-card-dark border border-white/10 rounded-xl px-4 text-white placeholder:text-white/40 focus:border-primary focus:outline-none transition-colors"
            placeholder="your@email.com"
            required
          />
        </div>

        <div>
          <label className="text-white/70 text-sm font-medium mb-2 block">Password</label>
          <input
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            className="w-full h-12 bg-card-dark border border-white/10 rounded-xl px-4 text-white placeholder:text-white/40 focus:border-primary focus:outline-none transition-colors"
            placeholder="••••••••"
            required
            minLength={8}
          />
          {!isLogin && (
            <p className="text-white/50 text-xs mt-2">Minimum 8 characters</p>
          )}
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full h-14 bg-primary rounded-xl font-bold text-background-dark flex items-center justify-center gap-2 active:scale-95 transition-transform disabled:opacity-50 disabled:scale-100 mt-6"
        >
          {loading ? (
            <>
              <span className="animate-spin material-symbols-outlined">refresh</span>
              {isLogin ? 'Logging in...' : 'Creating account...'}
            </>
          ) : (
            <>
              <span className="material-symbols-outlined">
                {isLogin ? 'login' : 'person_add'}
              </span>
              {isLogin ? 'Login' : 'Create Account'}
            </>
          )}
        </button>
      </form>

      {/* Info Cards */}
      <div className="mt-12 space-y-3">
        <div className="bg-card-dark border border-white/5 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <span className="material-symbols-outlined text-primary text-2xl">location_on</span>
            <div>
              <h3 className="text-white font-bold mb-1">Capture Territories</h3>
              <p className="text-white/60 text-sm">
                Run or cycle loops to claim real-world locations
              </p>
            </div>
          </div>
        </div>

        <div className="bg-card-dark border border-white/5 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <span className="material-symbols-outlined text-primary text-2xl fill">stars</span>
            <div>
              <h3 className="text-white font-bold mb-1">Earn TerraCoins</h3>
              <p className="text-white/60 text-sm">
                Get rewards for conquests and redeem for real prizes
              </p>
            </div>
          </div>
        </div>

        <div className="bg-card-dark border border-white/5 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <span className="material-symbols-outlined text-primary text-2xl">shield</span>
            <div>
              <h3 className="text-white font-bold mb-1">Defend Your Turf</h3>
              <p className="text-white/60 text-sm">
                Protect territories from rivals with shield power
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-auto pt-8 text-center">
        <p className="text-white/40 text-xs">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
};

export default LoginPage;