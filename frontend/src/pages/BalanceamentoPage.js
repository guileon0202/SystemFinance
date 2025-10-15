// arquivo: frontend/src/pages/BalanceamentoPage.js (VERSÃO FINAL COM OS DOIS GRÁFICOS)

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import './BalanceamentoPage.css';

// 1. IMPORTE o componente 'Pie' para o novo gráfico
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut, Pie } from 'react-chartjs-2';

// Registre os componentes do Chart.js
ChartJS.register(ArcElement, Tooltip, Legend);

const formatCurrency = (value) => {
    const numberValue = Number(value) || 0;
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(numberValue);
};

const BalanceamentoPage = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [activePeriod, setActivePeriod] = useState('monthly');
    const [summary, setSummary] = useState(null);
    // 2. CRIE UM ESTADO PARA OS DADOS DE GASTOS POR CATEGORIA
    const [spendingByCategory, setSpendingByCategory] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // Lógica para verificar se o usuário está logado
    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        } else {
            navigate('/login');
        }
    }, [navigate]);

    // 3. ATUALIZE A FUNÇÃO DE BUSCA PARA PEGAR OS 3 CONJUNTOS DE DADOS
    const fetchAllData = useCallback(async (period) => {
        if (!user) return;

        setIsLoading(true);
        let startDate, endDate = new Date().toISOString().split('T')[0];

        if (period === 'monthly') {
            const today = new Date();
            startDate = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
        } else if (period === 'weekly') {
            const today = new Date();
            const firstDayOfWeek = today.getDate() - today.getDay();
            startDate = new Date(new Date().setDate(firstDayOfWeek)).toISOString().split('T')[0];
        } else if (period === 'yearly') {
            const today = new Date();
            startDate = new Date(today.getFullYear(), 0, 1).toISOString().split('T')[0];
        }

        try {
            // Agora fazemos 2 requisições em paralelo
            const summaryPromise = api.get(`/transactions/summary_by_period`, { params: { startDate, endDate } });
            const spendingPromise = api.get(`/transactions/spending_by_category`, { params: { startDate, endDate } });

            const [summaryResponse, spendingResponse] = await Promise.all([
                summaryPromise,
                spendingPromise
            ]);
            
            setSummary(summaryResponse.data);
            setSpendingByCategory(spendingResponse.data); // Salva os dados do novo gráfico

        } catch (error) {
            console.error("Erro ao buscar dados do balanceamento:", error);
        } finally {
            setIsLoading(false);
        }
    }, [user]);

    // Busca os dados sempre que o período ativo mudar
    useEffect(() => {
        fetchAllData(activePeriod);
    }, [activePeriod, fetchAllData]);

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    if (!user) return null;

    // --- DADOS PARA OS GRÁFICOS ---
    // Gráfico 1: Entradas vs Saídas (Doughnut)
    const doughnutChartData = {
        labels: ['Receitas', 'Despesas'],
        datasets: [{
            label: 'R$',
            data: [summary?.total_receitas || 0, summary?.total_despesas || 0],
            backgroundColor: ['rgba(40, 167, 69, 0.8)', 'rgba(220, 53, 69, 0.8)'],
            borderColor: ['rgba(40, 167, 69, 1)', 'rgba(220, 53, 69, 1)'],
            borderWidth: 1,
        }],
    };

    // Gráfico 2: Gastos por Categoria (Pie)
    const pieChartData = {
        labels: spendingByCategory.map(item => item.categoria),
        datasets: [{
            label: 'Total Gasto',
            data: spendingByCategory.map(item => item.total_gasto),
            backgroundColor: [
                'rgba(255, 99, 132, 0.8)',
                'rgba(54, 162, 235, 0.8)',
                'rgba(255, 206, 86, 0.8)',
                'rgba(75, 192, 192, 0.8)',
                'rgba(153, 102, 255, 0.8)',
                'rgba(255, 159, 64, 0.8)'
            ],
            borderWidth: 1,
        }],
    };

    return (
        <div className="balance-page-wrapper">
            <header className="main-header">
                <div className="logo"><strong>Web</strong> Finanças</div>
                <nav className="main-nav">
                    <a href="/dashboard" className="nav-link">Dashboard</a>
                    <a href="/transactions" className="nav-link">Transações</a>
                    <a href="/balanceamento" className="nav-link active">Balanceamento</a>
                    <a href="/feedback" className="nav-link">Feedback</a>
                </nav>
                <div className="user-menu">
                    <span>Olá, {user.nome}!</span>
                    <button onClick={handleLogout} className="logout-btn">Sair</button>
                </div>
            </header>

            <main className="balance-content">
                <div className="content-header">
                    <h1>Resumo Financeiro</h1>
                    <p>Visualize seu balanço e análise de gastos</p>
                </div>

                <div className="period-filter">
                    <button onClick={() => setActivePeriod('weekly')} className={activePeriod === 'weekly' ? 'active' : ''}>Última Semana</button>
                    <button onClick={() => setActivePeriod('monthly')} className={activePeriod === 'monthly' ? 'active' : ''}>Último Mês</button>
                    <button onClick={() => setActivePeriod('yearly')} className={activePeriod === 'yearly' ? 'active' : ''}>Último Ano</button>
                    <button>Todos os Períodos</button>
                    <button>Período Personalizado</button>
                </div>

                <div className="balance-summary-grid">
                    <div className="info-card">
                        <span>Total de Entradas</span>
                        <p className="income">{isLoading ? '...' : formatCurrency(summary?.total_receitas)}</p>
                        <small>Receitas do período</small>
                    </div>
                    <div className="info-card">
                        <span>Total de Saídas</span>
                        <p className="expenses">{isLoading ? '...' : formatCurrency(summary?.total_despesas)}</p>
                        <small>Gastos do período</small>
                    </div>
                    <div className="info-card">
                        <span>Saldo Final</span>
                        <p className={summary?.saldo >= 0 ? 'income' : 'expenses'}>{isLoading ? '...' : formatCurrency(summary?.saldo)}</p>
                        <small>{summary?.saldo >= 0 ? 'Saldo positivo' : 'Saldo negativo'}</small>
                    </div>
                    <div className="info-card">
                        <span>Taxa de Poupança</span>
                        <p>{isLoading ? '...' : '0.0%'}</p>
                        <small>Em breve</small>
                    </div>
                </div>

                <div className="chart-container">
                    <h3>Entradas vs Saídas</h3>
                    {isLoading ? ( <div className="chart-placeholder">Carregando...</div> )
                    : (summary?.total_receitas === 0 && summary?.total_despesas === 0) ? (
                        <div className="chart-placeholder">Nenhuma transação no período</div>
                    ) : (
                        <div className="chart-wrapper">
                            <Doughnut data={doughnutChartData} />
                        </div>
                    )}
                </div>
                
                <div className="chart-container">
                    <h3>Maiores Gastos por Categoria</h3>
                    {isLoading ? ( <div className="chart-placeholder">Carregando...</div> )
                    : (spendingByCategory.length === 0) ? (
                        <div className="chart-placeholder">Nenhum gasto registrado no período.</div>
                    ) : (
                        <div className="chart-wrapper">
                            <Pie data={pieChartData} />
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default BalanceamentoPage;