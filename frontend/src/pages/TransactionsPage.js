// arquivo: frontend/src/pages/TransactionsPage.js (VERSÃO FINAL COMPLETA)

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// 1. CORREÇÃO: O CSS deve vir do arquivo da própria página
import './TransactionsPage.css';

const TransactionsPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [tipo, setTipo] = useState('saida');
  const [descricao, setDescricao] = useState('');
  const [valor, setValor] = useState('');
  const [data, setData] = useState(new Date().toISOString().split('T')[0]);
  const [categoria, setCategoria] = useState('Alimentação');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      navigate('/login');
    }
  }, [navigate]);

  // 2. CORREÇÃO: Conectamos esta função ao botão "Sair"
  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (parseFloat(valor) <= 0) {
      setError('O valor da transação deve ser maior que zero.');
      return;
    }
    
    const tipoParaBackend = tipo === 'entrada' ? 'receita' : 'despesa';

    try {
      const transactionData = {
        descricao,
        valor: parseFloat(valor),
        tipo: tipoParaBackend,
        // Incluindo os campos que faltavam no envio para a API
        data,
        categoria,
        userId: user.id
      };
      
      const token = localStorage.getItem('token');
      
      await axios.post('http://localhost:3000/api/transactions', transactionData, {
        headers: {
          'Authorization': `Bearer ${token}` // Enviaremos o token para autenticação no futuro
        }
      });

      setSuccess('Transação registrada com sucesso!');
      setDescricao('');
      setValor('');
      
    } catch (err) {
      console.error("Erro ao registrar transação:", err);
      setError(err.response?.data?.message || 'Ocorreu um erro ao salvar a transação.');
    }
  };

  if (!user) return null;

  return (
    <div className="transactions-page-wrapper">
      <header className="main-header">
        <div className="logo"><strong>Web</strong> Finanças</div>
        <nav className="main-nav">
          <a href="/dashboard" className="nav-link">Dashboard</a>
          <a href="/transactions" className="nav-link active">Transações</a>
          <a href="/balance" className="nav-link">Balanceamento</a>
          <a href="/feedback" className="nav-link">Feedback</a>
        </nav>
        <div className="user-menu">
          <span>Olá, {user.nome}!</span>
          {/* BOTÃO "SAIR" AGORA CHAMA A FUNÇÃO handleLogout */}
          <button onClick={handleLogout} className="logout-btn">Sair</button>
        </div>
      </header>

      <main className="transactions-content">
        <div className="content-header">
          <h1>Gerenciar Transações</h1>
          <p>Registre suas entradas e saídas financeiras</p>
        </div>

        <div className="tabs-container">
          <button className="tab-button active">Adicionar Transação</button>
          <button className="tab-button">Ver Transações</button>
        </div>

        <form className="form-container" onSubmit={handleSubmit}>
          <h2 className="form-title">+ Nova Transação</h2>
          <p className="form-subtitle">Preencha os dados da sua movimentação financeira</p>
          
          <div className="type-toggle">
            {/* 3. CORREÇÃO: BOTÕES AGORA CHAMAM setTipo */}
            <button type="button" className={`toggle-btn ${tipo === 'entrada' ? 'active' : ''}`} onClick={() => setTipo('entrada')}>
              <span className="icon">⊙</span> Entrada
            </button>
            <button type="button" className={`toggle-btn ${tipo === 'saida' ? 'active' : ''}`} onClick={() => setTipo('saida')}>
              <span className="icon">⊙</span> Saída
            </button>
          </div>

          {error && <div className="form-message error">{error}</div>}
          {success && <div className="form-message success">{success}</div>}

          <div className="form-grid">
            <div className="form-group full-width">
              <label htmlFor="descricao">Descrição</label>
              <input type="text" id="descricao" value={descricao} onChange={e => setDescricao(e.target.value)} placeholder="Ex: Salário, Supermercado, Conta de luz..." required />
            </div>
            <div className="form-group">
              <label htmlFor="valor">Valor (R$)</label>
              <input type="number" id="valor" value={valor} onChange={e => setValor(e.target.value)} placeholder="0,00" step="0.01" required />
            </div>
            <div className="form-group">
              <label htmlFor="data">Data</label>
              {/* 4. CORREÇÃO: CAMPO DE DATA AGORA CHAMA setData */}
              <input type="date" id="data" value={data} onChange={e => setData(e.target.value)} required />
            </div>
            <div className="form-group">
              <label htmlFor="categoria">Categoria</label>
              {/* 5. CORREÇÃO: CAMPO DE CATEGORIA AGORA CHAMA setCategoria */}
              <select id="categoria" value={categoria} onChange={e => setCategoria(e.target.value)} required>
                <option>Alimentação</option>
                <option>Moradia</option>
                <option>Transporte</option>
                <option>Lazer</option>
                <option>Salário</option>
                <option>Outros</option>
              </select>
              <small>💡 Escolha a categoria correta para análises mais precisas</small>
            </div>
          </div>
          
          <button type="submit" className="save-btn">Salvar Transação</button>
        </form>
      </main>
    </div>
  );
};

export default TransactionsPage;