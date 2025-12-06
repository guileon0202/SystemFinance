const express = require('express');
const router = express.Router();

// Middlewares
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

// Controller
const {
    getAllUsers,
    updateUserAdminStatus,
    deleteUserByAdmin
} = require('../controllers/adminController');


// PROTEÇÃO DE ROTAS:
// Todas as rotas abaixo precisam que o usuário esteja logado (authMiddleware)
// E que ele seja um administrador (adminMiddleware)
router.use(authMiddleware, adminMiddleware);

// ROTAS DE GESTÃO DE USUÁRIOS

// GET /api/admin/users - Listar todos os usuários
router.get('/users', getAllUsers);

// PUT /api/admin/users/:userId/admin-status - Alterar o status de admin de um usuário
router.put('/users/:userId/admin-status', updateUserAdminStatus);

// DELETE /api/admin/users/:userId - Deletar um usuário
router.delete('/users/:userId', deleteUserByAdmin);


module.exports = router;