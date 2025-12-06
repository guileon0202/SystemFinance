const UserRepository = require('../models/UserRepository');

// FUNÇÃO: LISTAR TODOS OS USUÁRIOS (Admin View)
async function getAllUsers(req, res) {
    try {

        const users = await UserRepository.findAllUsers();

        res.status(200).json(users);
    } catch (error) {
        console.error('Erro ao listar todos os usuários:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
    }
}

// FUNÇÃO: ALTERAR STATUS ADMIN DE UM USUÁRIO
async function updateUserAdminStatus(req, res) {
    const { userId } = req.params;
    const { isAdmin } = req.body;

    if (typeof isAdmin !== 'boolean') {
        return res.status(400).json({ message: 'O campo isAdmin deve ser um booleano.' });
    }
    if (String(req.userId) === userId) {
        return res.status(400).json({ message: 'Você não pode alterar seu próprio status de administrador.' });
    }

    try {
        const updatedUser = await UserRepository.setAdminStatus(userId, isAdmin);

        if (!updatedUser) {
            return res.status(404).json({ message: 'Usuário não encontrado.' });
        }

        res.status(200).json({
            message: `Status de administrador de ${updatedUser.nome} atualizado para ${isAdmin}.`,
            user: updatedUser
        });

    } catch (error) {
        console.error('Erro ao alterar status admin:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
    }
}

// FUNÇÃO: DELETAR USUÁRIO (E DADOS RELACIONADOS) POR ADMIN
async function deleteUserByAdmin(req, res) {
    const { userId } = req.params;

    if (String(req.userId) === userId) {
        return res.status(400).json({ message: 'Administradores não podem se auto-deletar usando esta rota.' });
    }

    try {
        const deleted = await UserRepository.deleteUser(userId);

        if (!deleted) {
            return res.status(404).json({ message: 'Usuário não encontrado.' });
        }

        res.status(200).json({ message: `Conta do usuário ID ${userId} excluída com sucesso.` });

    } catch (error) {
        console.error('Erro ao excluir conta de usuário por admin:', error);
        res.status(500).json({ message: 'Erro interno do servidor ao excluir conta.' });
    }
}

module.exports = {
    getAllUsers,
    updateUserAdminStatus,
    deleteUserByAdmin,
};