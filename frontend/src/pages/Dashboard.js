// arquivo: frontend/src/pages/Dashboard.js (VERSÃO FINAL E SEGURA)

import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api'; // 1. USA A NOSSA INSTÂNCIA SEGURA DO AXIOS
import EditTransactionModal from '../components/EditTransactionModal';
import './Dashboard.css';

// Componente de ícone simples para reutilização
const Icon = ({ children }) => <span className="icon-placeholder">{children}</span>;

// Função para formatar números como moeda brasileira (R$)
const formatCurrency = (value) => {
  const numberValue = Number(value) || 0;
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(numberValue);
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState({
    saldo: 0,
    total_receitas: 0,
    total_despesas: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);

  // Busca o usuário do localStorage
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      } else {
        navigate('/login');
      }
    } catch (e) {
      console.error("Erro ao processar dados do usuário:", e);
      setError("Houve um problema ao carregar seus dados.");
      localStorage.clear();
    }
  }, [navigate]);

  // Função reutilizável para buscar todos os dados do dashboard
  const fetchData = useCallback(async () => {
    // A função só roda se o usuário já foi carregado do localStorage
    if (user) {
      setIsLoading(true);
      try {
        // 2. CHAMADAS À API ATUALIZADAS: NÃO PRECISAMOS MAIS PASSAR O userId
        const transactionsPromise = api.get('/transactions');
        const summaryPromise = api.get('/transactions/summary');

        // Executa as duas requisições em paralelo
        const [transactionsResponse, summaryResponse] = await Promise.all([
          transactionsPromise,
          summaryPromise,
        ]);

        setTransactions(transactionsResponse.data);
        setSummary(summaryResponse.data);
      } catch (err) {
        console.error("Erro ao buscar dados do dashboard:", err);
        setError("Não foi possível carregar os dados do seu dashboard.");
      } finally {
        setIsLoading(false);
      }
    }
  }, [user]);

  // useEffect que chama a função fetchData
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const handleEdit = (transactionToEdit) => {
    setEditingTransaction(transactionToEdit);
    setIsEditModalOpen(true);
  };

  // Função para apagar uma transação
  const handleDelete = async (transactionId) => {
    const isConfirmed = window.confirm('Tem certeza de que deseja apagar esta transação?');
    if (isConfirmed) {
      try {
        // 3. CHAMADA DELETE ATUALIZADA: NÃO PRECISA MAIS DO 'data' COM userId
        await api.delete(`/transactions/${transactionId}`);
        fetchData(); // Busca os dados novamente para atualizar a tela
      } catch (err) {
        console.error("Erro ao apagar transação:", err);
        alert('Não foi possível apagar a transação.');
      }
    }
  };

  if (!user) {
    return <div className="loading-fullpage">Carregando...</div>;
  }

  return (
    <div className="dashboard-wrapper">
      <header className="main-header">
        <div className="logo"><strong>Web</strong> Finanças</div>
        <nav className="main-nav">
          <a href="/dashboard" className="nav-link active">Dashboard</a>
          <a href="/transactions" className="nav-link">Transações</a>
          <a href="/balanceamento" className="nav-link">Balanceamento</a>
          <a href="/feedback" className="nav-link">Feedback</a>
        </nav>
        <div className="user-menu">
          <span>Olá, {user.nome}!</span>
          <button onClick={handleLogout} className="logout-btn">Sair</button>
        </div>
      </header>

      <main className="dashboard-content">
        <div className="content-header">
          <h1>Dashboard Financeiro</h1>
          <p>Gerencie suas finanças de forma inteligente</p>
        </div>

        <div className="summary-grid">
          <div className="info-card">
            <div className="card-header"><span>Saldo do Mês</span><Icon>$</Icon></div>
            <p className={`card-value ${summary.saldo >= 0 ? 'income' : 'expenses'}`}>{formatCurrency(summary.saldo)}</p>
            <span className="card-footer">{summary.saldo >= 0 ? 'Saldo positivo' : 'Saldo negativo'}</span>
          </div>
          <div className="info-card">
            <div className="card-header"><span>Gastos do Mês</span><Icon>💳</Icon></div>
            <p className="card-value expenses">{formatCurrency(summary.total_despesas)}</p>
            <span className="card-footer">Total de saídas</span>
          </div>
          <div className="info-card">
            <div className="card-header"><span>Receitas do Mês</span><Icon>📈</Icon></div>
            <p className="card-value income">{formatCurrency(summary.total_receitas)}</p>
            <span className="card-footer">Total de entradas</span>
          </div>
        </div>

        <div className="action-cards">
          <Link to="/transactions" className="action-card-link">
            <div className="action-card">
              <Icon>+</Icon>
              <div><h3>Registrar Transação</h3><p>Adicione uma nova entrada ou saída</p></div>
            </div>
          </Link>
          <div className="action-card">
            <Icon>⏱️</Icon>
            <div><h3>Ver Balanceamento</h3><p>Visualize seu resumo financeiro</p></div>
          </div>
        </div>
        
        <div className="transaction-list">
          <h3>Transações Recentes</h3>
          {isLoading ? (
            <p>Carregando transações...</p>
          ) : error ? (
            <p className="error-message">{error}</p>
          ) : transactions.length === 0 ? (
            <div className="no-transactions">
              <p>Nenhuma transação registrada ainda.</p>
              <span>Comece adicionando sua primeira transação!</span>
            </div>
          ) : (
            <ul className="transactions-ul">
              {transactions.slice(0, 5).map(t => (
                <li key={t.id} className="transaction-item">
                  <div className="transaction-info">
                    <span className="transaction-desc">{t.descricao}</span>
                  </div>
                  <div className="transaction-details">
                    <span className={`transaction-value ${t.tipo}`}>{t.tipo === 'despesa' ? '-' : '+'} {formatCurrency(t.valor)}</span>
                    <div className="transaction-actions">
                      <button className="action-btn edit-btn" onClick={() => handleEdit(t)}>✏️</button>
                      <button className="action-btn delete-btn" onClick={() => handleDelete(t.id)}>🗑️</button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
          <button className="view-all-btn">Ver Todas as Transações</button>
        </div>
      </main>

      <footer className="dashboard-footer">
        <p>Desenvolvido por LGSoftware</p>
      </footer>

      <EditTransactionModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        transaction={editingTransaction}
        onUpdate={fetchData}
      />
    </div>
  );
};

export default Dashboard;