import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import './Login.css';

const ResetPasswordPage = () => {
  
  const { token } = useParams();
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword !== confirmPassword) {
      setError('As senhas não coincidem!');
      return;
    }

    try {
      const response = await api.post('/users/reset-password', { token, newPassword });
      setSuccess(response.data.message + ' Você será redirecionado para o login em 5 segundos.');

      // Redireciona para a página de login após 5 segundos
      setTimeout(() => {
        navigate('/login');
      }, 5000);

    } catch (err) {
      setError(err.response?.data?.message || 'Ocorreu um erro. Tente novamente.');
    }
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit}>
        <div className="form-header">
          <span className="logo-icon blue-icon">🔐</span>
          <h2>Crie sua Nova Senha</h2>
        </div>

        {error && <p className="error-message">{error}</p>}
        {success && <p className="success-message">{success}</p>}

        {/* Mostra o formulário apenas se a senha ainda não foi redefinida com sucesso */}
        {!success && (
          <>
            <p className="subtitle" style={{marginBottom: '2rem'}}>Digite e confirme sua nova senha abaixo.</p>
            <div className="input-group">
              <label htmlFor="newPassword">Nova Senha</label>
              <input
                type="password"
                id="newPassword"
                placeholder="Digite a nova senha"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>
            <div className="input-group">
              <label htmlFor="confirmPassword">Confirmar Nova Senha</label>
              <input
                type="password"
                id="confirmPassword"
                placeholder="Confirme a nova senha"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="submit-btn">
              Redefinir Senha
            </button>
          </>
        )}

        {success && (
            <div className="form-footer">
                <p><Link to="/login">Ir para o Login agora</Link></p>
            </div>
        )}
      </form>
    </div>
  );
};

export default ResetPasswordPage;