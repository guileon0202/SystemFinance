import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import NewFeedbackModal from '../components/NewFeedbackModal';
import Header from '../components/Header';
import { toast } from 'react-toastify';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

import './FeedbackPage.css';

const FeedbackPage = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    const [columns, setColumns] = useState({
        analisando: { id: 'analisando', title: '⏰ Estamos analisando', items: [] },
        desenvolvendo: { id: 'desenvolvendo', title: '⚙️ Estamos desenvolvendo', items: [] },
        entregue: { id: 'entregue', title: '✅ Já entregamos', items: [] },
    });

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        } else {
            navigate('/login');
        }
    }, [navigate]);

    const organizeFeedbacks = (feedbacks) => {
        const analisando = feedbacks.filter(f => f.status === 'analisando');
        const desenvolvendo = feedbacks.filter(f => f.status === 'desenvolvendo');
        const entregue = feedbacks.filter(f => f.status === 'entregue');

        setColumns({
            analisando: { ...columns.analisando, items: analisando },
            desenvolvendo: { ...columns.desenvolvendo, items: desenvolvendo },
            entregue: { ...columns.entregue, items: entregue },
        });
    };

    const fetchFeedbacks = useCallback(async () => {
        if (user) {
            setIsLoading(true);
            try {
                const response = await api.get('/feedbacks');
                organizeFeedbacks(response.data);
            } catch (error) {
                console.error("Erro ao buscar feedbacks:", error);
                toast.error("Não foi possível carregar os feedbacks.");
            } finally {
                setIsLoading(false);
            }
        }
    }, [user]);

    useEffect(() => {
        fetchFeedbacks();
    }, [fetchFeedbacks]);

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };
    
    // Função chamada ao arrastar e soltar um card
    const onDragEnd = async (result) => {
        if (!result.destination) return;

        const { source, destination, draggableId } = result;
        const feedbackId = draggableId;
        const newStatus = destination.droppableId;

        if (source.droppableId === newStatus) {
            return;
        }

        // --- Atualização Otimista da Interface ---
        // Pega o estado atual
        const sourceColumn = columns[source.droppableId];
        const destColumn = columns[destination.droppableId];
        const sourceItems = [...sourceColumn.items];
        const destItems = [...destColumn.items];
        const [removedItem] = sourceItems.splice(source.index, 1);
        destItems.splice(destination.index, 0, removedItem);

        // Atualiza o estado visualmente
        setColumns({
            ...columns,
            [source.droppableId]: { ...sourceColumn, items: sourceItems },
            [destination.droppableId]: { ...destColumn, items: destItems },
        });
        
        // --- Chamada da API para salvar ---
        try {
            await api.put(`/feedbacks/${feedbackId}/status`, { status: newStatus });
            toast.success('Status do feedback atualizado!');
            fetchFeedbacks(); 
        } catch (error) {
            console.error('Erro ao atualizar status:', error);
            toast.error('Não foi possível atualizar o status. Você é um admin?');
            setColumns({
                ...columns,
                [source.droppableId]: sourceColumn,
                [destination.droppableId]: destColumn,
            });
        }
    };


    if (!user) return null;

    return (
        <div className="feedback-page-wrapper">
            <Header user={user} handleLogout={handleLogout} />

            <main className="feedback-content">
                <div className="content-header">
                    <h1>Feedback da Comunidade</h1>
                    <p>Compartilhe suas ideias e acompanhe o desenvolvimento</p>
                    <button className="new-suggestion-btn" onClick={() => setIsModalOpen(true)}>+ Nova Sugestão</button>
                </div>

                {isLoading ? (
                    <p>Carregando sugestões...</p>
                ) : (
                    <DragDropContext onDragEnd={onDragEnd}>
                        <div className="kanban-board">
                            {Object.entries(columns).map(([columnId, column]) => (
                                <Droppable droppableId={columnId} key={columnId}>
                                    {(provided, snapshot) => (
                                        <div
                                            className="kanban-column"
                                            ref={provided.innerRef}
                                            {...provided.droppableProps}
                                        >
                                            <h2 className="column-title">
                                                <span>{column.title}</span>
                                                <span className="badge">{column.items.length}</span>
                                            </h2>
                                            {column.items.map((item, index) => (
                                                <Draggable key={item.id} draggableId={String(item.id)} index={index}>
                                                    {(provided, snapshot) => (
                                                        <div
                                                            className={`feedback-card status-${item.status}`}
                                                            ref={provided.innerRef}
                                                            {...provided.draggableProps}
                                                            {...provided.dragHandleProps}
                                                            style={{
                                                                ...provided.draggableProps.style,
                                                                opacity: snapshot.isDragging ? '0.7' : '1',
                                                            }}
                                                        >
                                                            <h3>{item.titulo}</h3>
                                                            <p>{item.descricao}</p>
                                                            <footer>
                                                                <span>Por: {item.autor}</span>
                                                                <span>{new Date(item.data_sugestao).toLocaleDateString()}</span>
                                                            </footer>
                                                        </div>
                                                    )}
                                                </Draggable>
                                            ))}
                                            {provided.placeholder}
                                        </div>
                                    )}
                                </Droppable>
                            ))}
                        </div>
                    </DragDropContext>
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