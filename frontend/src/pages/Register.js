// src/pages/Register.js

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // 1. Importe o useNavigate
import axios from 'axios'; // 2. Importe o axios
import './Register.css';

const Register = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState(''); // 3. Estado para guardar mensagens de erro

  const navigate = useNavigate(); // Hook para navegar entre páginas

  // 4. A função agora é "async" para poder esperar a resposta do backend
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // Limpa erros anteriores

    if (password !== confirmPassword) {
      setError('As senhas não coincidem!');
      return;
    }

    try {
      // 5. ENVIANDO OS DADOS COM O AXIOS
      // ATENÇÃO: Verifique se a URL abaixo corresponde à porta e rota do seu backend!
      await axios.post('http://localhost:3000/api/users/register', {
        nome: fullName, // Verifique se os nomes dos campos batem com o que seu backend espera
        email: email,
        senha: password,
      });

      // Se a requisição deu certo:
      alert('Conta criada com sucesso! Você será redirecionado para o login.');
      navigate('/login'); // Redireciona o usuário para a página de login

    } catch (err) {
      // Se a requisição deu erro:
      console.error("Erro ao registrar:", err);
      // Pega a mensagem de erro do backend, se houver, ou mostra uma mensagem genérica
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

        {/* 6. Exibindo a mensagem de erro, se houver */}
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