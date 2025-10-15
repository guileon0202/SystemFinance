// arquivo: backend/src/controllers/feedbackController.js (ATUALIZADO)

const db = require('../db/db');

// --- FUNÇÃO JÁ EXISTENTE ---
async function getFeedbacks(req, res) {
  const userId = req.userId; 

  try {
    const result = await db.query(
      'SELECT * FROM feedbacks WHERE user_id = $1 ORDER BY data_sugestao DESC',
      [userId]
    );
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar feedbacks:', error);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
}

// --- FUNÇÃO NOVA ---
// Função para criar um novo feedback
async function createFeedback(req, res) {
  const userId = req.userId; // ID do usuário vem do token (middleware)
  const { titulo, descricao } = req.body;

  if (!titulo || !descricao) {
    return res.status(400).json({ message: 'O título and a descrição são obrigatórios.' });
  }

  try {
    // 1. Buscar o nome do usuário logado para usar como autor
    const userResult = await db.query('SELECT nome FROM users WHERE id = $1', [userId]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: 'Usuário não encontrado.' });
    }
    const autor = userResult.rows[0].nome;

    // 2. Inserir o novo feedback com status inicial 'analisando'
    const newFeedback = await db.query(
      `INSERT INTO feedbacks (titulo, descricao, autor, status, user_id) 
       VALUES ($1, $2, $3, 'analisando', $4) 
       RETURNING *`,
      [titulo, descricao, autor, userId]
    );

    res.status(201).json(newFeedback.rows[0]);

  } catch (error) {
    console.error('Erro ao criar feedback:', error);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
}

// --- EXPORTAÇÃO ATUALIZADA ---
module.exports = {
  getFeedbacks,
  createFeedback,
};