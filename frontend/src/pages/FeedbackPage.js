import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import NewFeedbackModal from '../components/NewFeedbackModal';
import './FeedbackPage.css';

const FeedbackPage = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [feedbacks, setFeedbacks] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Lógica para verificar se o usuário está logado
    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        } else {
            navigate('/login');
        }
    }, [navigate]);

    // Função reutilizável para buscar os feedbacks
    const fetchFeedbacks = useCallback(async () => {
        if (user) {
            setIsLoading(true);
            try {
                const response = await api.get('/feedbacks');
                setFeedbacks(response.data);
            } catch (error) {
                console.error("Erro ao buscar feedbacks:", error);
            } finally {
                setIsLoading(false);
            }
        }
    }, [user]);

    // useEffect que chama a função para buscar os dados
    useEffect(() => {
        fetchFeedbacks();
    }, [fetchFeedbacks]);

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    const analisando = feedbacks.filter(f => f.status === 'analisando');
    const desenvolvendo = feedbacks.filter(f => f.status === 'desenvolvendo');
    const entregue = feedbacks.filter(f => f.status === 'entregue');

    if (!user) return null;

    return (
        <div className="feedback-page-wrapper">
            <header className="main-header">
                <div className="logo"><strong>Web</strong> Finanças</div>
                <nav className="main-nav">
                    <a href="/dashboard" className="nav-link">Dashboard</a>
                    <a href="/transactions" className="nav-link">Transações</a>
                    <a href="/balanceamento" className="nav-link">Balanceamento</a>
                    <a href="/feedback" className="nav-link active">Feedback</a>
                </nav>
                <div className="user-menu">
                    <span>Olá, {user.nome}!</span>
                    <button onClick={handleLogout} className="logout-btn">Sair</button>
                </div>
            </header>

            <main className="feedback-content">
                <div className="content-header">
                    <h1>Feedback da Comunidade</h1>
                    <p>Compartilhe suas ideias e acompanhe o desenvolvimento</p>
                    <button className="new-suggestion-btn" onClick={() => setIsModalOpen(true)}>+ Nova Sugestão</button>
                </div>

                {isLoading ? (
                    <p>Carregando sugestões...</p>
                ) : (
                    <div className="kanban-board">
                        {/* Coluna 1: Analisando */}
                        <div className="kanban-column">
                            <h2 className="column-title"><span>⏰</span> Estamos analisando <span className="badge">{analisando.length}</span></h2>
                            {analisando.map(item => (
                                <div key={item.id} className="feedback-card status-analisando">
                                    <h3>{item.titulo}</h3>
                                    <p>{item.descricao}</p>
                                    <footer>
                                        <span>Por: {item.autor}</span>
                                        <span>{new Date(item.data_sugestao).toLocaleDateString()}</span>
                                    </footer>
                                </div>
                            ))}
                        </div>

                        {/* Coluna 2: Desenvolvendo */}
                        <div className="kanban-column">
                            <h2 className="column-title"><span>⚙️</span> Estamos desenvolvendo <span className="badge">{desenvolvendo.length}</span></h2>
                            {desenvolvendo.map(item => (
                                <div key={item.id} className="feedback-card status-desenvolvendo">
                                    <h3>{item.titulo}</h3>
                                    <p>{item.descricao}</p>
                                    <footer>
                                        <span>Por: {item.autor}</span>
                                        <span>{new Date(item.data_sugestao).toLocaleDateString()}</span>
                                    </footer>
                                </div>
                            ))}
                        </div>

                        {/* Coluna 3: Entregue */}
                        <div className="kanban-column">
                            <h2 className="column-title"><span>✅</span> Já entregamos <span className="badge">{entregue.length}</span></h2>
                            {entregue.map(item => (
                                <div key={item.id} className="feedback-card status-entregue">
                                    <h3>{item.titulo}</h3>
                                    <p>{item.descricao}</p>
                                    <footer>
                                        <span>Por: {item.autor}</span>
                                        <span>{new Date(item.data_sugestao).toLocaleDateString()}</span>
                                    </footer>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </main>

            <NewFeedbackModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onUpdate={fetchFeedbacks}
            />
        </div>
    );
};

export default FeedbackPage;