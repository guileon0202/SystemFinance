// src/pages/Login.js

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Login.css'; // O arquivo de estilo que criaremos a seguir

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Aqui virá a lógica para autenticar com o backend
    console.log({ email, password });
    alert('Login realizado com sucesso! (Funcionalidade de backend ainda não implementada)');
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit}>
        <div className="form-header">
          {/* Você pode substituir o emoji por um SVG ou componente de ícone */}
          <span className="logo-icon blue-icon">📈</span>
          <h2>Web Finanças</h2>
        </div>

        <h3>Bem-vindo de volta!</h3>
        <p className="subtitle">Entre com suas credenciais para acessar sua conta</p>

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