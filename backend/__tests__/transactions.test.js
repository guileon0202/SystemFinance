const request = require('supertest');
const app = require('../src/app');
const db = require('../src/db/db');
const authMiddleware = require('../src/middleware/authMiddleware');

// MOCKS

// Mocka o DB (necessário para todas as queries)
jest.mock('../src/db/db', () => ({
    query: jest.fn(),
}));

// Mocka o Auth Middleware
jest.mock('../src/middleware/authMiddleware', () => (req, res, next) => {
    req.userId = 9999;
    next();
});

// Dados de teste
const TEST_USER_ID = 9999;
const TRANSACTION_ID = 101;
const testTransaction = {
    id: TRANSACTION_ID,
    user_id: TEST_USER_ID,
    descricao: 'Salário Mensal',
    valor: 5000.00,
    tipo: 'receita',
    data: '2025-10-01',
    categoria: 'Renda Principal'
};

const summaryResult = {
    total_receitas: 5000,
    total_despesas: 1500,
    saldo: 3500,
    taxa_de_poupanca: 70
};

const spendingByCategoryResult = [
    { categoria: 'Alimentação', total_gasto: 800 },
    { categoria: 'Transporte', total_gasto: 700 }
];

describe('Transaction Routes /api/transactions', () => {

    beforeEach(() => {
        db.query.mockClear();
    });

    // TESTE DE CRIAÇÃO (POST)
    it('POST /: deve criar uma nova transação com sucesso', async () => {
        db.query.mockResolvedValueOnce({ rows: [testTransaction] });

        const response = await request(app)
            .post('/api/transactions')
            .send({
                descricao: testTransaction.descricao,
                valor: testTransaction.valor,
                tipo: testTransaction.tipo,
                data: testTransaction.data,
                categoria: testTransaction.categoria
            });

        expect(response.statusCode).toBe(201);
        expect(response.body.message).toBe('Transação registrada com sucesso!');
        expect(response.body.transaction.descricao).toBe(testTransaction.descricao);
        expect(db.query).toHaveBeenCalledTimes(1);
    });

    it('POST /: deve retornar 400 se faltarem campos obrigatórios', async () => {
        const response = await request(app)
            .post('/api/transactions')
            .send({ descricao: 'Falta tudo' });

        expect(response.statusCode).toBe(400);
        expect(response.body.message).toBe('Todos os campos são obrigatórios.');
        expect(db.query).not.toHaveBeenCalled();
    });

    // TESTE DE BUSCA (GET /)
    it('GET /: deve buscar todas as transações do usuário', async () => {
        db.query.mockResolvedValueOnce({ rows: [{ count: '2' }] }) // 1. Mock para COUNT
            .mockResolvedValueOnce({ rows: [testTransaction, { ...testTransaction, id: 102 }] }); // 2. Mock para SELECT

        const response = await request(app)
            .get('/api/transactions?page=1&limit=10');

        expect(response.statusCode).toBe(200);
        expect(response.body.transactions.length).toBe(2);
        expect(response.body.transactions[0].user_id).toBe(TEST_USER_ID);
        expect(db.query).toHaveBeenCalledTimes(2);
    });

    // TESTE DE RESUMO SIMPLES (GET /summary)
    it('GET /summary: deve retornar o resumo financeiro (receitas, despesas, saldo)', async () => {
        db.query.mockResolvedValueOnce({ rows: [summaryResult] });

        const response = await request(app)
            .get('/api/transactions/summary');

        expect(response.statusCode).toBe(200);
        expect(response.body.total_receitas).toBe(summaryResult.total_receitas);
        expect(response.body.saldo).toBe(summaryResult.saldo);
        expect(db.query).toHaveBeenCalledTimes(1);
    });

    // TESTE DO FILTRO AVANÇADO (GET /summary_by_period)
    it('GET /summary_by_period: deve retornar o resumo para um período específico', async () => {
        db.query.mockResolvedValueOnce({ rows: [summaryResult] });

        const response = await request(app)
            .get('/api/transactions/summary_by_period?startDate=2025-10-01&endDate=2025-10-31');

        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty('taxa_de_poupanca', summaryResult.taxa_de_poupanca);
        expect(db.query).toHaveBeenCalledTimes(1);
    });

    // TESTE DO FILTRO POR CATEGORIA (GET /spending_by_category)
    it('GET /spending_by_category: deve retornar os gastos por categoria no período', async () => {
        db.query.mockResolvedValueOnce({ rows: spendingByCategoryResult });

        const response = await request(app)
            .get('/api/transactions/spending_by_category?startDate=2025-10-01&endDate=2025-10-31');

        expect(response.statusCode).toBe(200);
        expect(response.body.length).toBe(2);
        expect(response.body[0].categoria).toBe('Alimentação');
        expect(db.query).toHaveBeenCalledTimes(1);
    });


    // TESTE DE ATUALIZAÇÃO (PUT)
    it('PUT /:id: deve atualizar uma transação com sucesso', async () => {
        const updatedTransaction = { ...testTransaction, descricao: 'Salário de Outubro' };
        db.query.mockResolvedValueOnce({ rows: [updatedTransaction], rowCount: 1 });

        const response = await request(app)
            .put(`/api/transactions/${TRANSACTION_ID}`)
            .send({
                descricao: updatedTransaction.descricao,
                valor: testTransaction.valor,
                tipo: testTransaction.tipo,
                data: testTransaction.data,
                categoria: testTransaction.categoria
            });

        expect(response.statusCode).toBe(200);
        expect(response.body.message).toBe('Transação atualizada com sucesso!');
        expect(response.body.transaction.descricao).toBe(updatedTransaction.descricao);
        expect(db.query).toHaveBeenCalledTimes(1);
    });

    // TESTE DE EXCLUSÃO (DELETE)
    it('DELETE /:id: deve excluir uma transação com sucesso', async () => {
        db.query.mockResolvedValueOnce({ rows: [], rowCount: 1 });

        const response = await request(app)
            .delete(`/api/transactions/${TRANSACTION_ID}`);

        expect(response.statusCode).toBe(200);
        expect(response.body.message).toBe('Transação apagada com sucesso!');
        expect(db.query).toHaveBeenCalledTimes(1);
    });

});