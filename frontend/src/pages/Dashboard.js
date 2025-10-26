import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import EditTransactionModal from '../components/EditTransactionModal';
import Header from '../components/Header';
import { toast } from 'react-toastify';
import './Dashboard.css';

const Icon = ({ children }) => <span className="icon-placeholder">{children}</span>;

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

  const fetchData = useCallback(async () => {
    if (user) {
      setIsLoading(true);
      setError('');
      try {
        const transactionsPromise = api.get('/transactions');
        const summaryPromise = api.get('/transactions/summary');

        const [transactionsResponse, summaryResponse] = await Promise.all([
          transactionsPromise,
          summaryPromise,
        ]);

        setTransactions(transactionsResponse.data.transactions);
        setSummary(summaryResponse.data);

      } catch (err) {
        console.error("Erro ao buscar dados do dashboard:", err);
        const errorMessage = "Não foi possível carregar os dados do seu dashboard.";
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    }
  }, [user]);

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

  const handleDelete = async (transactionId) => {
    toast(
      ({ closeToast }) => (
        <div>
          <p>Tem certeza de que deseja apagar esta transação?</p>
          <button onClick={async () => {
              try {
                await api.delete(`/transactions/${transactionId}`);
                fetchData();
                toast.success('Transação apagada com sucesso!');
              } catch (err) {
                console.error("Erro ao apagar transação:", err);
                toast.error('Não foi possível apagar a transação.');
              }
              closeToast();
            }}
            style={{ marginRight: '10px', padding: '5px 10px'}}
          >
            Sim
          </button>
          <button onClick={closeToast} style={{ padding: '5px 10px'}}>Não</button>
        </div>
      ), {
        position: "top-center",
        autoClose: false,
        closeOnClick: false,
        draggable: false,
        closeButton: false,
      }
    );
  };

  const handleUpdateSuccess = () => {
    fetchData();
    toast.success('Transação atualizada com sucesso!');
  }

  if (!user) {
    return <div className="loading-fullpage">Carregando...</div>;
  }

  return (
    <div className="dashboard-wrapper">
      <Header user={user} handleLogout={handleLogout} />

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
          <Link to="/transactions" state={{ defaultTab: 'add' }} className="action-card-link">
            <div className="action-card">
              <Icon>+</Icon>
              <div><h3>Registrar Transação</h3><p>Adicione uma nova entrada ou saída</p></div>
            </div>
          </Link>
          <Link to="/balanceamento" className="action-card-link">
            <div className="action-card">
              <Icon>⏱️</Icon>
              <div><h3>Ver Balanceamento</h3><p>Visualize seu resumo financeiro</p></div>
            </div>
          </Link>
        </div>
        
        <div className="transaction-list">
          <h3>Transações Recentes</h3>
          {isLoading ? (
            <p>Carregando transações...</p>
          ) : error ? (
            <p>Erro ao carregar transações.</p> 
          ) : !transactions || transactions.length === 0 ? (
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
          <Link 
            to="/transactions" 
            state={{ defaultTab: 'view' }} 
            className="view-all-btn-link"
          >
            Ver Todas as Transações
          </Link>
        </div>
      </main>

      <footer className="dashboard-footer">
        <p>Desenvolvido por LGSoftware</p>
      </footer>

      <EditTransactionModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        transaction={editingTransaction}
        onUpdate={handleUpdateSuccess}
      />
    </div>
  );
};

export default Dashboard;