const express = require('express');
const router = express.Router();

const authMiddleware = require('../middleware/authMiddleware');

// Importa todas as funções necessárias do controller
const { 
    register, 
    login, 
    forgotPassword, 
    resetPassword, 
    getUserProfile 
} = require('../controllers/userController');


// --- Rotas Públicas (não precisam de login) ---
router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);


// --- Rota Privada (precisa de login) ---
// O authMiddleware protege esta rota
router.get('/profile', authMiddleware, getUserProfile);


module.exports = router;