import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const { session, loading, signIn } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!loading && session) {
      navigate('/', { replace: true });
    }
  }, [loading, session, navigate]);

  const handleLogin = async () => {
    setError('');
    setSubmitting(true);

    const result = await signIn(email, password);

    if (result.error) {
      setError(result.error);
      setSubmitting(false);
      return;
    }

    // onAuthStateChange / session effect will redirect
    setSubmitting(false);
  };

  if (loading) {
    return <div style={{ padding: 24 }}>Checking session...</div>;
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f8fafc',
        padding: '24px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '420px',
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.06)',
        }}
      >
        <h1 style={{ marginTop: 0, marginBottom: '8px' }}>Login</h1>
        <p style={{ marginTop: 0, marginBottom: '20px', color: '#64748b' }}>
          Sign in with your Supabase user account
        </p>

        {error && (
          <div
            style={{
              marginBottom: '16px',
              padding: '12px',
              borderRadius: '8px',
              background: '#fef2f2',
              color: '#b91c1c',
              border: '1px solid #fecaca',
            }}
          >
            {error}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              padding: '12px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              outline: 'none',
            }}
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              padding: '12px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              outline: 'none',
            }}
          />

          <button
            type="button"
            onClick={handleLogin}
            disabled={submitting}
            style={{
              padding: '12px',
              borderRadius: '8px',
              border: 'none',
              background: '#2563eb',
              color: 'white',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            {submitting ? 'Signing in...' : 'Login'}
          </button>
        </div>
      </div>
    </div>
  );
}