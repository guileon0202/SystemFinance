

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const db = require('../db/db');
const emailTransporter = require('../services/emailService');

const secret = process.env.JWT_SECRET || 'seu_segredo_super_forte';

// --- FUNÇÃO DE CADASTRO ---
async function register(req, res) {
  const { nome, email, senha } = req.body;

  if (!nome || !email || !senha) {
    return res.status(400).json({ message: 'Nome, email e senha são obrigatórios.' });
  }

  try {
    const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length > 0) {
      return res.status(400).json({ message: 'Usuário com este email já existe.' });
    }

    const hashedPassword = await bcrypt.hash(senha, 10);

    const newUser = await db.query(
      'INSERT INTO users (nome, email, senha) VALUES ($1, $2, $3) RETURNING id, email, nome',
      [nome, email, hashedPassword]
    );

    const token = jwt.sign({ userId: newUser.rows[0].id }, secret, { expiresIn: '1h' });

    res.status(201).json({
      message: 'Usuário cadastrado com sucesso!',
      token,
      user: {
        id: newUser.rows[0].id,
        email: newUser.rows[0].email,
        nome: newUser.rows[0].nome,
      }
    });
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

    if (!user) {
      return res.status(400).json({ message: 'Email ou senha inválidos.' });
    }

    const passwordMatch = await bcrypt.compare(senha, user.senha);

    if (!passwordMatch) {
      return res.status(400).json({ message: 'Email ou senha inválidos.' });
    }

    const token = jwt.sign({ userId: user.id }, secret, { expiresIn: '1h' });

    res.status(200).json({
      message: 'Login bem-sucedido!',
      token,
      user: {
        id: user.id,
        email: user.email,
        nome: user.nome,
      }
    });
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
    const now = new Date();
    const expires = new Date(now.getTime() + 3600000);

    await db.query(
      'UPDATE users SET reset_password_token = $1, reset_password_expires = $2 WHERE id = $3',
      [resetToken, expires, user.id]
    );

    const resetUrl = `http://localhost:3001/redefinir-senha/${resetToken}`;

    await emailTransporter.sendMail({
      from: '"Web Finanças" <noreply@webfinancas.com>',
      to: user.email,
      subject: 'Redefinição de Senha - Web Finanças',
      html: `
        <p>Você solicitou uma redefinição de senha para sua conta no Web Finanças.</p>
        <p>Clique no link abaixo para criar uma nova senha:</p>
        <a href="${resetUrl}">${resetUrl}</a>
        <p>Este link irá expirar em 1 hora.</p>
        <p>Se você não solicitou isso, por favor, ignore este e-mail.</p>
      `,
    });

    return res.status(200).json({ message: 'Se um usuário com este e-mail existir, um link de redefinição de senha foi enviado.' });

  } catch (error) {
    console.error('Erro no processo de esqueci a senha:', error);
    return res.status(500).json({ message: 'Erro interno do servidor, tente novamente.' });
  }
}

async function resetPassword(req, res) {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    return res.status(400).json({ message: 'Token e nova senha são obrigatórios.' });
  }

  try {
    // 1. Encontrar o usuário que possui este token E cujo token ainda não expirou
    const userResult = await db.query(
      'SELECT * FROM users WHERE reset_password_token = $1 AND reset_password_expires > NOW()',
      [token]
    );
    const user = userResult.rows[0];

    if (!user) {
      return res.status(400).json({ message: 'Token de redefinição inválido ou expirado.' });
    }

    // 2. Criptografar a nova senha
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // 3. Atualizar a senha do usuário no banco de dados e limpar o token
    await db.query(
        'UPDATE users SET senha = $1, reset_password_token = NULL, reset_password_expires = NULL WHERE id = $2',
        [hashedPassword, user.id]
    );

    // 4. Enviar resposta de sucesso
    res.status(200).json({ message: 'Senha redefinida com sucesso!' });

  } catch (error) {
    console.error('Erro ao redefinir senha:', error);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
}
module.exports = {
  register,
  login,
  forgotPassword,
  resetPassword,
};