// src/pages/Register.js

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Register.css'; // <<--- ESTA LINHA É A MAIS IMPORTANTE!

const Register = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert('As senhas não coincidem!');
      return;
    }
    console.log({ fullName, email, password });
    alert('Conta criada com sucesso! (Funcionalidade de backend ainda não implementada)');
  };

  return (
    <div className="register-container">
      <form className="register-form" onSubmit={handleSubmit}>
        <div className="form-header">
           <span className="logo-icon">📈</span>
           <h2>Web Finanças</h2>
        </div>

        <h3>Criar conta</h3>
        <p className="subtitle">Preencha os dados abaixo para começar a usar</p>

        <div className="input-group">
          <label htmlFor="fullName">Nome completo</label>
          <input
            type="text"
            id="fullName"
            placeholder="Seu nome completo"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />
        </div>

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

        <div className="input-group">
          <label htmlFor="confirmPassword">Confirmar senha</label>
          <div className="password-input-wrapper">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              id="confirmPassword"
              placeholder="Confirme sua senha"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <span
              className="password-toggle-icon"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? '🙈' : '👁️'}
            </span>
          </div>
        </div>

        <button type="submit" className="submit-btn">
          Criar conta
        </button>

        <div className="form-footer">
          <p>
            Já tem uma conta? <Link to="/login">Faça login</Link>
          </p>
        </div>
      </form>

      <div className="back-link">
        <Link to="/">&larr; Voltar ao início</Link>
      </div>
    </div>
  );
};

export default Register;