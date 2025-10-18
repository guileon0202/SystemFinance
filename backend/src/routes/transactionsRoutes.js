const express = require('express');
const router = express.Router();

const authMiddleware = require('../middleware/authMiddleware');
const {
  createTransaction,
  getTransactions,
  getSummary,
  deleteTransaction,
  updateTransaction,
  getSummaryByPeriod,
  getSpendingByCategory
} = require('../controllers/transactionsController');

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