import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const EMAIL_RE = /^[^\s@]{1,64}@[^\s@]{1,64}\.[^\s@]{1,10}$/;

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Ingresa correo electrónico y contraseña.');
      return;
    }
    if (!EMAIL_RE.test(email)) {
      setError('Correo o contraseña incorrectos.');
      return;
    }

    setLoading(true);
    const { error: err } = await login(email, password);
    setLoading(false);
    if (err) setError(err);
  }

  return (
    <div className="login-outer">
      <div className="login-box">
        <div className="login-system-label">BOB - Sistema de Bitácora Digital</div>
        <div className="login-title">BDO · IDU-1556-2025</div>
        <div className="login-sub">
          Contrato de obra · Grupo 4<br />
          Mártires · San Cristóbal · Rafael Uribe Uribe · Santafé · Antonio Nariño
        </div>

        {error && <div className="login-error">{error}</div>}

        <form className="login-form" onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label className="form-label" htmlFor="email">Correo electrónico</label>
            <input
              id="email"
              type="email"
              className="form-input"
              placeholder="usuario@empresa.com"
              value={email}
              onChange={e => setEmail(e.target.value.slice(0, 100))}
              autoComplete="email"
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="password">Contraseña</label>
            <input
              id="password"
              type="password"
              className="form-input"
              value={password}
              onChange={e => setPassword(e.target.value.slice(0, 128))}
              autoComplete="current-password"
              required
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary btn-full"
            disabled={loading}
          >
            {loading ? 'Verificando...' : 'Ingresar al sistema'}
          </button>
        </form>
      </div>
    </div>
  );
}
