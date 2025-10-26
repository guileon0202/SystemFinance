import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api';
import EditTransactionModal from '../components/EditTransactionModal';
import Header from '../components/Header';
import { toast } from 'react-toastify';
import './TransactionsPage.css';

const formatCurrency = (value) => {
    const numberValue = Number(value) || 0;
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(numberValue);
};

const TransactionsPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [user, setUser] = useState(null);
    const [activeTab, setActiveTab] = useState(location.state?.defaultTab || 'view');

    const [transactions, setTransactions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalItems: 0 });
    const [filter, setFilter] = useState('todos');

    // Estados para o formulário de ADIÇÃO
    const [tipo, setTipo] = useState('saida');
    const [descricao, setDescricao] = useState('');
    const [valor, setValor] = useState('');
    const [data, setData] = useState(new Date().toISOString().split('T')[0]);
    const [categoria, setCategoria] = useState('Alimentação');
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

    const fetchTransactions = useCallback(async (page = 1, tipoFiltro = 'todos') => {
        if (!user) return;
        setIsLoading(true);
        try {
            const params = { page, limit: 10 };
            if (tipoFiltro !== 'todos') {
                params.tipo = tipoFiltro;
            }
            const response = await api.get('/transactions', { params });
            setTransactions(response.data.transactions);
            setPagination({
                currentPage: response.data.currentPage,
                totalPages: response.data.totalPages,
                totalItems: response.data.totalItems,
            });
        } catch (err) {
            console.error("Erro ao buscar transações:", err);
            toast.error("Não foi possível carregar a lista de transações.");
        } finally {
            setIsLoading(false);
        }
    }, [user]);

    useEffect(() => {
    
         if (activeTab === 'view' && user) {
             fetchTransactions(pagination.currentPage, filter);
         }
    }, [fetchTransactions, pagination.currentPage, filter, activeTab, user]);


    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (parseFloat(valor) <= 0) {
            toast.error('O valor da transação deve ser maior que zero.');
            return;
        }
        
        const tipoParaBackend = tipo === 'entrada' ? 'receita' : 'despesa';

        try {
            const transactionData = { descricao, valor: parseFloat(valor), tipo: tipoParaBackend, data, categoria };
            await api.post('/transactions', transactionData);
            
            toast.success('Transação registrada com sucesso!');
            setDescricao('');
            setValor('');
            setTipo('saida'); 
            setCategoria('Alimentação'); 
            
            fetchTransactions(1, 'todos'); 
            setActiveTab('view'); 
            
        } catch (err) {
            console.error("Erro ao registrar transação:", err);
            toast.error(err.response?.data?.message || 'Ocorreu um erro ao salvar a transação.');
        }
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
                        fetchTransactions(pagination.currentPage, filter);
                        toast.success('Transação apagada com sucesso!');
                      } catch (err) {
                        console.error("Erro ao apagar transação:", err);
                        toast.error('Não foi possível apagar a transação.');
                      }
                      closeToast(); 
                    }}
                    style={{ marginRight: '10px', padding: '5px 10px'}}
                  >Sim</button>
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

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= pagination.totalPages) {
            setPagination(prev => ({ ...prev, currentPage: newPage }));
        }
    };

    const handleFilterChange = (e) => {
        setFilter(e.target.value);
        setPagination(prev => ({ ...prev, currentPage: 1 }));
    };

    // Função chamada pelo modal de edição após o sucesso
    const handleUpdateSuccess = () => {
        fetchTransactions(pagination.currentPage, filter);
        toast.success('Transação atualizada com sucesso!');
    }
    
    if (!user) return null;

    return (
        <div className="transactions-page-wrapper">
            <Header user={user} handleLogout={handleLogout} />

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
                        <div className="filters-container">
                            <label htmlFor="tipo-filtro">Filtrar por tipo:</label>
                            <select id="tipo-filtro" value={filter} onChange={handleFilterChange}>
                                <option value="todos">Todos</option>
                                <option value="receita">Entradas</option>
                                <option value="despesa">Saídas</option>
                            </select>
                        </div>
                        {isLoading ? (
                            <p>Carregando...</p>
                        ) : (
                            <>
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
                                        {transactions.length === 0 ? (
                                            <tr><td colSpan="5" style={{ textAlign: 'center', color: '#6c757d' }}>Nenhuma transação encontrada para este filtro.</td></tr>
                                        ) : (
                                            transactions.map((t) => (
                                                <tr key={t.id}>
                                                    <td>{t.descricao}</td>
                                                    <td className={t.tipo}>{formatCurrency(t.valor)}</td>
                                                    <td>{t.tipo === 'receita' ? 'Entrada' : 'Saída'}</td>
                                                    <td>{new Date(t.data).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</td>
                                                    <td className="action-buttons-cell">
                                                        <button className="action-btn" onClick={() => handleEdit(t)}>✏️</button>
                                                        <button className="action-btn" onClick={() => handleDelete(t.id)}>🗑️</button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                                <div className="pagination-container">
                                    <span>Página {pagination.currentPage} de {pagination.totalPages || 1}</span>
                                    <div>
                                        <button onClick={() => handlePageChange(pagination.currentPage - 1)} disabled={pagination.currentPage <= 1}>Anterior</button>
                                        <button onClick={() => handlePageChange(pagination.currentPage + 1)} disabled={pagination.currentPage >= pagination.totalPages}>Próxima</button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                )}
            </main>

            <EditTransactionModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                transaction={editingTransaction}
                onUpdate={handleUpdateSuccess} 
            />
        </div>
    );
};

export default TransactionsPage;