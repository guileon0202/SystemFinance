import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import './Register.css';

const Register = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('As senhas não coincidem!');
      return;
    }

    // Verifica se os termos foram aceitos antes de prosseguir
    if (!termsAccepted) {
        setError('Você deve aceitar os Termos de Uso e a Política de Privacidade para continuar.');
        return;
    }

    try {
      // Usa a instância 'api' que já lida com a URL base
      await api.post('/users/register', {
        nome: fullName,
        email: email,
        senha: password,
      });

      // Redireciona para a página de login com uma mensagem de sucesso
      navigate('/login', { state: { message: 'Conta criada com sucesso! Faça o login para continuar.' } });

    } catch (err) {
      console.error("Erro ao registrar:", err);
      setError(err.response?.data?.message || 'Ocorreu um erro ao criar a conta. Tente novamente.');
    }
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
        
        {error && <p className="error-message">{error}</p>}
        
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
        
        <div className="terms-group">
          <input 
            type="checkbox" 
            id="terms" 
            checked={termsAccepted} 
            onChange={(e) => setTermsAccepted(e.target.checked)} 
          />
          <label htmlFor="terms">
            Eu li e aceito os{' '}
            <Link to="/termos-de-uso" target="_blank">Termos de Uso</Link> e a{' '}
            <Link to="/politica-de-privacidade" target="_blank">Política de Privacidade</Link>.
          </label>
        </div>
        
        <button type="submit" className="submit-btn" disabled={!termsAccepted}>
          Criar conta
        </button>

        <div className="form-footer">
          <p>Já tem uma conta? <Link to="/login">Faça login</Link></p>
        </div>
      </form>

      <div className="back-link">
        <Link to="/">&larr; Voltar ao início</Link>
      </div>
    </div>
  );
};

export default Register;