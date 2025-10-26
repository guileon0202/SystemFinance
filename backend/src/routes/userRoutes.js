const express = require('express');
const router = express.Router();

const authMiddleware = require('../middleware/authMiddleware');

// Importa todas as funções necessárias do controller
const { 
    register, 
    login, 
    forgotPassword, 
    resetPassword, 
    getUserProfile,
    updateUserProfile,
    changePassword
} = require('../controllers/userController');


// --- Rotas Públicas (não precisam de login) ---
router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);


// --- Rotas Privadas (precisam de login) ---
router.use(authMiddleware);

router.get('/profile', getUserProfile);
router.put('/profile', updateUserProfile);

// Rota nova para alterar a senha
router.put('/change-password', changePassword);


module.exports = router;