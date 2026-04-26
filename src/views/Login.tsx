import React, { useState } from 'react';

interface LoginProps {
  onLogin: () => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!username || !password) {
      setError('Please enter your credentials.');
      return;
    }
    setLoading(true);
    // Simulate auth delay for realism
    setTimeout(() => {
      setLoading(false);
      onLogin();
    }, 900);
  };

  const fillDemo = () => {
    setUsername('dr.jenkins');
    setPassword('demo1234');
    setError('');
  };

  return (
    <div className="min-h-screen flex bg-surface">
      {/* Left Panel — Branding */}
      <div className="hidden lg:flex lg:w-1/2 signature-gradient flex-col justify-between p-12 text-white relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-white translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-white -translate-x-1/3 translate-y-1/3" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-16">
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>psychology</span>
            </div>
            <div>
              <h1 className="font-headline font-bold text-xl leading-tight">Psychiatry Care</h1>
              <p className="text-white/70 text-xs uppercase tracking-widest font-label">Clinical EHR Platform</p>
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="font-headline font-bold text-4xl leading-tight">
              Streamlined care,<br />
              <span className="text-white/80">from intake to insight.</span>
            </h2>
            <p className="text-white/70 text-lg leading-relaxed max-w-md">
              A unified platform for psychiatric documentation, medication management, outcomes tracking, and secure care coordination.
            </p>
          </div>
        </div>

        <div className="relative z-10 grid grid-cols-3 gap-4">
          {[
            { icon: 'description', label: 'Smart Charting' },
            { icon: 'prescriptions', label: 'e-Prescribing' },
            { icon: 'insights', label: 'Outcomes Analytics' },
          ].map(f => (
            <div key={f.label} className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm border border-white/20">
              <span className="material-symbols-outlined text-white/90 mb-2 block" style={{ fontVariationSettings: "'FILL' 1" }}>{f.icon}</span>
              <p className="text-sm font-medium text-white/80">{f.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right Panel — Login Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-10 lg:hidden">
            <div className="w-10 h-10 rounded-xl signature-gradient flex items-center justify-center">
              <span className="material-symbols-outlined text-white" style={{ fontVariationSettings: "'FILL' 1" }}>psychology</span>
            </div>
            <h1 className="font-headline font-bold text-on-surface text-lg">Psychiatry Care EHR</h1>
          </div>

          <div className="mb-8">
            <h2 className="font-headline font-bold text-3xl text-on-surface">Welcome back</h2>
            <p className="text-on-surface-variant mt-2">Sign in to your provider account to continue.</p>
          </div>

          {/* Demo credentials notice */}
          <div className="mb-6 p-4 bg-primary/5 border border-primary/20 rounded-xl flex items-start gap-3">
            <span className="material-symbols-outlined text-primary text-lg mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>info</span>
            <div>
              <p className="text-sm font-bold text-primary">Demo Mode</p>
              <p className="text-xs text-on-surface-variant mt-0.5">Use any credentials or{' '}
                <button onClick={fillDemo} className="text-primary font-bold underline underline-offset-2">auto-fill demo account</button>
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-on-surface mb-2">Provider Username / NPI</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-lg">person</span>
                <input
                  type="text"
                  placeholder="dr.jenkins"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl py-3.5 pl-12 pr-4 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:ring-2 focus:ring-primary/30 focus:border-primary/50 outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-bold text-on-surface">Password</label>
                <button type="button" className="text-xs text-primary font-medium hover:underline">Forgot password?</button>
              </div>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-lg">lock</span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl py-3.5 pl-12 pr-12 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:ring-2 focus:ring-primary/30 focus:border-primary/50 outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary transition-colors"
                >
                  <span className="material-symbols-outlined text-lg">{showPassword ? 'visibility_off' : 'visibility'}</span>
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-error text-sm bg-error/10 p-3 rounded-lg">
                <span className="material-symbols-outlined text-sm">error</span>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 signature-gradient text-white font-bold rounded-xl shadow-sm hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Authenticating...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-sm">login</span>
                  Sign In Securely
                </>
              )}
            </button>
          </form>

          <p className="text-center text-xs text-on-surface-variant mt-8">
            © 2026 Psychiatry Care EHR · <span className="hover:text-primary cursor-pointer">Privacy Policy</span> · <span className="hover:text-primary cursor-pointer">Terms of Service</span>
          </p>
        </div>
      </div>
    </div>
  );
}
