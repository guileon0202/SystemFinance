const { getSummaryByPeriod, deleteTransaction, updateTransaction, getTransactions, createTransaction } = require('./transactionsController');
const db = require('../db/db');

jest.mock('../db/db');

describe('Transaction Controller - Testes Unitários', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // --- Teste 1 (getSummaryByPeriod) ---
  it('deve calcular o resumo e a taxa de poupança corretamente', async () => {
    const mockDbResult = { rows: [{ total_receitas: '1000.00', total_despesas: '250.00' }] };
    db.query.mockResolvedValue(mockDbResult);
    const req = { userId: 1, query: { startDate: '2025-01-01', endDate: '2025-01-31' } };
    const res = { status: jest.fn(() => res), json: jest.fn() };
    await getSummaryByPeriod(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ saldo: 750.00, taxa_de_poupanca: 75.0 }));
  });

  // --- Teste 2 (deleteTransaction) ---
  it('deve apagar uma transação com sucesso', async () => {
    db.query.mockResolvedValue({ rowCount: 1 });
    const req = { userId: 1, params: { id: 100 } };
    const res = { status: jest.fn(() => res), json: jest.fn() };
    await deleteTransaction(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  // --- Teste 3 (deleteTransaction) ---
  it('deve retornar 404 se a transação não for encontrada para apagar', async () => {
    db.query.mockResolvedValue({ rowCount: 0 });
    const req = { userId: 1, params: { id: 999 } };
    const res = { status: jest.fn(() => res), json: jest.fn() };
    await deleteTransaction(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  // --- Teste 4 (updateTransaction - Sucesso) ---
  it('deve atualizar uma transação com sucesso', async () => {
    // ... (código do teste 4 que já fizemos)
    const mockUpdatedTransaction = { id: 1, descricao: 'Salário Editado' };
    db.query.mockResolvedValue({ rowCount: 1, rows: [mockUpdatedTransaction] });
    const req = { userId: 1, params: { id: 1 }, body: { descricao: 'Salário Editado', valor: 5000, tipo: 'receita', categoria: 'Salário', data: '2025-10-10' } };
    const res = { status: jest.fn(() => res), json: jest.fn() };
    await updateTransaction(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  // --- Teste 5 (updateTransaction - Falha 404) ---
  it('deve retornar 404 se a transação não for encontrada para atualizar', async () => {
    db.query.mockResolvedValue({ rowCount: 0 });
    const req = { userId: 1, params: { id: 999 }, body: { descricao: 'Teste', valor: 100, tipo: 'despesa', categoria: 'Outros', data: '2025-10-10' } };
    const res = { status: jest.fn(() => res), json: jest.fn() };
    await updateTransaction(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  // --- Teste 6 (updateTransaction - Falha 400) ---
  it('deve retornar 400 se os campos obrigatórios não forem fornecidos na atualização', async () => {
    const req = { userId: 1, params: { id: 1 }, body: { descricao: 'Sem os outros campos' } };
    const res = { status: jest.fn(() => res), json: jest.fn() };
    await updateTransaction(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });


  // --- 7. TESTE NOVO: getTransactions (Padrão, página 1) ---
  it('deve buscar as transações com paginação padrão', async () => {
    const mockTransactions = [{ id: 1, descricao: 'Salário' }];
    const mockCount = { rows: [{ count: '1' }] };
    
    db.query
      .mockResolvedValueOnce({ rows: mockTransactions })
      .mockResolvedValueOnce(mockCount);
      
    const req = {
      userId: 1,
      query: {}
    };
    const res = { status: jest.fn(() => res), json: jest.fn() };

    // Ação
    await getTransactions(req, res);

    // Verificação
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      transactions: mockTransactions,
      currentPage: 1,
      totalPages: 1,
      totalItems: 1
    });
  });

  // --- 8. TESTE NOVO: getTransactions (Com filtro de 'tipo') ---
  it('deve buscar as transações filtrando por tipo', async () => {
    const mockTransactions = [{ id: 2, descricao: 'Aluguel', tipo: 'despesa' }];
    const mockCount = { rows: [{ count: '1' }] };
    db.query
      .mockResolvedValueOnce({ rows: mockTransactions })
      .mockResolvedValueOnce(mockCount);
      
    const req = {
      userId: 1,
      query: { tipo: 'despesa' }
    };
    const res = { status: jest.fn(() => res), json: jest.fn() };

    // Ação
    await getTransactions(req, res);

    // Verificação
    expect(res.status).toHaveBeenCalledWith(200);
    expect(db.query).toHaveBeenNthCalledWith(1,
      expect.stringContaining('WHERE user_id = $1 AND tipo = $4'),
      [1, 10, 0, 'despesa']
    );
  });
  
// --- 9. TESTE NOVO: createTransaction (Sucesso) ---
  it('deve criar uma nova transação com sucesso', async () => {
    const mockNewTransaction = { id: 1, descricao: 'Nova Despesa', valor: 120, tipo: 'despesa' };
    db.query.mockResolvedValue({ rowCount: 1, rows: [mockNewTransaction] });
    
    const req = {
      userId: 1,
      body: {
        descricao: 'Nova Despesa',
        valor: 120,
        tipo: 'despesa',
        categoria: 'Alimentação',
        data: '2025-10-10'
      }
    };
    const res = { status: jest.fn(() => res), json: jest.fn() };

    // Ação
    await createTransaction(req, res);

    // Verificação
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      message: 'Transação registrada com sucesso!',
      transaction: mockNewTransaction
    }));
  });

  // --- 10. TESTE NOVO: createTransaction (Falha 400 - Validação) ---
  it('deve retornar 400 se os campos obrigatórios não forem fornecidos na criação', async () => {
    const req = {
      userId: 1,
      body: { descricao: 'Sem valor', tipo: 'despesa' }
    };
    const res = { status: jest.fn(() => res), json: jest.fn() };

    // Ação
    await createTransaction(req, res);

    // Verificação
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'Todos os campos são obrigatórios.' });
  });  

});