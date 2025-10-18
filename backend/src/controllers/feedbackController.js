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

// Função para criar um novo feedback
async function createFeedback(req, res) {
  const userId = req.userId;
  const { titulo, descricao } = req.body;

  if (!titulo || !descricao) {
    return res.status(400).json({ message: 'O título and a descrição são obrigatórios.' });
  }

  try {
    const userResult = await db.query('SELECT nome FROM users WHERE id = $1', [userId]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: 'Usuário não encontrado.' });
    }
    const autor = userResult.rows[0].nome;
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