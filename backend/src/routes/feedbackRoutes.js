const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');// MIDDLEWARE DE ADMIN

// 2. IMPORTE a nova função
const { 
  getFeedbacks, 
  createFeedback, 
  updateFeedbackStatus 
} = require('../controllers/feedbackController');

// Protege todas as rotas de feedback (usuário precisa estar logado)
router.use(authMiddleware);

// --- ROTAS PARA USUÁRIOS LOGADOS ---
router.get('/', getFeedbacks);
router.post('/', createFeedback);

// --- ROTA EXCLUSIVA PARA ADMINS ---
router.put('/:id/status', adminMiddleware, updateFeedbackStatus);

module.exports = router;