import React, { useState, useEffect } from 'react';
import api from '../services/api';
import './TransactionModal.css';

const EditTransactionModal = ({ isOpen, onClose, transaction, onUpdate }) => {
  // Estados para os campos do formulário
  const [descricao, setDescricao] = useState('');
  const [valor, setValor] = useState('');
  const [tipo, setTipo] = useState('despesa');
  const [error, setError] = useState('');

  useEffect(() => {
    if (transaction) {
      setDescricao(transaction.descricao);
      setValor(parseFloat(transaction.valor));
      setTipo(transaction.tipo);
    }
  }, [transaction]);

  if (!isOpen || !transaction) {
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const updatedData = {
        descricao,
        valor: parseFloat(valor),
        tipo,
      };

      // 3. CHAMADA À API ATUALIZADA--
      await api.put(`/transactions/${transaction.id}`, updatedData);

      onUpdate(); // Chama a função para atualizar os dados no Dashboard
      onClose();  // Fecha o modal

    } catch (err) {
      console.error("Erro ao atualizar transação:", err);
      setError(err.response?.data?.message || 'Não foi possível atualizar a transação.');
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Editar Transação</h2>
        <form onSubmit={handleSubmit}>
          {error && <p className="error-message" style={{textAlign: 'center', marginBottom: '1rem'}}>{error}</p>}
          <div className="form-group">
            <label htmlFor="edit-descricao">Descrição</label>
            <input
              type="text"
              id="edit-descricao"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="edit-valor">Valor</label>
            <input
              type="number"
              id="edit-valor"
              value={valor}
              onChange={(e) => setValor(e.target.value)}
              step="0.01"
              required
            />
          </div>
          <div className="form-group type-group">
            <label>
              <input
                type="radio"
                value="despesa"
                checked={tipo === 'despesa'}
                onChange={() => setTipo('despesa')}
              />
              Despesa
            </label>
            <label>
              <input
                type="radio"
                value="receita"
                checked={tipo === 'receita'}
                onChange={() => setTipo('receita')}
              />
              Receita
            </label>
          </div>
          <div className="modal-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn-save">Salvar Alterações</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditTransactionModal;