const {
  getSummaryByPeriod,
  deleteTransaction,
  updateTransaction,
  getTransactions,
  createTransaction,
  getSummary,
  getSpendingByCategory,
  getSpendingByCategoryAllTime,
} = require('./transactionsController');
const db = require('../db/db');

jest.mock('../db/db');

describe('Transaction Controller - Testes Unitários', () => {
  let res;

  beforeEach(() => {
    jest.clearAllMocks();
    res = {
      status: jest.fn(() => res),
      json: jest.fn(),
    };
  });

  // --- Teste 1 (getSummaryByPeriod) ---
  describe('getSummaryByPeriod', () => {
    it('deve calcular o resumo e a taxa de poupança corretamente', async () => {
      const mockDbResult = { rows: [{ total_receitas: '1000.00', total_despesas: '250.00' }] };
      db.query.mockResolvedValue(mockDbResult);
      const req = { userId: 1, query: { startDate: '2025-01-01', endDate: '2025-01-31' } };
      await getSummaryByPeriod(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ saldo: 750.00, taxa_de_poupanca: 75.0 }));
    });

    it('deve retornar 404 se nenhum dado for encontrado para o período', async () => {
      db.query.mockResolvedValue({ rows: [] });
      const req = { userId: 1, query: { startDate: '2025-01-01', endDate: '2025-01-31' } };
      await getSummaryByPeriod(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Dados não encontrados para o período.' });
    });

    it('deve retornar taxa_de_poupanca 0 se o saldo do período for negativo', async () => {
      const mockDbResult = { rows: [{ total_receitas: '100.00', total_despesas: '500.00' }] };
      db.query.mockResolvedValue(mockDbResult);
      const req = { userId: 1, query: { startDate: '2025-01-01', endDate: '2025-01-31' } };
      
      await getSummaryByPeriod(req, res);
      
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ 
        saldo: -400,
        taxa_de_poupanca: 0 
      }));
    });

    it('deve retornar 500 se a query do resumo falhar', async () => {
      db.query.mockRejectedValue(new Error('Falha no DB'));
      const req = { userId: 1, query: { startDate: '2025-01-01', endDate: '2025-01-31' } };
      await getSummaryByPeriod(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  // --- Teste 2 (deleteTransaction) ---
  describe('deleteTransaction', () => {
    it('deve apagar uma transação com sucesso', async () => {
      db.query.mockResolvedValue({ rowCount: 1 });
      const req = { userId: 1, params: { id: 100 } };
      await deleteTransaction(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('deve retornar 404 se a transação não for encontrada', async () => {
      db.query.mockResolvedValue({ rowCount: 0 });
      const req = { userId: 1, params: { id: 999 } };
      await deleteTransaction(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('deve retornar 500 se a query de apagar falhar', async () => {
      db.query.mockRejectedValue(new Error('Falha no DB'));
      const req = { userId: 1, params: { id: 100 } };
      await deleteTransaction(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  // --- Teste 3 (updateTransaction) ---
  describe('updateTransaction', () => {
    it('deve atualizar uma transação com sucesso', async () => {
      const mockUpdatedTransaction = { id: 1, descricao: 'Salário Editado' };
      db.query.mockResolvedValue({ rowCount: 1, rows: [mockUpdatedTransaction] });
      const req = { userId: 1, params: { id: 1 }, body: { descricao: 'Salário Editado', valor: 5000, tipo: 'receita', categoria: 'Salário', data: '2025-10-10' } };
      await updateTransaction(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('deve retornar 404 se a transação não for encontrada', async () => {
      db.query.mockResolvedValue({ rows: [] });
      const req = { userId: 1, params: { id: 999 }, body: { descricao: 'Teste', valor: 100, tipo: 'despesa', categoria: 'Outros', data: '2025-10-10' } };
      await updateTransaction(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Transação não encontrada ou você não tem permissão para editá-la.' });
    });

    it('deve retornar 400 se os campos obrigatórios não forem fornecidos', async () => {
      const req = { userId: 1, params: { id: 1 }, body: { descricao: 'Sem os outros campos' } };
      await updateTransaction(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('deve retornar 500 se a query de atualizar falhar', async () => {
      db.query.mockRejectedValue(new Error('Falha no DB'));
      const req = { userId: 1, params: { id: 1 }, body: { descricao: 'Salário Editado', valor: 5000, tipo: 'receita', categoria: 'Salário', data: '2025-10-10' } };
      await updateTransaction(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  // --- Teste 4 (getTransactions) ---
  describe('getTransactions', () => {
    it('deve buscar as transações com paginação padrão', async () => {
      const mockTransactions = [{ id: 1, descricao: 'Salário' }];
      const mockCount = { rows: [{ count: '1' }] };
      db.query.mockResolvedValueOnce({ rows: mockTransactions }).mockResolvedValueOnce(mockCount);
      const req = { userId: 1, query: {} };
      await getTransactions(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('deve buscar as transações filtrando por tipo', async () => {
      const mockTransactions = [{ id: 2, descricao: 'Aluguel', tipo: 'despesa' }];
      const mockCount = { rows: [{ count: '1' }] };
      db.query.mockResolvedValueOnce({ rows: mockTransactions }).mockResolvedValueOnce(mockCount);
      const req = { userId: 1, query: { tipo: 'despesa' } };
      await getTransactions(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('deve retornar 500 se a query de buscar transações falhar', async () => {
      db.query.mockRejectedValue(new Error('Falha no DB'));
      const req = { userId: 1, query: {} };
      await getTransactions(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  // --- Teste 5 (createTransaction) ---
  describe('createTransaction', () => {
    it('deve criar uma nova transação com sucesso', async () => {
      const mockNewTransaction = { id: 1, descricao: 'Nova Despesa', valor: 120, tipo: 'despesa' };
      db.query.mockResolvedValue({ rowCount: 1, rows: [mockNewTransaction] });
      const req = { userId: 1, body: { descricao: 'Nova Despesa', valor: 120, tipo: 'despesa', categoria: 'Alimentação', data: '2025-10-10' } };
      await createTransaction(req, res);
      expect(res.status).toHaveBeenCalledWith(201);
    });

    it('deve retornar 400 se os campos obrigatórios não forem fornecidos', async () => {
      const req = { userId: 1, body: { descricao: 'Sem valor', tipo: 'despesa' } };
      await createTransaction(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('deve retornar 400 se o tipo for inválido', async () => {
      const req = { userId: 1, body: { descricao: 'Tipo Inválido', valor: 100, tipo: 'investimento', categoria: 'Outros', data: '2025-10-10' } };
      await createTransaction(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('deve retornar 500 se a query de criar falhar', async () => {
      db.query.mockRejectedValue(new Error('Falha no DB'));
      const req = { userId: 1, body: { descricao: 'Nova Despesa', valor: 120, tipo: 'despesa', categoria: 'Alimentação', data: '2025-10-10' } };
      await createTransaction(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  // --- Teste 6 (getSummary) ---
  describe('getSummary', () => {
    it('deve retornar o resumo geral (all-time)', async () => {
      const mockSummary = { rows: [{ total_receitas: '5000.00', total_despesas: '1500.00' }] };
      db.query.mockResolvedValue(mockSummary);
      const req = { userId: 1 };
      await getSummary(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('deve retornar 404 se nenhum dado for encontrado para o resumo geral', async () => {
      db.query.mockResolvedValue({ rows: [] });
      const req = { userId: 1 };
      await getSummary(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Dados não encontrados.' });
    });

    it('deve retornar taxa_de_poupanca 0 se o saldo for negativo', async () => {
      const mockSummary = { rows: [{ total_receitas: '100.00', total_despesas: '500.00' }] };
      db.query.mockResolvedValue(mockSummary);
      const req = { userId: 1 };
      
      await getSummary(req, res);
      
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ 
        saldo: -400,
        taxa_de_poupanca: 0 
      }));
    });

    it('deve retornar 500 se a query do resumo geral falhar', async () => {
      db.query.mockRejectedValue(new Error('Falha no DB'));
      const req = { userId: 1 };
      await getSummary(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  // --- Teste 7 (getSpendingByCategory) ---
  describe('getSpendingByCategory', () => {
    it('deve retornar os gastos por categoria dentro de um período', async () => {
      const mockSpending = [{ categoria: 'Alimentação', total_gasto: '300.00' }];
      db.query.mockResolvedValue({ rows: mockSpending });
      const req = { userId: 1, query: { startDate: '2025-01-01', endDate: '2025-01-31' } };
      await getSpendingByCategory(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('deve retornar 400 se as datas estiverem faltando', async () => {
      const req = { userId: 1, query: {} };
      await getSpendingByCategory(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('deve retornar 500 se a query de gastos por categoria falhar', async () => {
      db.query.mockRejectedValue(new Error('Falha no DB'));
      const req = { userId: 1, query: { startDate: '2025-01-01', endDate: '2025-01-31' } };
      await getSpendingByCategory(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  // --- 8. getSpendingByCategoryAllTime ---
  describe('getSpendingByCategoryAllTime', () => {
    it('deve retornar os gastos por categoria de todo o período', async () => {
      const mockSpending = [{ categoria: 'Moradia', total_gasto: '1200.00' }];
      db.query.mockResolvedValue({ rows: mockSpending });
      const req = { userId: 1 };

      await getSpendingByCategoryAllTime(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(db.query).toHaveBeenCalledWith(
        expect.stringMatching(/GROUP BY\s+categoria/s),
        [1]
      );
    });

    it('deve retornar 500 se a query de gastos (all-time) falhar', async () => {
      db.query.mockRejectedValue(new Error('Falha no DB'));
      const req = { userId: 1 };
      await getSpendingByCategoryAllTime(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });
});