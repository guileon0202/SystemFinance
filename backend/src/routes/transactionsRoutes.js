// arquivo: backend/src/routes/transactionsRoutes.js (COMPLETO E CORRIGIDO)

const express = require('express');
const router = express.Router();

// 1. ADICIONE 'updateTransaction' à lista de importação
const {
  createTransaction,
  getTransactions,
  getSummary,
  deleteTransaction,
  updateTransaction // <-- ESTAVA FALTANDO AQUI
} = require('../controllers/transactionsController');

// --- Rotas Existentes ---
router.post('/', createTransaction);
router.get('/', getTransactions);
router.get('/summary', getSummary);
router.delete('/:id', deleteTransaction);

// --- Rota Nova para Atualizar ---
router.put('/:id', updateTransaction);

module.exports = router;