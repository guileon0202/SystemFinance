import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import EditTransactionModal from '../components/EditTransactionModal';
import './TransactionsPage.css';

const formatCurrency = (value) => {
    const numberValue = Number(value) || 0;
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(numberValue);
};

const TransactionsPage = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [activeTab, setActiveTab] = useState('add');

    const [transactions, setTransactions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [tipo, setTipo] = useState('saida');
    const [descricao, setDescricao] = useState('');
    const [valor, setValor] = useState('');
    const [data, setData] = useState(new Date().toISOString().split('T')[0]);
    const [categoria, setCategoria] = useState('Alimentação');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingTransaction, setEditingTransaction] = useState(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        } else {
            navigate('/login');
        }
    }, [navigate]);

    const fetchTransactions = useCallback(async () => {
        if (!user) return;
        setIsLoading(true);
        try {
            const response = await api.get('/transactions');
            setTransactions(response.data);
        } catch (err) {
            console.error("Erro ao buscar transações:", err);
        } finally {
            setIsLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchTransactions();
    }, [fetchTransactions]);

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
            const transactionData = { descricao, valor: parseFloat(valor), tipo: tipoParaBackend, data, categoria };
            await api.post('/transactions', transactionData);
            
            setSuccess('Transação registrada com sucesso!');
            setDescricao('');
            setValor('');

            fetchTransactions();
            setActiveTab('view');
            
        } catch (err) {
            console.error("Erro ao registrar transação:", err);
            setError(err.response?.data?.message || 'Ocorreu um erro ao salvar a transação.');
        }
    };
    
    const handleEdit = (transactionToEdit) => {
        setEditingTransaction(transactionToEdit);
        setIsEditModalOpen(true);
    };

    const handleDelete = async (transactionId) => {
        const isConfirmed = window.confirm('Tem certeza de que deseja apagar esta transação?');
        if (isConfirmed) {
            try {
                await api.delete(`/transactions/${transactionId}`);
                fetchTransactions();
            } catch (err) {
                alert('Não foi possível apagar a transação.');
            }
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
                    <a href="/balanceamento" className="nav-link">Balanceamento</a>
                    <a href="/feedback" className="nav-link">Feedback</a>
                </nav>
                <div className="user-menu">
                    <span>Olá, {user.nome}!</span>
                    <button onClick={handleLogout} className="logout-btn">Sair</button>
                </div>
            </header>

            <main className="transactions-content">
                <div className="content-header">
                    <h1>Gerenciar Transações</h1>
                    <p>Registre e visualize suas movimentações financeiras</p>
                </div>

                <div className="tabs-container">
                    <button onClick={() => setActiveTab('add')} className={`tab-button ${activeTab === 'add' ? 'active' : ''}`}>Adicionar Transação</button>
                    <button onClick={() => setActiveTab('view')} className={`tab-button ${activeTab === 'view' ? 'active' : ''}`}>Ver Transações</button>
                </div>

                {activeTab === 'add' && (
                    <form className="form-container" onSubmit={handleSubmit}>
                        <h2 className="form-title">+ Nova Transação</h2>
                        <p className="form-subtitle">Preencha os dados da sua movimentação</p>
                        
                        <div className="type-toggle">
                            <button type="button" className={`toggle-btn ${tipo === 'entrada' ? 'active' : ''}`} onClick={() => setTipo('entrada')}>Entrada</button>
                            <button type="button" className={`toggle-btn ${tipo === 'saida' ? 'active' : ''}`} onClick={() => setTipo('saida')}>Saída</button>
                        </div>

                        {error && <div className="form-message error">{error}</div>}
                        {success && <div className="form-message success">{success}</div>}

                        <div className="form-grid">
                            <div className="form-group full-width">
                                <label htmlFor="descricao">Descrição</label>
                                <input type="text" id="descricao" value={descricao} onChange={e => setDescricao(e.target.value)} placeholder="Ex: Salário, Supermercado..." required />
                            </div>
                            <div className="form-group">
                                <label htmlFor="valor">Valor (R$)</label>
                                <input type="number" id="valor" value={valor} onChange={e => setValor(e.target.value)} placeholder="0,00" step="0.01" required />
                            </div>
                             <div className="form-group">
                                <label htmlFor="data">Data</label>
                                <input type="date" id="data" value={data} onChange={e => setData(e.target.value)} required />
                            </div>
                            <div className="form-group">
                                <label htmlFor="categoria">Categoria</label>
                                <select id="categoria" value={categoria} onChange={e => setCategoria(e.target.value)} required>
                                    <option>Alimentação</option>
                                    <option>Moradia</option>
                                    <option>Transporte</option>
                                    <option>Lazer</option>
                                    <option>Salário</option>
                                    <option>Outros</option>
                                </select>
                                <small>💡 Escolha a categoria para análises precisas.</small>
                            </div>
                        </div>
                        <button type="submit" className="save-btn">Salvar Transação</button>
                    </form>
                )}

                {activeTab === 'view' && (
                    <div className="list-container">
                        <h3>Suas Movimentações</h3>
                        {isLoading ? (
                            <p>Carregando...</p>
                        ) : (
                            <table className="transactions-table">
                                <thead>
                                    <tr>
                                        <th>Descrição</th>
                                        <th>Valor</th>
                                        <th>Tipo</th>
                                        <th>Data</th>
                                        <th>Ações</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {transactions.map((t) => (
                                        <tr key={t.id}>
                                            <td>{t.descricao}</td>
                                            <td className={t.tipo}>{formatCurrency(t.valor)}</td>
                                            <td>{t.tipo === 'receita' ? 'Entrada' : 'Saída'}</td>
                                            <td>{new Date(t.data).toLocaleDateString()}</td>
                                            <td className="action-buttons-cell">
                                                <button className="action-btn" onClick={() => handleEdit(t)}>✏️</button>
                                                <button className="action-btn" onClick={() => handleDelete(t.id)}>🗑️</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                )}
            </main>

            <EditTransactionModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                transaction={editingTransaction}
                onUpdate={fetchTransactions}
            />
        </div>
    );
};

export default TransactionsPage;