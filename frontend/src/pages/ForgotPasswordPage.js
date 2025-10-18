import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import './Login.css';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    try {
      const response = await api.post('/users/forgot-password', { email });
      setMessage(response.data.message);
    } catch (err) {
      setError(err.response?.data?.message || 'Ocorreu um erro. Tente novamente.');
    }
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit}>
        <div className="form-header">
          <span className="logo-icon blue-icon">🔑</span>
          <h2>Recuperar Senha</h2>
        </div>
        <p className="subtitle">Digite seu e-mail para receber um link de redefinição.</p>

        {error && <p className="error-message">{error}</p>}
        {message && <p className="success-message">{message}</p>}

        {!message && ( // Mostra o formulário apenas se não houver mensagem de sucesso
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
        )}

        {!message && (
            <button type="submit" className="submit-btn">
            Enviar link de redefinição
          </button>
        )}

        <div className="form-footer">
          <p>Lembrou a senha? <Link to="/login">Faça login</Link></p>
        </div>
      </form>
      <div className="back-link">
        <Link to="/">&larr; Voltar ao início</Link>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;