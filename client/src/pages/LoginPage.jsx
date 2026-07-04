import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import './LoginPage.css';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const toast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      toast.error('Preencha todos os campos');
      return;
    }
    setLoading(true);
    try {
      await login(username, password);
      toast.success('Bem-vindo, irmão!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Credenciais inválidas');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-bg" />
      <div className="login-container">
        <div className="login-emblem">⚜️</div>
        <div className="login-brand">
          <h1 className="login-title">PEAKY BLINDERS</h1>
          <p className="login-subtitle">Colorado RP · Sistema de Guilda</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="login-divider">
            <span>ACESSO RESTRITO</span>
          </div>

          <div className="form-group">
            <label className="form-label">Usuário</label>
            <input
              type="text"
              className="form-input"
              placeholder="Digite seu usuário"
              value={username}
              onChange={e => setUsername(e.target.value)}
              autoComplete="username"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Senha</label>
            <input
              type="password"
              className="form-input"
              placeholder="Digite sua senha"
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg w-full login-btn"
            disabled={loading}
          >
            {loading ? (
              <><div className="loading-spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> Entrando...</>
            ) : (
              '🔑 Entrar na Guilda'
            )}
          </button>
        </form>

        <p className="login-footer">
          By order of the Peaky Blinders
        </p>
      </div>
    </div>
  );
}
