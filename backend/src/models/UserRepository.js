const db = require('../db/db');

// Encontrar por Email (usado em login e registro)
async function findByEmail(email) {
    const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    return result.rows[0];
}

// Criar Novo Usuário (usado em registro)
async function create(nome, email, hashedPassword) {
    const result = await db.query(
        'INSERT INTO users (nome, email, senha) VALUES ($1, $2, $3) RETURNING id, email, nome',
        [nome, email, hashedPassword]
    );
    return result.rows[0];
}

// Encontrar por ID (usado em perfil e changePassword)
async function findById(userId) {
    // Nota: Em 'changePassword' precisamos da senha, então trazemos todas as colunas
    const result = await db.query('SELECT * FROM users WHERE id = $1', [userId]);
    return result.rows[0];
}

// Encontrar por Token de Reset (usado em resetPassword)
async function findByResetToken(token) {
    const result = await db.query(
        'SELECT * FROM users WHERE reset_password_token = $1 AND reset_password_expires > NOW()',
        [token]
    );
    return result.rows[0];
}

// Configurar Token de Reset (usado em forgotPassword)
async function setResetToken(userId, token, expires) {
    await db.query(
        'UPDATE users SET reset_password_token = $1, reset_password_expires = $2 WHERE id = $3',
        [token, expires, userId]
    );
}

// Resetar Senha (usado em resetPassword)
async function resetPassword(hashedPassword, userId) {
    await db.query(
        'UPDATE users SET senha = $1, reset_password_token = NULL, reset_password_expires = NULL WHERE id = $2',
        [hashedPassword, userId]
    );
}

// Checar Email para Update (usado em updateUserProfile)
async function findByEmailExcludingUser(email, userId) {
    const result = await db.query('SELECT * FROM users WHERE email = $1 AND id != $2', [email, userId]);
    return result.rows[0];
}

// Atualizar Perfil (usado em updateUserProfile)
async function updateProfile(nome, email, userId) {
    const result = await db.query(
        'UPDATE users SET nome = $1, email = $2 WHERE id = $3 RETURNING id, nome, email',
        [nome, email, userId]
    );
    return result.rows[0];
}

// Mudar Senha (usado em changePassword)
async function changePassword(hashedPassword, userId) {
    await db.query('UPDATE users SET senha = $1 WHERE id = $2', [hashedPassword, userId]);
}

// Deletar Usuário e Dados Relacionados (usado em deleteUser)
async function deleteUser(userId) {
    await db.query('DELETE FROM feedbacks WHERE user_id = $1', [userId]);
    await db.query('DELETE FROM transactions WHERE user_id = $1', [userId]);

    const result = await db.query('DELETE FROM users WHERE id = $1 RETURNING *', [userId]);
    return result.rowCount > 0;
}

// Listar Todos os Usuários (Exclusivo para Admin)
async function findAllUsers() {
    const result = await db.query(
        'SELECT id, nome, email, is_admin, data_cadastro FROM users ORDER BY id ASC'
    );
    return result.rows;
}

// Alterar Status Admin (Exclusivo para Admin)
async function setAdminStatus(userId, isAdmin) {
    const result = await db.query(
        'UPDATE users SET is_admin = $1 WHERE id = $2 RETURNING id, nome, email, is_admin',
        [isAdmin, userId]
    );
    return result.rows[0];
}


module.exports = {
    findByEmail,
    create,
    findById,
    findByResetToken,
    setResetToken,
    resetPassword,
    findByEmailExcludingUser,
    updateProfile,
    changePassword,
    deleteUser,
    findAllUsers,
    setAdminStatus,
};