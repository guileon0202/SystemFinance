const db = require('../db/db');

async function getAllFeedbacks() {
    const result = await db.query('SELECT * FROM feedbacks ORDER BY data_sugestao DESC');
    return result.rows;
}


async function createFeedback(titulo, descricao, autor, userId) {
    const newFeedback = await db.query(
        `INSERT INTO feedbacks (titulo, descricao, autor, status, user_id) 
     VALUES ($1, $2, $3, 'analisando', $4) 
     RETURNING *`,
        [titulo, descricao, autor, userId]
    );
    return newFeedback.rows[0];
}

async function updateStatus(id, status) {
    const result = await db.query(
        'UPDATE feedbacks SET status = $1 WHERE id = $2 RETURNING *',
        [status, id]
    );

    return result.rows[0];
}

module.exports = {
    getAllFeedbacks,
    createFeedback,
    updateStatus,
};