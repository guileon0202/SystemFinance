const db = require('../db/db');

// C R U D
async function createTransaction(descricao, valor, tipo, data, userId, categoria) {
    const newTransaction = await db.query(
        'INSERT INTO transactions (descricao, valor, tipo, data, user_id, categoria) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
        [descricao, valor, tipo, data, userId, categoria]
    );
    return newTransaction.rows[0];
}

async function updateTransaction(id, userId, descricao, valor, tipo, categoria, data) {
    const result = await db.query(
        `UPDATE transactions 
       SET descricao = $1, valor = $2, tipo = $3, categoria = $4, data = $5
       WHERE id = $6 AND user_id = $7 
       RETURNING *`,
        [descricao, valor, tipo, categoria, data, id, userId]
    );
    return result.rows[0];
}

async function deleteTransaction(id, userId) {
    const result = await db.query(
        'DELETE FROM transactions WHERE id = $1 AND user_id = $2 RETURNING *',
        [id, userId]
    );
    return result.rowCount > 0;
}

// Filtros/Relatórios
async function getTransactionsWithFilters({ userId, limitInt, tipo, categoria, startDate, endDate, offset }) {

    let params = [userId];
    let whereClauses = ['user_id = $1'];
    let paramIndex = 2;

    if (tipo && (tipo === 'receita' || tipo === 'despesa')) {
        whereClauses.push(`tipo = $${paramIndex++}`);
        params.push(tipo);
    }

    if (categoria) {
        whereClauses.push(`categoria ILIKE $${paramIndex++}`);
        params.push(`%${categoria}%`);
    }

    if (startDate && endDate) {
        whereClauses.push(`data BETWEEN $${paramIndex++} AND $${paramIndex++}`);
        params.push(startDate, endDate);
    }

    const whereSql = 'WHERE ' + whereClauses.join(' AND ');


    const totalQuerySql = `SELECT COUNT(*) FROM transactions ${whereSql}`;

    const totalTransactionsQuery = await db.query(totalQuerySql, params);
    const totalItems = parseInt(totalTransactionsQuery.rows[0].count);


    const transactionsQuerySql = `
        SELECT * FROM transactions
        ${whereSql}
        ORDER BY data DESC, id DESC
        LIMIT $${paramIndex++} OFFSET $${paramIndex++}
    `;
    params.push(limitInt, offset);

    const transactions = await db.query(transactionsQuerySql, params);

    return {
        transactions: transactions.rows,
        totalItems,
        totalPages: Math.ceil(totalItems / limitInt),
    };
}


async function getSummary(userId) {
    const summaryQuery = `
        SELECT
            COALESCE(SUM(CASE WHEN tipo = 'receita' THEN valor ELSE 0 END), 0) AS total_receitas,
            COALESCE(SUM(CASE WHEN tipo = 'despesa' THEN valor ELSE 0 END), 0) AS total_despesas
        FROM transactions
        WHERE user_id = $1;
    `;
    const result = await db.query(summaryQuery, [userId]);
    return result.rows[0];
}

async function getSummaryByPeriod(userId, startDate, endDate) {
    const summaryQuery = `
        SELECT
            COALESCE(SUM(CASE WHEN tipo = 'receita' THEN valor ELSE 0 END), 0) AS total_receitas,
            COALESCE(SUM(CASE WHEN tipo = 'despesa' THEN valor ELSE 0 END), 0) AS total_despesas
        FROM transactions
        WHERE user_id = $1 AND data BETWEEN $2 AND $3;
    `;
    const result = await db.query(summaryQuery, [userId, startDate, endDate]);
    return result.rows[0];
}

async function getSpendingByCategory(userId, startDate, endDate) {
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
    return result.rows;
}

module.exports = {
    createTransaction,
    updateTransaction,
    deleteTransaction,
    getTransactionsWithFilters,
    getSummary,
    getSummaryByPeriod,
    getSpendingByCategory,
};