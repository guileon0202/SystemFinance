// src/pages/Login.js (VERSÃO ATUALIZADA)

import React, { useState } from 'react';
// 1. Importe o useNavigate para o redirecionamento e o axios para a API
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  // 2. Adicione um estado para guardar mensagens de erro
  const [error, setError] = useState('');

  const navigate = useNavigate();

  // 3. Transforme a função em "async"
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // Limpa erros anteriores

    try {
      // 4. Envie os dados para o endpoint de login do backend
      const response = await axios.post('http://localhost:3000/api/users/login', {
        email: email,
        senha: password, // Verifique se o backend espera "senha"
      });

      // 5. Se o login for bem-sucedido, salve os dados e redirecione
      const { token, user } = response.data;

      // Salva o token e as informações do usuário no Local Storage do navegador
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      // Redireciona o usuário para a nova página de dashboard
      navigate('/dashboard');

    } catch (err) {
      // 6. Se houver erro, exiba a mensagem para o usuário
      console.error("Erro ao fazer login:", err);
      setError(err.response?.data?.message || 'Ocorreu um erro ao fazer login. Verifique suas credenciais.');
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

        {/* 7. Exiba a mensagem de erro, se houver */}
        {error && <p className="error-message">{error}</p>}

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