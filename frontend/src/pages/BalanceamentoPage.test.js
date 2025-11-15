import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react'; 
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import BalanceamentoPage from './BalanceamentoPage';
import { ToastContainer } from 'react-toastify'; 

// 1. MOCKS DE DEPENDÊNCIAS
jest.mock('react-chartjs-2', () => ({
  Doughnut: () => <div data-testid="doughnut-chart">Doughnut Chart</div>,
  Pie: () => <div data-testid="pie-chart">Pie Chart</div>,
}));

// Mockar a API (CORREÇÃO DE PATH: Usa o mesmo caminho que o componente)
jest.mock('../services/api', () => ({
  get: jest.fn(),
}));
const api = require('../services/api'); // Requeremos o mock para usar .get

// Mockar o Header
jest.mock('../components/Header', () => ({ user }) => (
  <header><span>Logado como: {user.email}</span></header>
));

// MOCK LOCALSTORAGE (Padrão)
const mockUser = { id: 1, nome: 'Usuário Teste', email: 'teste@teste.com' };
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: jest.fn(),
    setItem: jest.fn(),
    clear: jest.fn(),
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// DADOS MOCKADOS
const mockSummary = {
  saldo: 1500.50,
  total_receitas: 3000.00,
  total_despesas: 1499.50,
  taxa_de_poupanca: 50.0 
};
const mockSpending = [
  { categoria: 'Alimentação', total_gasto: 500 },
  { categoria: 'Moradia', total_gasto: 999.50 },
];
const mockBalanceamentoEmptyResponse = {
  saldo: 0, total_receitas: 0, total_despesas: 0, taxa_de_poupanca: 0
};


// --- FUNÇÃO HELPER DE RENDERIZAÇÃO ---
const renderPage = (initialEntries = ['/balanceamento']) => {
    localStorage.setItem('user', JSON.stringify(mockUser));
    
    let renderResult;
    // Usamos act() para garantir que o setUser() assíncrono seja processado imediatamente
    act(() => { 
        renderResult = render(
          <MemoryRouter initialEntries={initialEntries}>
            <ToastContainer />
            <Routes>
              <Route path="/balanceamento" element={<BalanceamentoPage />} />
              <Route path="/login" element={<div>Página de Login</div>} />
            </Routes>
          </MemoryRouter>
        );
    });
    return renderResult;
};

// --- LIMPEZA ---
beforeEach(() => {
  jest.resetAllMocks();
  localStorage.clear();

  // Re-implementação do localStorage para estabilidade
  let store = {};
  localStorageMock.getItem.mockImplementation((key) => store[key] || null);
  localStorageMock.setItem.mockImplementation((key, value) => { store[key] = value.toString(); });
  localStorageMock.clear.mockImplementation(() => { store = {}; });

  // Mocka a data de hoje
  global.Date = jest.fn(() => new Date('2025-11-15T12:00:00.000Z'));
  
  api.get.mockClear(); 
});

// --- OS TESTES ---

describe('1. Fluxo de Autenticação e Carregamento de Dados', () => {

  test('deve redirecionar para /login se não houver usuário logado', async () => {
    localStorage.clear();
    render(
        <MemoryRouter initialEntries={['/balanceamento']}>
            <Routes>
                <Route path="/balanceamento" element={<BalanceamentoPage />} />
                <Route path="/login" element={<div>Página de Login</div>} /> 
            </Routes>
        </MemoryRouter>
    );

    expect(await screen.findByText('Página de Login')).toBeInTheDocument();
  });

  test('deve exibir o estado de carregamento e depois os dados do sumário', async () => {
    api.get.mockImplementation((url) => {
        if (url.includes('/transactions/summary')) {
            return Promise.resolve({ data: mockSummary });
        }
        if (url.includes('/transactions/spending_by_category')) {
            return Promise.resolve({ data: mockSpending });
        }
        return Promise.reject(new Error('Rota não mockada'));
    });

    renderPage();

    // 1. Estado inicial de loading
    // Nota: O componente BalanceamentoPage.js não tem um texto 'Carregando transações...'
    // Apenas '...' nos valores. Vamos verificar o '...'
    expect(screen.getAllByText('...')[0]).toBeInTheDocument(); 

    // 2. Espera os dados serem exibidos
    await screen.findByText('R$ 3.000,00'); 
    
    expect(screen.getByText('R$ 1.500,00')).toBeInTheDocument();
    expect(screen.getByText('66,67%')).toBeInTheDocument();
    
    // Verifica se a chamada inicial usou o endpoint por período (default: monthly)
    expect(api.get).toHaveBeenCalledWith('/transactions/summary_by_period', expect.any(Object));
  });
  
  test('deve mostrar estado vazio se receitas e despesas forem zero', async () => {
    api.get.mockImplementation((url) => {
        if (url.includes('/transactions/summary')) {
            return Promise.resolve({ data: mockBalanceamentoEmptyResponse });
        }
        if (url.includes('/transactions/spending_by_category')) {
            return Promise.resolve({ data: [] });
        }
        return Promise.reject(new Error('Rota não mockada'));
    });

    renderPage();

    // Espera que o componente termine de carregar (o valor 0,00)
    await screen.findByText('R$ 0,00'); 
    
    // Espera a mensagem de estado vazio
    await waitFor(() => {
      expect(screen.getByText('Nenhuma transação no período')).toBeInTheDocument();
    });
  });
});

// ---

describe('2. Fluxo de Filtros de Período', () => {

  beforeEach(() => {
    api.get.mockImplementation((url) => {
        if (url.includes('/transactions/summary')) {
            return Promise.resolve({ data: mockSummary });
        }
        if (url.includes('/transactions/spending_by_category')) {
            return Promise.resolve({ data: mockSpending });
        }
        return Promise.reject(new Error('Rota não mockada'));
    });
    api.get.mockClear(); 
  });

  test('deve chamar o endpoint correto ao filtrar por "Todos os Períodos"', async () => {
    renderPage();
    await screen.findByText('R$ 3.000,00'); 
    
    userEvent.click(screen.getByRole('button', { name: /Todos os Períodos/i }));

    await waitFor(() => {
        const calls = api.get.mock.calls;
        const lastSummaryCall = calls[calls.length - 2];

        // Chamadas de All Time
        expect(lastSummaryCall[0]).toBe('/transactions/summary'); 
        expect(lastSummaryCall[1]).toBeUndefined();
    });
  });

  test('deve chamar o endpoint com data inicial e final para "Última Semana"', async () => {
    renderPage();
    await screen.findByText('R$ 3.000,00'); 
    
    // Interage e avança o tempo para disparar o useEffect
    await act(async () => {
        userEvent.click(screen.getByRole('button', { name: /Última Semana/i }));
    });
    
    jest.advanceTimersByTime(100);

    await waitFor(() => {
        const calls = api.get.mock.calls;
        const lastSummaryCall = calls[calls.length - 2];
        
        // Verifica se a rota 'summary_by_period' foi usada e as datas (2025-11-09 a 2025-11-15)
        expect(lastSummaryCall[0]).toBe('/transactions/summary_by_period');
        expect(lastSummaryCall[1].params.startDate).toBe('2025-11-09');
        expect(lastSummaryCall[1].params.endDate).toBe('2025-11-15');
    });
  });
});