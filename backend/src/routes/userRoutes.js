const express = require('express');
const router = express.Router();

const authMiddleware = require('../middleware/authMiddleware');

// Importa funções necessárias do controller
const { 
    register, 
    login, 
    forgotPassword, 
    resetPassword, 
    getUserProfile,
    updateUserProfile,
    changePassword,
    deleteUser
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
router.put('/change-password', changePassword);
router.delete('/profile', deleteUser);

module.exports = router;