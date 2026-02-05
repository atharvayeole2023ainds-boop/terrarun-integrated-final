
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import { authAPI } from '../services/api';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [contactMethod, setContactMethod] = useState<'email' | 'phone'>('email');
  const [isLoading, setIsLoading] = useState(false);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useGame();

  const from = (location.state as any)?.from?.pathname || '/home';

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    // Try real API login first
    if (isLogin) {
      try {
        const email = contactMethod === 'email' ? identifier : `${identifier}@terra.run`;
        const resp = await authAPI.login({ email, password });
        if (resp?.data?.success) {
          const token = resp.data.token;
          const user = resp.data.data?.user || resp.data.data;
          if (token) localStorage.setItem('authToken', token);
          if (user) {
            login(user as any);
          }
          navigate(from, { replace: true });
          return;
        }
      } catch (err: any) {
        // fall through to mock fallback
        console.warn('API login failed, falling back to local mock', err?.message || err);
      }
    }

    // Fallback mock behavior (keeps current developer experience)
    setTimeout(() => {
      const isAdmin = (identifier === 'admin@terra.run' || identifier === 'admin') && password === 'admin';
      if (isAdmin) {
        login({
          id: '1',
          username: 'Scout Admin',
          email: 'admin@terra.run',
          avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDu1uSH-d9lwdLA1dFTE6aUqxcRhs_Hup0FK5rkgKn05BQBY89Ad_rvXmlySPWUeL3FY-ye7dOptuN_jkgJ5N9GCwU8SibZUQJfzUI51UwrNS4dVbNA4r48asTYRldZRQ9JvtNXOtjMyjRRzpNU26cWzs-pPk4fk9JFCRoPczRsfnkWpZUsnR-jnGQ8R19HQqo8xjppKha2QHeNOVtt5XMAluRquRASI4a0dEyG2y5Ktd0CYHA-Px6sWFjGqcAeZd2tygRwMWLb9A',
          rank: 'Scout Master'
        });
        navigate(from, { replace: true });
      } else if (identifier && password) {
        login({
          id: Date.now().toString(),
          username: identifier.includes('@') ? identifier.split('@')[0] : `Runner_${identifier.slice(-4)}`,
          email: identifier.includes('@') ? identifier : `${identifier}@terra.run`,
          avatar: 'https://picsum.photos/seed/runner/200/200',
          rank: 'Novice Scout'
        });
        navigate(from, { replace: true });
      } else {
        setError('Invalid credentials. Hint: use any identifier and password.');
        setIsLoading(false);
      }
    }, 600);
  };

  return (
    <div className="flex flex-col min-h-screen bg-background-dark p-6 justify-center items-center">
      {/* Visual Background Elements */}
      <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-primary/10 to-transparent pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-full h-1/4 bg-gradient-to-t from-primary/5 to-transparent pointer-events-none"></div>

      <div className="w-full max-w-sm z-10">
        <div className="flex flex-col items-center mb-10 text-center animate-in fade-in slide-in-from-top duration-700">
          <div className="size-20 bg-primary rounded-[2rem] flex items-center justify-center shadow-2xl shadow-primary/30 mb-6 rotate-3">
            <span className="material-symbols-outlined text-black text-5xl font-black">bolt</span>
          </div>
          <h1 className="text-4xl font-black tracking-tighter text-white font-lexend">
            TERRA<span className="text-primary">RUN</span>
          </h1>
          <p className="text-slate-500 text-sm font-bold uppercase tracking-[0.2em] mt-2">Conquer your city</p>
        </div>

        <Card className="p-6">
          <div className="flex p-1 bg-white/5 rounded-xl mb-8">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${isLogin ? 'bg-primary text-black' : 'text-slate-400'}`}
            >
              Login
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${!isLogin ? 'bg-primary text-black' : 'text-slate-400'}`}
            >
              Signup
            </button>
          </div>

          <form onSubmit={handleAuth} className="space-y-5">
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-[11px] font-bold text-center animate-pulse">
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <div className="flex justify-between items-center mb-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                  {contactMethod === 'email' ? 'Email Address' : 'Phone Number'}
                </label>
                <button 
                  type="button"
                  onClick={() => {
                    setContactMethod(contactMethod === 'email' ? 'phone' : 'email');
                    setIdentifier('');
                  }}
                  className="text-[9px] font-black text-primary uppercase tracking-widest hover:underline"
                >
                  Use {contactMethod === 'email' ? 'Phone' : 'Email'} instead
                </button>
              </div>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-lg">
                  {contactMethod === 'email' ? 'alternate_email' : 'phone_iphone'}
                </span>
                <input
                  type={contactMethod === 'email' ? 'email' : 'tel'}
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder={contactMethod === 'email' ? 'runner@terra.run' : '+1 (555) 000-0000'}
                  className="w-full bg-background-dark border border-white/10 rounded-xl py-4 pl-11 pr-4 text-white placeholder:text-slate-700 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all font-medium"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Access Key</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-lg">lock</span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-background-dark border border-white/10 rounded-xl py-4 pl-11 pr-4 text-white placeholder:text-slate-700 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all font-medium"
                  required
                />
              </div>
            </div>

            <Button 
              variant="primary" 
              size="xl" 
              className="w-full mt-4" 
              type="submit" 
              isLoading={isLoading}
              icon={!isLoading ? (isLogin ? "login" : "person_add") : ""}
            >
              {isLogin ? 'Enter The Grid' : 'Initialize Protocol'}
            </Button>
          </form>

          <div className="mt-8 flex flex-col items-center gap-4">
            <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Global Authentication</p>
            <div className="flex gap-4 w-full">
              <button className="flex-1 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all active:scale-95">
                <img src="https://www.gstatic.com/images/branding/product/1x/gsa_512dp.png" className="size-5 grayscale opacity-60" alt="Google" />
              </button>
              <button className="flex-1 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all active:scale-95">
                <span className="material-symbols-outlined text-slate-500 text-xl">apple</span>
              </button>
            </div>
          </div>
        </Card>

        <p className="mt-8 text-center text-slate-600 text-[10px] font-bold uppercase tracking-widest leading-loose">
          Authorized Sector Access Only<br />
          <span className="text-primary hover:underline cursor-pointer">Encryption Protocols</span>
        </p>
      </div>
    </div>
  );
};

export default AuthPage;
