// arquivo: backend/src/routes/feedbackRoutes.js (ATUALIZADO)

const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
// 1. IMPORTE a nova função createFeedback
const { getFeedbacks, createFeedback } = require('../controllers/feedbackController');

// Protege todas as rotas de feedback
router.use(authMiddleware);

// Rota GET para buscar todos os feedbacks (já existe)
router.get('/', getFeedbacks);

// 2. ROTA NOVA para criar um novo feedback
router.post('/', createFeedback);

module.exports = router;