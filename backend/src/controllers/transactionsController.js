const TransactionRepository = require('../models/TransactionRepository');

// FUNÇÃO PARA CRIAR UMA NOVA TRANSAÇÃO
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
        const newTransaction = await TransactionRepository.createTransaction(
            descricao, valor, tipo, data, userId, categoria
        );

        res.status(201).json({
            message: 'Transação registrada com sucesso!',
            transaction: newTransaction,
        });
    } catch (error) {
        console.error('Erro ao registrar transação:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
    }
}

// FUNÇÃO PARA BUSCAR TRANSAÇÕES (COM PAGINAÇÃO E FILTRO EXTENDIDO)
async function getTransactions(req, res) {
    const userId = req.userId;
    const {
        page,
        limit,
        tipo,
        categoria,
        startDate,
        endDate
    } = req.query;

    const pageInt = parseInt(page) || 1;
    const limitInt = parseInt(limit) || 10;
    const offset = (pageInt - 1) * limitInt;

    try {
        const {
            transactions,
            totalItems,
            totalPages
        } = await TransactionRepository.getTransactionsWithFilters({
            userId,
            pageInt,
            limitInt,
            tipo,
            categoria,
            startDate,
            endDate,
            offset
        });

        res.status(200).json({
            transactions: transactions,
            currentPage: pageInt,
            totalPages: totalPages,
            totalItems: totalItems,
        });
    } catch (error) {
        console.error('Erro ao buscar transações com paginação e filtros:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
    }
}

// FUNÇÃO PARA BUSCAR O RESUMO FINANCEIRO (GERAL)
async function getSummary(req, res) {
    const userId = req.userId;
    try {
        const summary = await TransactionRepository.getSummary(userId);

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

// FUNÇÃO PARA APAGAR UMA TRANSAÇÃO
async function deleteTransaction(req, res) {
    const userId = req.userId;
    const { id } = req.params;

    try {
        const deleted = await TransactionRepository.deleteTransaction(id, userId);

        if (!deleted) {
            return res.status(404).json({ message: 'Transação não encontrada ou você não tem permissão para apagá-la.' });
        }

        res.status(200).json({ message: 'Transação apagada com sucesso!' });
    } catch (error) {
        console.error('Erro ao apagar transação:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
    }
}

// FUNÇÃO PARA ATUALIZAR (EDITAR) UMA TRANSAÇÃO
async function updateTransaction(req, res) {
    const userId = req.userId;
    const { id } = req.params;
    const { descricao, valor, tipo, categoria, data } = req.body;

    if (!descricao || !valor || !tipo || !categoria || !data) {
        return res.status(400).json({ message: 'Todos os campos são obrigatórios.' });
    }

    try {
        const updatedTransaction = await TransactionRepository.updateTransaction(
            id, userId, descricao, valor, tipo, categoria, data
        );

        if (!updatedTransaction) {
            return res.status(404).json({ message: 'Transação não encontrada ou você não tem permissão para editá-la.' });
        }

        res.status(200).json({
            message: 'Transação atualizada com sucesso!',
            transaction: updatedTransaction,
        });
    } catch (error) {
        console.error('Erro ao atualizar transação:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
    }
}

// FUNÇÃO PARA BUSCAR O RESUMO POR PERÍODO (COM TAXA DE POUPANÇA)
async function getSummaryByPeriod(req, res) {
    const userId = req.userId;
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
        return res.status(400).json({ message: 'Data de início e data de fim são obrigatórias.' });
    }

    try {
        const summary = await TransactionRepository.getSummaryByPeriod(userId, startDate, endDate);

        const totalReceitas = parseFloat(summary.total_receitas);
        const totalDespesas = parseFloat(summary.total_despesas);
        const saldo = totalReceitas - totalDespesas;

        let taxaDePoupanca = 0;
        if (totalReceitas > 0) {
            taxaDePoupanca = ((totalReceitas - totalDespesas) / totalReceitas) * 100;
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

// FUNÇÃO PARA BUSCAR GASTOS POR CATEGORIA
async function getSpendingByCategory(req, res) {
    const userId = req.userId;
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
        return res.status(400).json({ message: 'Data de início e data de fim são obrigatórias.' });
    }

    try {
        const spending = await TransactionRepository.getSpendingByCategory(userId, startDate, endDate);
        res.status(200).json(spending);

    } catch (error) {
        console.error('Erro ao buscar gastos por categoria:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
    }
}

module.exports = {
    createTransaction,
    getTransactions,
    getSummary,
    deleteTransaction,
    updateTransaction,
    getSummaryByPeriod,
    getSpendingByCategory,
};