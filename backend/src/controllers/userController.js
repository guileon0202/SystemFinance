// Arquivo: src/controllers/userController.js (COMPLETO E CORRIGIDO)

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db/db'); // Módulo de conexão com o banco de dados

// A chave secreta deve ser a mesma do seu arquivo .env
const secret = process.env.JWT_SECRET || 'seu_segredo_super_forte';

// Função de Cadastro de Usuário (CORRIGIDA)
async function register(req, res) {
  // 1. Agora pegamos o "nome" e usamos "senha" para manter o padrão
  const { nome, email, senha } = req.body;

  // Validação para garantir que o frontend enviou tudo
  if (!nome || !email || !senha) {
    return res.status(400).json({ message: 'Nome, email e senha são obrigatórios.' });
  }

  try {
    // 2. Verificar se o usuário já existe
    const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length > 0) {
      return res.status(400).json({ message: 'Usuário com este email já existe.' });
    }

    // 3. Criptografar a senha
    const hashedPassword = await bcrypt.hash(senha, 10);

    // 4. Inserir o novo usuário no banco de dados (QUERY ATUALIZADA)
    const newUser = await db.query(
      'INSERT INTO users (nome, email, senha) VALUES ($1, $2, $3) RETURNING id, email, nome',
      [nome, email, hashedPassword]
    );

    // 5. Gerar um token JWT para o usuário
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

// Função de Login de Usuário (CORRIGIDA)
async function login(req, res) {
  // 1. Usamos "senha" aqui também para manter o padrão
  const { email, senha } = req.body;

  try {
    // 2. Encontrar o usuário pelo email
    const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];

    if (!user) {
      return res.status(400).json({ message: 'Email ou senha inválidos.' });
    }

    // 3. Comparar a senha fornecida com a senha do banco (user.senha)
    const passwordMatch = await bcrypt.compare(senha, user.senha);

    if (!passwordMatch) {
      return res.status(400).json({ message: 'Email ou senha inválidos.' });
    }

    // 4. Gerar um token JWT se a senha estiver correta
    const token = jwt.sign({ userId: user.id }, secret, { expiresIn: '1h' });

    res.status(200).json({
      message: 'Login bem-sucedido!',
      token,
      user: {
        id: user.id,
        email: user.email,
        nome: user.nome, // Adicionei o nome do usuário na resposta do login
      }
    });
  } catch (error) {
    console.error('Erro ao fazer login:', error);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
}

module.exports = {
  register,
  login,
};