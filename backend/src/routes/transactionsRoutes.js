// arquivo: backend/src/routes/transactionsRoutes.js (CORRIGIDO)

const express = require('express');
const router = express.Router();

const authMiddleware = require('../middleware/authMiddleware');

// CORREÇÃO: Removida a duplicata da lista de importação
const {
  createTransaction,
  getTransactions,
  getSummary,
  deleteTransaction,
  updateTransaction,
  getSummaryByPeriod,
  getSpendingByCategory
} = require('../controllers/transactionsController');


// Aplica o middleware de segurança a todas as rotas abaixo
router.use(authMiddleware);


// --- ROTAS PROTEGIDAS ---
router.post('/', createTransaction);
router.get('/', getTransactions);
router.get('/summary', getSummary);
router.get('/summary_by_period', getSummaryByPeriod);
router.get('/spending_by_category', getSpendingByCategory);
router.delete('/:id', deleteTransaction);
router.put('/:id', updateTransaction);

module.exports = router;