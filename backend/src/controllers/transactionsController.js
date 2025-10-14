// arquivo: backend/src/controllers/transactionsController.js (COMPLETO E ATUALIZADO)

const db = require('../db/db');

// --- 1. FUNÇÃO PARA CRIAR UMA NOVA TRANSAÇÃO ---
async function createTransaction(req, res) {
  const { descricao, valor, tipo, data, categoria, userId } = req.body;

  if (!descricao || !valor || !tipo || !data || !categoria || !userId) {
    return res.status(400).json({ message: 'Todos os campos são obrigatórios.' });
  }
  if (tipo !== 'receita' && tipo !== 'despesa') {
    return res.status(400).json({ message: "O tipo da transação deve ser 'receita' ou 'despesa'." });
  }

  try {
    const newTransaction = await db.query(
      'INSERT INTO transactions (descricao, valor, tipo, data, user_id) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [descricao, valor, tipo, data, userId]
    );
    res.status(201).json({
      message: 'Transação registrada com sucesso!',
      transaction: newTransaction.rows[0],
    });
  } catch (error) {
    console.error('Erro ao registrar transação:', error);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
}

// --- 2. FUNÇÃO PARA BUSCAR TODAS AS TRANSAÇÕES DE UM USUÁRIO ---
async function getTransactions(req, res) {
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ message: 'O ID do usuário é obrigatório.' });
  }

  try {
    const result = await db.query(
      'SELECT * FROM transactions WHERE user_id = $1 ORDER BY data DESC, id DESC',
      [userId]
    );
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar transações:', error);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
}

// --- 3. FUNÇÃO PARA BUSCAR O RESUMO FINANCEIRO ---
async function getSummary(req, res) {
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ message: 'O ID do usuário é obrigatório.' });
  }

  try {
    const summaryQuery = `
      SELECT
        COALESCE(SUM(CASE WHEN tipo = 'receita' THEN valor ELSE 0 END), 0) AS total_receitas,
        COALESCE(SUM(CASE WHEN tipo = 'despesa' THEN valor ELSE 0 END), 0) AS total_despesas
      FROM transactions
      WHERE user_id = $1;
    `;
    const result = await db.query(summaryQuery, [userId]);
    const summary = result.rows[0];

    const totalReceitas = parseFloat(summary.total_receitas);
    const totalDespesas = parseFloat(summary.total_despesas);
    const saldo = totalReceitas - totalDespesas;

    res.status(200).json({
      total_receitas: totalReceitas,
      total_despesas: totalDespesas,
      saldo: saldo,
    });
  } catch (error) {
    console.error('Erro ao buscar resumo financeiro:', error);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
}

// --- 4. FUNÇÃO PARA APAGAR UMA TRANSAÇÃO ---
async function deleteTransaction(req, res) {
  const { id } = req.params;
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ message: 'O ID do usuário é necessário para apagar a transação.' });
  }

  try {
    const result = await db.query(
      'DELETE FROM transactions WHERE id = $1 AND user_id = $2 RETURNING *',
      [id, userId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Transação não encontrada ou você não tem permissão para apagá-la.' });
    }

    res.status(200).json({ message: 'Transação apagada com sucesso!' });
  } catch (error) {
    console.error('Erro ao apagar transação:', error);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
}

// --- 5. FUNÇÃO NOVA PARA ATUALIZAR (EDITAR) UMA TRANSAÇÃO ---
async function updateTransaction(req, res) {
  const { id } = req.params; // ID da transação vindo da URL
  const { descricao, valor, tipo, userId } = req.body; // Novos dados e o ID do usuário

  if (!descricao || !valor || !tipo || !userId) {
    return res.status(400).json({ message: 'Todos os campos são obrigatórios.' });
  }

  try {
    const result = await db.query(
      `UPDATE transactions 
       SET descricao = $1, valor = $2, tipo = $3 
       WHERE id = $4 AND user_id = $5 
       RETURNING *`,
      [descricao, valor, tipo, id, userId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Transação não encontrada ou você não tem permissão para editá-la.' });
    }

    res.status(200).json({
      message: 'Transação atualizada com sucesso!',
      transaction: result.rows[0],
    });
  } catch (error) {
    console.error('Erro ao atualizar transação:', error);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
}


// --- EXPORTAÇÃO DE TODAS AS CINCO FUNÇÕES ---
module.exports = {
  createTransaction,
  getTransactions,
  getSummary,
  deleteTransaction,
  updateTransaction,
};