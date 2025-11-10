import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import Header from '../components/Header';
import './BalanceamentoPage.css';

import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut, Pie } from 'react-chartjs-2';

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
    const [summary, setSummary] = useState({
        saldo: 0,
        total_receitas: 0,
        total_despesas: 0,
        taxa_de_poupanca: 0,
    });
    const [spendingByCategory, setSpendingByCategory] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        } else {
            navigate('/login');
        }
    }, [navigate]);

    const fetchAllData = useCallback(async (period) => {
        if (!user) return;

        setIsLoading(true);
        try {
            let summaryPromise;
            let spendingPromise;

            if (period === 'all') {
                // --- Caso 1: Botão "Todos os Períodos" ---
                // Usa os endpoints "All Time" (sem filtro de data)
                summaryPromise = api.get(`/transactions/summary`);
                spendingPromise = api.get(`/transactions/spending_by_category_alltime`);

            } else {
                // --- Caso 2: Filtros de Data (Semana, Mês, Ano) ---
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

                summaryPromise = api.get(`/transactions/summary_by_period`, { params: { startDate, endDate } });
                spendingPromise = api.get(`/transactions/spending_by_category`, { params: { startDate, endDate } });
            }

            const [summaryResponse, spendingResponse] = await Promise.all([
                summaryPromise,
                spendingPromise
            ]);
            
            setSummary(summaryResponse.data);
            setSpendingByCategory(spendingResponse.data);

        } catch (error) {
            console.error("Erro ao buscar dados do balanceamento:", error);
        } finally {
            setIsLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchAllData(activePeriod);
    }, [activePeriod, fetchAllData]);

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    if (!user) return null;

    const doughnutChartData = {
        labels: ['Receitas', 'Despesas'],
        datasets: [{
            data: [summary?.total_receitas || 0, summary?.total_despesas || 0],
            backgroundColor: ['rgba(40, 167, 69, 0.8)', 'rgba(220, 53, 69, 0.8)'],
            borderColor: ['rgba(40, 167, 69, 1)', 'rgba(220, 53, 69, 1)'],
            borderWidth: 1,
        }],
    };

    const pieChartData = {
        labels: spendingByCategory.map(item => item.categoria),
        datasets: [{
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
            <Header user={user} handleLogout={handleLogout} />

            <main className="balance-content">
                <div className="content-header">
                    <h1>Resumo Financeiro</h1>
                    <p>Visualize seu balanço e análise de gastos</p>
                </div>

                <div className="period-filter">
                    <button onClick={() => setActivePeriod('weekly')} className={activePeriod === 'weekly' ? 'active' : ''}>Última Semana</button>
                    <button onClick={() => setActivePeriod('monthly')} className={activePeriod === 'monthly' ? 'active' : ''}>Último Mês</button>
                    <button onClick={() => setActivePeriod('yearly')} className={activePeriod === 'yearly' ? 'active' : ''}>Último Ano</button>
                    <button onClick={() => setActivePeriod('all')} className={activePeriod === 'all' ? 'active' : ''}>Todos os Períodos</button>
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
                        <p className={summary?.saldo >= 0 ? 'income' : 'expenses'}>
                            {isLoading ? '...' : `${(summary?.taxa_de_poupanca || 0).toFixed(1)}%`}
                        </p>
                        <small>Do total de receitas</small>
                    </div>
                </div>

                <div className="chart-container">
                    <h3>Entradas vs Saídas</h3>
                    {isLoading ? ( <div className="chart-placeholder">Carregando...</div> )
                    : (summary?.total_receitas === 0 && summary?.total_despesas === 0) ? (
                        <div className="chart-placeholder">Nenhuma transação no período</div>
                    ) : (
                        <div className="chart-wrapper">
                            <Doughnut data={doughnutChartData} options={{ maintainAspectRatio: false }}/>
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
                            <Pie data={pieChartData} options={{ maintainAspectRatio: false }}/>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default BalanceamentoPage;