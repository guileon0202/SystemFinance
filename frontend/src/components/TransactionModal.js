import React, { useState } from 'react';
import './TransactionModal.css';

const TransactionModal = ({ isOpen, onClose }) => {
  const [descricao, setDescricao] = useState('');
  const [valor, setValor] = useState('');
  const [tipo, setTipo] = useState('despesa');

  if (!isOpen) {
    return null;
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log({ descricao, valor, tipo });
    alert('Transação registrada no console!');
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Registrar Nova Transação</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="descricao">Descrição</label>
            <input
              type="text"
              id="descricao"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Ex: Salário, Aluguel"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="valor">Valor</label>
            <input
              type="number"
              id="valor"
              value={valor}
              onChange={(e) => setValor(e.target.value)}
              placeholder="0,00"
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
            <button type="submit" className="btn-save">Salvar</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransactionModal;