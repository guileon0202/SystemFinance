import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api';
import './Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const navigate = useNavigate();
  const location = useLocation();

  // Verifica se há uma mensagem vindo da página de registro
  useEffect(() => {
    if (location.state?.message) {
      setSuccess(location.state.message);
    }
  }, [location.state]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const response = await api.post('/users/login', {
        email: email,
        senha: password,
      });

      const { token, user } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      navigate('/dashboard');

    } catch (err) {
      console.error("Erro ao fazer login:", err);
      setError(err.response?.data?.message || 'Ocorreu um erro. Verifique suas credenciais.');
    }
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit}>
        <div className="form-header">
          <span className="logo-icon blue-icon">📈</span>
          <h2>Web Finanças</h2>
        </div>
        <h3>Bem-vindo de volta!</h3>
        <p className="subtitle">Entre com suas credenciais para acessar sua conta</p>
        
        {error && <p className="error-message">{error}</p>}
        {success && <p className="success-message">{success}</p>}

        <div className="input-group">
          <label htmlFor="email">E-mail</label>
          <input
            type="email"
            id="email"
            placeholder="seu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="input-group">
          <label htmlFor="password">Senha</label>
          <div className="password-input-wrapper">
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              placeholder="Digite sua senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <span
              className="password-toggle-icon"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? '🙈' : '👁️'}
            </span>
          </div>
        </div>
        
        <div className="forgot-password-link">
          <Link to="/esqueci-senha">Esqueci minha senha</Link>
        </div>

        <button type="submit" className="submit-btn">
          Entrar
        </button>

        <div className="form-footer">
          <p>
            Não tem uma conta? <Link to="/register">Cadastre-se</Link>
          </p>
        </div>
      </form>

      <div className="back-link">
        <Link to="/">&larr; Voltar ao início</Link>
      </div>
    </div>
  );
};

export default Login;