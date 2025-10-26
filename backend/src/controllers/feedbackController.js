const db = require('../db/db');

async function getFeedbacks(req, res) {
  try {
    const result = await db.query('SELECT * FROM feedbacks ORDER BY data_sugestao DESC');
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
    return res.status(400).json({ message: 'O título e a descrição são obrigatórios.' });
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


// Função para (ADMIN) atualizar o status de um feedback
async function updateFeedbackStatus(req, res) {
  const { id } = req.params;
  const { status } = req.body;

  if (!status || !['analisando', 'desenvolvendo', 'entregue'].includes(status)) {
    return res.status(400).json({ message: 'Status inválido.' });
  }

  try {
    const result = await db.query(
      'UPDATE feedbacks SET status = $1 WHERE id = $2 RETURNING *',
      [status, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Feedback não encontrado.' });
    }

    res.status(200).json(result.rows[0]);

  } catch (error) {
    console.error('Erro ao atualizar status do feedback:', error);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
}

// --- EXPORTAÇÃO ---
module.exports = {
  getFeedbacks,
  createFeedback,
  updateFeedbackStatus,
};