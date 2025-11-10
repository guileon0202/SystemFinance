const db = require('../db/db');

// --- 1. FUNÇÃO PARA CRIAR UMA NOVA TRANSAÇÃO ---
async function createTransaction(req, res) {
  const userId = req.userId;
  const { descricao, valor, tipo, data, categoria } = req.body;

  if (!descricao || !valor || !tipo || !data || !categoria) {
    return res.status(400).json({ message: 'Todos os campos são obrigatórios.' });
  }
  if (tipo !== 'receita' && tipo !== 'despesa') {
    return res.status(400).json({ message: "O tipo da transação deve ser 'receita' ou 'despesa'." });
  }

  try {
    const newTransaction = await db.query(
      'INSERT INTO transactions (descricao, valor, tipo, data, user_id, categoria) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [descricao, valor, tipo, data, userId, categoria]
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

// --- 2. FUNÇÃO PARA BUSCAR TRANSAÇÕES (COM PAGINAÇÃO E FILTRO) ---
async function getTransactions(req, res) {
  const userId = req.userId;
  
  const { page = 1, limit = 10, tipo } = req.query;
  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);
  const offset = (pageNum - 1) * limitNum;

  let queryParams = [userId, limitNum, offset];
  let whereClauses = ['user_id = $1'];
  
  if (tipo && (tipo === 'receita' || tipo === 'despesa')) {
    whereClauses.push(`tipo = $${queryParams.length + 1}`);
    queryParams.push(tipo);
  }
  const whereString = whereClauses.join(' AND ');

  try {
    const transactionsQuery = `
      SELECT * FROM transactions
      WHERE ${whereString}
      ORDER BY data DESC, id DESC
      LIMIT $2 OFFSET $3;
    `;
    const transactionsResult = await db.query(transactionsQuery, queryParams);

    const countQuery = `SELECT COUNT(*) FROM transactions WHERE ${whereString};`;
    const countParams = queryParams.slice(0, whereClauses.length);
    const countResult = await db.query(countQuery, countParams);
    
    const totalItems = parseInt(countResult.rows[0].count, 10);
    const totalPages = Math.ceil(totalItems / limitNum);

    res.status(200).json({
      transactions: transactionsResult.rows,
      currentPage: pageNum,
      totalPages: totalPages,
      totalItems: totalItems,
    });
  } catch (error) {
    console.error('Erro ao buscar transações com paginação:', error);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
}

// --- 3. FUNÇÃO PARA BUSCAR O RESUMO FINANCEIRO (GERAL / ALL TIME) ---
async function getSummary(req, res) {
    const userId = req.userId;
  
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

      // Calcula a taxa de poupança para o resumo geral também
      let taxaDePoupanca = 0;
      if (totalReceitas > 0) {
        taxaDePoupanca = (saldo / totalReceitas) * 100;
      }
      if (taxaDePoupanca < 0) {
        taxaDePoupanca = 0;
      }
  
      res.status(200).json({
        total_receitas: totalReceitas,
        total_despesas: totalDespesas,
        saldo: saldo,
        taxa_de_poupanca: taxaDePoupanca,
      });
    } catch (error) {
      console.error('Erro ao buscar resumo financeiro:', error);
      res.status(500).json({ message: 'Erro interno do servidor.' });
    }
}

// --- 4. FUNÇÃO PARA APAGAR UMA TRANSAÇÃO ---
async function deleteTransaction(req, res) {
    const userId = req.userId;
    const { id } = req.params;
  
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

// --- 5. FUNÇÃO PARA ATUALIZAR (EDITAR) UMA TRANSAÇÃO ---
async function updateTransaction(req, res) {
    const userId = req.userId;
    const { id } = req.params;
    const { descricao, valor, tipo, categoria, data } = req.body;
  
    if (!descricao || !valor || !tipo || !categoria || !data) {
      return res.status(400).json({ message: 'Todos os campos são obrigatórios.' });
    }
  
    try {
      const result = await db.query(
        `UPDATE transactions 
         SET descricao = $1, valor = $2, tipo = $3, categoria = $4, data = $5
         WHERE id = $6 AND user_id = $7 
         RETURNING *`,
        [descricao, valor, tipo, categoria, data, id, userId]
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

// --- 6. FUNÇÃO PARA BUSCAR O RESUMO POR PERÍODO (COM TAXA DE POUPANÇA) ---
async function getSummaryByPeriod(req, res) {
    const userId = req.userId;
    const { startDate, endDate } = req.query;
  
    if (!startDate || !endDate) {
      return res.status(400).json({ message: 'Data de início e data de fim são obrigatórias.' });
    }
  
    try {
      const summaryQuery = `
        SELECT
          COALESCE(SUM(CASE WHEN tipo = 'receita' THEN valor ELSE 0 END), 0) AS total_receitas,
          COALESCE(SUM(CASE WHEN tipo = 'despesa' THEN valor ELSE 0 END), 0) AS total_despesas
        FROM transactions
        WHERE user_id = $1 AND data BETWEEN $2 AND $3;
      `;
  
      const result = await db.query(summaryQuery, [userId, startDate, endDate]);
      const summary = result.rows[0];
  
      const totalReceitas = parseFloat(summary.total_receitas);
      const totalDespesas = parseFloat(summary.total_despesas);
      const saldo = totalReceitas - totalDespesas;
  
      let taxaDePoupanca = 0;
      if (totalReceitas > 0) {
        taxaDePoupanca = (saldo / totalReceitas) * 100;
      }
      if (taxaDePoupanca < 0) {
        taxaDePoupanca = 0;
      }
  
      res.status(200).json({
        total_receitas: totalReceitas,
        total_despesas: totalDespesas,
        saldo: saldo,
        taxa_de_poupanca: taxaDePoupanca,
      });
    } catch (error) {
      console.error('Erro ao buscar resumo por período:', error);
      res.status(500).json({ message: 'Erro interno do servidor.' });
    }
}

// --- 7. FUNÇÃO PARA BUSCAR GASTOS POR CATEGORIA (POR PERÍODO) ---
async function getSpendingByCategory(req, res) {
    const userId = req.userId;
    const { startDate, endDate } = req.query;
  
    if (!startDate || !endDate) {
      return res.status(400).json({ message: 'Data de início e data de fim são obrigatórias.' });
    }
  
    try {
      const spendingQuery = `
        SELECT
          categoria,
          SUM(valor) AS total_gasto
        FROM transactions
        WHERE
          user_id = $1
          AND tipo = 'despesa'
          AND data BETWEEN $2 AND $3
        GROUP BY
          categoria
        ORDER BY
          total_gasto DESC;
      `;
  
      const result = await db.query(spendingQuery, [userId, startDate, endDate]);
      res.status(200).json(result.rows);
  
    } catch (error) {
      console.error('Erro ao buscar gastos por categoria:', error);
      res.status(500).json({ message: 'Erro interno do servidor.' });
    }
}

// --- 8. FUNÇÃO NOVA PARA BUSCAR GASTOS POR CATEGORIA (ALL TIME) ---
async function getSpendingByCategoryAllTime(req, res) {
  const userId = req.userId;

  try {
    const spendingQuery = `
      SELECT
        categoria,
        SUM(valor) AS total_gasto
      FROM transactions
      WHERE
        user_id = $1
        AND tipo = 'despesa'
      GROUP BY
        categoria
      ORDER BY
        total_gasto DESC;
    `;
    
    // Note: Esta query só precisa do $1 (userId)
    const result = await db.query(spendingQuery, [userId]);
    res.status(200).json(result.rows);

  } catch (error) {
    console.error('Erro ao buscar gastos por categoria (all time):', error);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
}

// --- EXPORTAÇÃO DE TODAS AS OITO FUNÇÕES ---
module.exports = {
  createTransaction,
  getTransactions,
  getSummary,
  deleteTransaction,
  updateTransaction,
  getSummaryByPeriod,
  getSpendingByCategory,
  getSpendingByCategoryAllTime,
};