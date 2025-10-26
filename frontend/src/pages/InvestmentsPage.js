import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import Header from '../components/Header';
import { toast } from 'react-toastify';
import './InvestmentsPage.css';

// Função para formatar números como moeda
const formatCurrency = (value) => {
  const numberValue = Number(value) || 0;
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(numberValue);
};

const InvestmentsPage = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);

    // Estados para a busca
    const [ticker, setTicker] = useState('');
    const [quote, setQuote] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    // Busca o usuário do localStorage (para o Header)
    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        } else {
            navigate('/login');
        }
    }, [navigate]);

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    // Função para buscar a cotação na nossa API
    const handleSearch = async (e) => {
        e.preventDefault();
        if (!ticker) return;

        setIsLoading(true);
        setQuote(null);

        try {
            const response = await api.get(`/investments/quote/${ticker}`);
            setQuote(response.data);
        } catch (err) {
            console.error("Erro ao buscar ativo:", err);
            toast.error(err.response?.data?.message || 'Não foi possível encontrar este ativo.');
        } finally {
            setIsLoading(false);
        }
    };

    if (!user) return null;

    return (
        <div className="investments-page-wrapper">
            <Header user={user} handleLogout={handleLogout} />

            <main className="investments-content">
                <div className="content-header">
                    <h1>Mercado de Ações</h1>
                    <p>Busque cotações de ativos da B3 (Bolsa de Valores Brasileira)</p>
                </div>

                {/* Formulário de Busca */}
                <form onSubmit={handleSearch} className="search-card">
                    <label htmlFor="ticker-search">Digite o Ticker do Ativo (ex: PETR4)</label>
                    <div className="search-bar">
                        <input
                            type="text"
                            id="ticker-search"
                            value={ticker}
                            onChange={(e) => setTicker(e.target.value.toUpperCase())}
                            placeholder="Ex: MGLU3, ITUB4, BBAS3..."
                        />
                        <button type="submit" disabled={isLoading}>
                            {isLoading ? 'Buscando...' : 'Buscar'}
                        </button>
                    </div>
                </form>

                {/* Área de Resultado */}
                {quote && (
                    <div className="quote-result-card">
                        <div className="quote-header">
                            <img src={quote.logourl} alt={`${quote.symbol} logo`} className="quote-logo" />
                            <h2>{quote.symbol}</h2>
                            <span className="quote-name">{quote.longName}</span>
                        </div>
                        <div className="quote-body">
                            <div className="quote-price">
                                {formatCurrency(quote.regularMarketPrice)}
                            </div>
                            <div className={`quote-change ${quote.regularMarketChangePercent >= 0 ? 'positive' : 'negative'}`}>
                                {quote.regularMarketChangePercent.toFixed(2)}% 
                                <span> ({formatCurrency(quote.regularMarketChange)})</span>
                            </div>
                        </div>
                        <div className="quote-footer">
                            <span>Mercado: {quote.marketState === 'REGULAR' ? 'Aberto' : 'Fechado'}</span>
                            <span>Volume: {quote.regularMarketVolume.toLocaleString('pt-BR')}</span>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default InvestmentsPage;