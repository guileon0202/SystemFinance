// arquivo: frontend/src/components/NewFeedbackModal.js

import React, { useState } from 'react';
import api from '../services/api';
// Vamos reutilizar o CSS do modal de transação para manter o estilo
import './TransactionModal.css'; 

const NewFeedbackModal = ({ isOpen, onClose, onUpdate }) => {
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) {
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      // Chama o endpoint POST que criamos no backend
      await api.post('/feedbacks', { titulo, descricao });

      onUpdate(); // Chama a função para atualizar os dados na página de Feedback
      onClose();  // Fecha o modal
      // Limpa os campos para a próxima vez que o modal for aberto
      setTitulo('');
      setDescricao('');

    } catch (err) {
      console.error("Erro ao criar feedback:", err);
      setError(err.response?.data?.message || 'Não foi possível enviar a sugestão.');
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Nova Sugestão</h2>
        <p>Compartilhe sua ideia para melhorar o Web Finanças.</p>
        <form onSubmit={handleSubmit}>
          {error && <p className="error-message" style={{textAlign: 'center', marginBottom: '1rem'}}>{error}</p>}
          <div className="form-group">
            <label htmlFor="titulo">Título da Sugestão</label>
            <input
              type="text"
              id="titulo"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ex: Gráficos no Dashboard"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="descricao">Descreva sua ideia</label>
            <textarea
              id="descricao"
              rows="4"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Detalhe aqui como a sua sugestão funcionaria e como ela ajudaria os usuários."
              required
            />
          </div>
          <div className="modal-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn-save">Enviar Sugestão</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewFeedbackModal;