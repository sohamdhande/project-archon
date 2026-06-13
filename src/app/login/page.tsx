'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (res.ok) {
        router.push('/admin');
        router.refresh();
      } else {
        const data = await res.json();
        setError(data.error || 'Invalid credentials');
      }
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'var(--bg-base)', position: 'relative', overflow: 'hidden' }}>
      
      {/* Cinematic Overlays */}
      <div className="aurora-glow" style={{ top: '-20%', left: '50%', transform: 'translateX(-50%)', width: '120vw', height: '80vh', opacity: 0.15 }} />
      <div className="noise-overlay" />
      <div className="grid-overlay" />

      <div className="glass-card" style={{ padding: '40px', width: '380px', position: 'relative', zIndex: 10 }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--accent)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '8px', textAlign: 'center' }}>
          NST-SDC
        </div>
        <h1 style={{ fontSize: '24px', fontWeight: 600, fontFamily: 'var(--font-grotesk)', marginBottom: '8px', margin: 0, textAlign: 'center', color: 'var(--text-primary)' }}>Admin Access</h1>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '32px', marginTop: 0, textAlign: 'center' }}>Project Archon</p>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={{ width: '100%', padding: '12px 16px', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-subtle)', borderRadius: '8px', color: 'var(--text-primary)', outline: 'none', fontSize: '14px' }}
              required
            />
          </div>
          <div>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ width: '100%', padding: '12px 16px', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-subtle)', borderRadius: '8px', color: 'var(--text-primary)', outline: 'none', fontSize: '14px' }}
              required
            />
          </div>

          <button type="submit" disabled={loading} style={{ width: '100%', background: 'var(--accent)', color: '#000', border: 'none', padding: '12px 16px', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', marginTop: '8px' }}>
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>

          {error && <p style={{ color: '#ef4444', fontSize: '13px', marginTop: '12px', marginBottom: 0, textAlign: 'center' }}>{error}</p>}
        </form>
      </div>
    </div>
  );
}
