const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db/db'); // Módulo de conexão com o banco de dados

// A chave secreta deve ser a mesma do seu arquivo .env
const secret = process.env.JWT_SECRET || 'seu_segredo_super_forte'; 

// Função de Cadastro de Usuário
async function register(req, res) {
  const { email, password } = req.body;

  try {
    // 1. Verificar se o usuário já existe
    const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length > 0) {
      return res.status(400).json({ error: 'Usuário já existe.' });
    }

    // 2. Criptografar a senha antes de salvar no banco de dados
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Inserir o novo usuário no banco de dados
    const newUser = await db.query(
      'INSERT INTO users (email, password) VALUES ($1, $2) RETURNING id, email',
      [email, hashedPassword]
    );

    // 4. Gerar um token JWT para o usuário
    const token = jwt.sign({ userId: newUser.rows[0].id }, secret, { expiresIn: '1h' });

    res.status(201).json({ 
      message: 'Usuário cadastrado com sucesso!', 
      token,
      user: {
        id: newUser.rows[0].id,
        email: newUser.rows[0].email,
      }
    });
  } catch (error) {
    console.error('Erro ao cadastrar usuário:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
}

// Função de Login de Usuário
async function login(req, res) {
  const { email, password } = req.body;

  try {
    // 1. Encontrar o usuário pelo email
    const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];

    if (!user) {
      return res.status(400).json({ error: 'Email ou senha inválidos.' });
    }

    // 2. Comparar a senha fornecida com a senha criptografada do banco
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(400).json({ error: 'Email ou senha inválidos.' });
    }

    // 3. Gerar um token JWT se a senha estiver correta
    const token = jwt.sign({ userId: user.id }, secret, { expiresIn: '1h' });

    res.status(200).json({ 
      message: 'Login bem-sucedido!', 
      token,
      user: {
        id: user.id,
        email: user.email,
      }
    });
  } catch (error) {
    console.error('Erro ao fazer login:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
}

module.exports = {
  register,
  login,
};