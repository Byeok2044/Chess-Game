import { useState } from 'react';
import { useAuth } from './lib/AuthContext.tsx';

export default function AuthPanel() {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setBusy(true);

    if (mode === 'signin') {
      const err = await signIn(email, password);
      setBusy(false);
      if (err) {
        setError(err);
      } else {
        setSuccess('Signed in successfully!');
      }
      return;
    }

    const result = await signUp(email, password, username);
    setBusy(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    setSuccess(
      result.needsEmailConfirmation
        ? 'Account created! Check your email to confirm before signing in.'
        : 'Account created successfully! You\'re signed in.'
    );
    setEmail('');
    setPassword('');
    setUsername('');
  }

  function switchMode() {
    setMode((m) => (m === 'signin' ? 'signup' : 'signin'));
    setError(null);
    setSuccess(null);
  }

  return (
    <div className="menu-card ai-card" style={{ width: '100%' }}>
      <div className="menu-card-label">{mode === 'signin' ? 'Sign in' : 'Create an account'}</div>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%', marginTop: 8 }}>
        {mode === 'signup' && (
          <input
            className="auth-input"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
            required
          />
        )}
        <input
          className="auth-input"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
        />
        <input
          className="auth-input"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          minLength={6}
          required
        />
        <button className="btn-primary" type="submit" disabled={busy}>
          {busy ? 'Please wait…' : mode === 'signin' ? 'Sign in' : 'Sign up'}
        </button>
      </form>
      {error && <p className="auth-message auth-error">{error}</p>}
      {success && <p className="auth-message auth-success">✓ {success}</p>}
      <button
        className="btn-ghost"
        style={{ marginTop: 10 }}
        onClick={switchMode}
      >
        {mode === 'signin' ? 'Need an account? Sign up' : 'Have an account? Sign in'}
      </button>
    </div>
  );
}