const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { getStockQuote } = require('../controllers/investmentsController');

// Protege todas as rotas de investimentos. O usuário precisa estar logado.
router.use(authMiddleware);

// Rota GET para buscar a cotação de um ativo
router.get('/quote/:ticker', getStockQuote);

module.exports = router;