const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const emailTransporter = require('../services/emailService');
const UserRepository = require('../models/UserRepository');

const secret = process.env.JWT_SECRET || 'seu_segredo_super_forte';

// FUNÇÃO DE CADASTRO
async function register(req, res) {
    const { nome, email, senha } = req.body;
    if (!nome || !email || !senha) { return res.status(400).json({ message: 'Nome, email e senha são obrigatórios.' }); }
    try {

        const existingUser = await UserRepository.findByEmail(email);
        if (existingUser) { return res.status(400).json({ message: 'Usuário com este email já existe.' }); }

        const hashedPassword = await bcrypt.hash(senha, 10);

        const newUser = await UserRepository.create(nome, email, hashedPassword);

        const token = jwt.sign({ userId: newUser.id }, secret, { expiresIn: '1h' });

        res.status(201).json({
            message: 'Usuário cadastrado com sucesso!',
            token,
            user: newUser
        });
    } catch (error) {
        console.error('Erro ao cadastrar usuário:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
    }
}

// FUNÇÃO DE LOGIN
async function login(req, res) {
    const { email, senha } = req.body;
    try {
        const user = await UserRepository.findByEmail(email);

        if (!user) { return res.status(400).json({ message: 'Email ou senha inválidos.' }); }

        const passwordMatch = await bcrypt.compare(senha, user.senha);
        if (!passwordMatch) { return res.status(400).json({ message: 'Email ou senha inválidos.' }); }

        const token = jwt.sign({ userId: user.id }, secret, { expiresIn: '1h' });

        res.status(200).json({
            message: 'Login bem-sucedido!',
            token,
            user: { id: user.id, email: user.email, nome: user.nome }
        });
    } catch (error) {
        console.error('Erro ao fazer login:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
    }
}

// FUNÇÃO: ESQUECI MINHA SENHA
async function forgotPassword(req, res) {
    const { email } = req.body;
    try {
        const user = await UserRepository.findByEmail(email);

        if (!user) {

            return res.status(200).json({ message: 'Se um usuário com este e-mail existir, um link de redefinição de senha foi enviado.' });
        }

        const resetToken = crypto.randomBytes(32).toString('hex');
        const expires = new Date(Date.now() + 3600000);

        await UserRepository.setResetToken(user.id, resetToken, expires);

        const resetUrl = `http://localhost:3001/redefinir-senha/${resetToken}`;

        await emailTransporter.sendMail({
            from: '"Web Finanças" <noreply@webfinancas.com>',
            to: user.email,
            subject: 'Redefinição de Senha - Web Finanças',
            html: `<p>Você solicitou uma redefinição de senha. Clique no link a seguir para criar uma nova senha: <a href="${resetUrl}">${resetUrl}</a></p><p>Este link expira em 1 hora.</p>`,
        });

        return res.status(200).json({ message: 'Se um usuário com este e-mail existir, um link de redefinição de senha foi enviado.' });
    } catch (error) {
        console.error('Erro no processo de esqueci a senha:', error);
        return res.status(500).json({ message: 'Erro interno do servidor, tente novamente.' });
    }
}

// FUNÇÃO: REDEFINIR A SENHA
async function resetPassword(req, res) {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) { return res.status(400).json({ message: 'Token e nova senha são obrigatórios.' }); }
    try {

        const user = await UserRepository.findByResetToken(token);

        if (!user) { return res.status(400).json({ message: 'Token de redefinição inválido ou expirado.' }); }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await UserRepository.resetPassword(hashedPassword, user.id);

        res.status(200).json({ message: 'Senha redefinida com sucesso!' });
    } catch (error) {
        console.error('Erro ao redefinir senha:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
    }
}

// FUNÇÃO PARA BUSCAR O PERFIL DO USUÁRIO
async function getUserProfile(req, res) {
    const userId = req.userId;
    try {

        const user = await UserRepository.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'Usuário não encontrado.' });
        }

        const { senha, ...profile } = user;

        res.status(200).json(profile);
    } catch (error) {
        console.error('Erro ao buscar perfil do usuário:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
    }
}

// FUNÇÃO: ATUALIZAR O PERFIL DO USUÁRIO
async function updateUserProfile(req, res) {
    const userId = req.userId;
    const { nome, email } = req.body;

    if (!nome || !email) {
        return res.status(400).json({ message: 'Nome e e-mail são obrigatórios.' });
    }

    try {

        const emailCheck = await UserRepository.findByEmailExcludingUser(email, userId);
        if (emailCheck) {
            return res.status(400).json({ message: 'Este e-mail já está em uso por outra conta.' });
        }

        const updatedUser = await UserRepository.updateProfile(nome, email, userId);

        res.status(200).json({
            message: 'Perfil atualizado com sucesso!',
            user: updatedUser,
        });

    } catch (error) {
        console.error('Erro ao atualizar perfil:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
    }
}

// FUNÇÃO: ALTERAR SENHA (LOGADO)
async function changePassword(req, res) {
    const userId = req.userId;
    const { senhaAntiga, novaSenha } = req.body;

    if (!senhaAntiga || !novaSenha) {
        return res.status(400).json({ message: 'Senha antiga e nova senha são obrigatórias.' });
    }

    try {
        // CHAMA O REPOSITORY: Busca o usuário (incluindo a senha)
        const user = await UserRepository.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'Usuário não encontrado.' });
        }

        // Verificar se a senha antiga fornecida está correta
        const isMatch = await bcrypt.compare(senhaAntiga, user.senha);
        if (!isMatch) {
            return res.status(400).json({ message: 'Senha atual incorreta.' });
        }

        // Criptografar e salvar a nova senha
        const hashedPassword = await bcrypt.hash(novaSenha, 10);

        await UserRepository.changePassword(hashedPassword, userId);

        res.status(200).json({ message: 'Senha alterada com sucesso!' });

    } catch (error) {
        console.error('Erro ao alterar senha:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
    }
}

// EXCLUIR USUÁRIO E DADOS RELACIONADOS
async function deleteUser(req, res) {
    const userId = req.userId; // ID do usuário logado (vem do token)

    try {
        const deleted = await UserRepository.deleteUser(userId);

        if (!deleted) {
            return res.status(404).json({ message: 'Usuário não encontrado.' });
        }

        res.status(200).json({ message: 'Conta excluída com sucesso.' });

    } catch (error) {
        console.error('Erro ao excluir conta:', error);
        res.status(500).json({ message: 'Erro interno do servidor ao excluir conta.' });
    }
}

module.exports = {
    register,
    login,
    forgotPassword,
    resetPassword,
    getUserProfile,
    updateUserProfile,
    changePassword,
    deleteUser,
};