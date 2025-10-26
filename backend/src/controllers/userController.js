const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const db = require('../db/db');
const emailTransporter = require('../services/emailService');

const secret = process.env.JWT_SECRET || 'seu_segredo_super_forte';

// --- FUNÇÃO DE CADASTRO ---
async function register(req, res) {
  const { nome, email, senha } = req.body;
  if (!nome || !email || !senha) { return res.status(400).json({ message: 'Nome, email e senha são obrigatórios.' }); }
  try {
    const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length > 0) { return res.status(400).json({ message: 'Usuário com este email já existe.' }); }
    const hashedPassword = await bcrypt.hash(senha, 10);
    const newUser = await db.query('INSERT INTO users (nome, email, senha) VALUES ($1, $2, $3) RETURNING id, email, nome', [nome, email, hashedPassword]);
    const token = jwt.sign({ userId: newUser.rows[0].id }, secret, { expiresIn: '1h' });
    res.status(201).json({ message: 'Usuário cadastrado com sucesso!', token, user: newUser.rows[0] });
  } catch (error) {
    console.error('Erro ao cadastrar usuário:', error);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
}

// --- FUNÇÃO DE LOGIN ---
async function login(req, res) {
  const { email, senha } = req.body;
  try {
    const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];
    if (!user) { return res.status(400).json({ message: 'Email ou senha inválidos.' }); }
    const passwordMatch = await bcrypt.compare(senha, user.senha);
    if (!passwordMatch) { return res.status(400).json({ message: 'Email ou senha inválidos.' }); }
    const token = jwt.sign({ userId: user.id }, secret, { expiresIn: '1h' });
    res.status(200).json({ message: 'Login bem-sucedido!', token, user: { id: user.id, email: user.email, nome: user.nome } });
  } catch (error) {
    console.error('Erro ao fazer login:', error);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
}

// --- FUNÇÃO: ESQUECI MINHA SENHA ---
async function forgotPassword(req, res) {
  const { email } = req.body;
  try {
    const userResult = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = userResult.rows[0];
    if (!user) {
      return res.status(200).json({ message: 'Se um usuário com este e-mail existir, um link de redefinição de senha foi enviado.' });
    }
    const resetToken = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 3600000);
    await db.query('UPDATE users SET reset_password_token = $1, reset_password_expires = $2 WHERE id = $3', [resetToken, expires, user.id]);
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

// --- FUNÇÃO: REDEFINIR A SENHA ---
async function resetPassword(req, res) {
  const { token, newPassword } = req.body;
  if (!token || !newPassword) { return res.status(400).json({ message: 'Token e nova senha são obrigatórios.' }); }
  try {
    const userResult = await db.query('SELECT * FROM users WHERE reset_password_token = $1 AND reset_password_expires > NOW()', [token]);
    const user = userResult.rows[0];
    if (!user) { return res.status(400).json({ message: 'Token de redefinição inválido ou expirado.' }); }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await db.query('UPDATE users SET senha = $1, reset_password_token = NULL, reset_password_expires = NULL WHERE id = $2', [hashedPassword, user.id]);
    res.status(200).json({ message: 'Senha redefinida com sucesso!' });
  } catch (error) {
    console.error('Erro ao redefinir senha:', error);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
}

// --- FUNÇÃO PARA BUSCAR O PERFIL DO USUÁRIO ---
async function getUserProfile(req, res) {
  const userId = req.userId;
  try {
    const result = await db.query('SELECT id, nome, email FROM users WHERE id = $1', [userId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Usuário não encontrado.' });
    }
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao buscar perfil do usuário:', error);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
}

// --- FUNÇÃO: ATUALIZAR O PERFIL DO USUÁRIO ---
async function updateUserProfile(req, res) {
  const userId = req.userId;
  const { nome, email } = req.body;

  if (!nome || !email) {
    return res.status(400).json({ message: 'Nome e e-mail são obrigatórios.' });
  }

  try {
    const emailCheck = await db.query('SELECT * FROM users WHERE email = $1 AND id != $2', [email, userId]);
    if (emailCheck.rows.length > 0) {
      return res.status(400).json({ message: 'Este e-mail já está em uso por outra conta.' });
    }

    const result = await db.query(
      'UPDATE users SET nome = $1, email = $2 WHERE id = $3 RETURNING id, nome, email',
      [nome, email, userId]
    );

    res.status(200).json({
      message: 'Perfil atualizado com sucesso!',
      user: result.rows[0],
    });

  } catch (error) {
    console.error('Erro ao atualizar perfil:', error);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
}

// --- FUNÇÃO NOVA: ALTERAR SENHA (LOGADO) ---
async function changePassword(req, res) {
  const userId = req.userId;
  const { senhaAntiga, novaSenha } = req.body;

  if (!senhaAntiga || !novaSenha) {
    return res.status(400).json({ message: 'Senha antiga e nova senha são obrigatórias.' });
  }

  try {
    const userResult = await db.query('SELECT * FROM users WHERE id = $1', [userId]);
    const user = userResult.rows[0];

    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado.' });
    }

    // 2. Verificar se a senha antiga fornecida está correta
    const isMatch = await bcrypt.compare(senhaAntiga, user.senha);
    if (!isMatch) {
      return res.status(400).json({ message: 'Senha atual incorreta.' });
    }

    // 3. Criptografar e salvar a nova senha
    const hashedPassword = await bcrypt.hash(novaSenha, 10);
    await db.query('UPDATE users SET senha = $1 WHERE id = $2', [hashedPassword, userId]);

    res.status(200).json({ message: 'Senha alterada com sucesso!' });

  } catch (error) {
    console.error('Erro ao alterar senha:', error);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
}

// --- EXPORTAÇÃO DE TODAS AS FUNÇÕES ---
module.exports = {
  register,
  login,
  forgotPassword,
  resetPassword,
  getUserProfile,
  updateUserProfile,
  changePassword,
};