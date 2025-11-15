import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route} from 'react-router-dom';
import TransactionsPage from './TransactionsPage';
import api from '../services/api';
import { ToastContainer, toast } from 'react-toastify';

// 1. MOCKAR MÓDULOS EXTERNOS
jest.mock('../services/api');

jest.mock('../components/Header', () => ({ user, handleLogout }) => (
  <header>
    <span>Olá, {user.nome}</span>
    <button onClick={handleLogout}>Sair</button>
  </header>
));
jest.mock('../components/EditTransactionModal', () => ({ isOpen }) => (
  isOpen ? <div data-testid="edit-modal">Modal de Edição Aberto</div> : null
));

// 2. MOCKAR O LOCALSTORAGE
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: jest.fn(),
    setItem: jest.fn(),
    clear: jest.fn(),
    removeItem: jest.fn(),
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// 3. MOCK DE DADOS
const mockUser = { id: 1, nome: 'Usuário Teste' };
const mockTransactions = [
  { id: 1, descricao: 'Salário', valor: 3000, tipo: 'receita', data: '2025-10-01' },
  { id: 2, descricao: 'Aluguel', valor: 1200, tipo: 'despesa', data: '2025-10-05' },
  { id: 3, descricao: 'Supermercado', valor: 500, tipo: 'despesa', data: '2025-10-10' },
];
const mockPagination = {
  currentPage: 1,
  totalPages: 1,
  totalItems: 3,
};

// 4. FUNÇÃO HELPER DE RENDERIZAÇÃO
const renderTransactionsPage = (initialEntries = ['/transactions']) => {
  render(
    <MemoryRouter initialEntries={initialEntries}>
      <ToastContainer /> 
      <Routes>
        <Route path="/transactions" element={<TransactionsPage />} />
        <Route path="/login" element={<div>Página de Login</div>} />
      </Routes>
    </MemoryRouter>
  );
};

// 5. LIMPAR MOCKS ANTES DE CADA TESTE
beforeEach(() => {
  jest.resetAllMocks(); 
  
  let store = {};
  localStorageMock.getItem.mockImplementation((key) => store[key] || null);
  localStorageMock.setItem.mockImplementation((key, value) => {
    store[key] = value.toString();
  });
  localStorageMock.clear.mockImplementation(() => {
    store = {};
  });
  localStorageMock.removeItem.mockImplementation((key) => {
    delete store[key];
  });

  toast.success = jest.fn();
  toast.error = jest.fn();
});


// --- TESTES ---

test('deve redirecionar para /login se não houver usuário', async () => {
  renderTransactionsPage();
  expect(await screen.findByText('Página de Login')).toBeInTheDocument();
});

test('deve carregar e exibir a lista de transações na aba "Ver Transações"', async () => {
  localStorage.setItem('user', JSON.stringify(mockUser));
  
  api.get.mockResolvedValue({
    data: { transactions: mockTransactions, ...mockPagination }
  });

  renderTransactionsPage();
  expect(screen.getByText(/Carregando.../i)).toBeInTheDocument();
  expect(await screen.findByText('Salário')).toBeInTheDocument();
  expect(screen.getByText('Aluguel')).toBeInTheDocument();
  expect(screen.getByText('Supermercado')).toBeInTheDocument();
  expect(api.get).toHaveBeenCalledWith('/transactions', {
    params: { page: 1, limit: 10 } 
  });
});

test('deve mudar para a aba "Adicionar Transação" e mostrar o formulário', async () => {
  localStorage.setItem('user', JSON.stringify(mockUser));
  api.get.mockResolvedValue({ data: { transactions: [], ...mockPagination } });
  
  renderTransactionsPage();

  await screen.findByText(/Filtrar por tipo/i);
  userEvent.click(screen.getByRole('button', { name: /Adicionar Transação/i }));

  expect(await screen.findByLabelText(/Descrição/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/Valor \(R\$\)/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/Data/i)).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /Salvar Transação/i })).toBeInTheDocument();
});

test('deve registrar uma nova transação com sucesso', async () => {
  localStorage.setItem('user', JSON.stringify(mockUser));
  
  api.post.mockResolvedValue({ data: { message: 'Sucesso' } });
  api.get.mockResolvedValue({ data: { transactions: [], ...mockPagination } });

  renderTransactionsPage();
  await screen.findByText(/Filtrar por tipo/i); 

  userEvent.click(screen.getByRole('button', { name: /Adicionar Transação/i }));
  
  await userEvent.type(await screen.findByLabelText(/Descrição/i), 'Freelance');
  await userEvent.type(screen.getByLabelText(/Valor \(R\$\)/i), '500');
  userEvent.click(screen.getByRole('button', { name: /Entrada/i })); 
  
  userEvent.click(screen.getByRole('button', { name: /Salvar Transação/i }));

  await waitFor(() => {
    expect(api.post).toHaveBeenCalledWith('/transactions', {
      descricao: 'Freelance',
      valor: 500, 
      tipo: 'receita',
      data: expect.any(String),
      categoria: 'Alimentação'
    });
  });

  expect(toast.success).toHaveBeenCalledWith('Transação registrada com sucesso!');
  expect(await screen.findByText(/Filtrar por tipo/i)).toBeInTheDocument();
});

test('deve mostrar erro de validação se o valor for zero', async () => {
  localStorage.setItem('user', JSON.stringify(mockUser));
  api.get.mockResolvedValue({ data: { transactions: [], ...mockPagination } });
  
  renderTransactionsPage();
  await screen.findByText(/Filtrar por tipo/i);

  userEvent.click(screen.getByRole('button', { name: /Adicionar Transação/i }));

  await userEvent.type(await screen.findByLabelText(/Descrição/i), 'Item Grátis');
  await userEvent.type(screen.getByLabelText(/Valor \(R\$\)/i), '0');

  userEvent.click(screen.getByRole('button', { name: /Salvar Transação/i }));

  expect(api.post).not.toHaveBeenCalled();
  expect(toast.error).toHaveBeenCalledWith('O valor da transação deve ser maior que zero.');
});

test('deve filtrar a lista ao mudar o select de filtro', async () => {
  localStorage.setItem('user', JSON.stringify(mockUser));
  
  api.get.mockResolvedValueOnce({
    data: { transactions: mockTransactions, ...mockPagination }
  });
  
  api.get.mockResolvedValueOnce({
    data: { transactions: [mockTransactions[0]],
            currentPage: 1, totalPages: 1, totalItems: 1 
          }
  });

  renderTransactionsPage();

  expect(await screen.findByText('Aluguel')).toBeInTheDocument();

  const filterSelect = screen.getByLabelText(/Filtrar por tipo/i);
  userEvent.selectOptions(filterSelect, 'receita');

  await waitFor(() => {
    expect(api.get).toHaveBeenCalledWith('/transactions', {
      params: { page: 1, limit: 10, tipo: 'receita' }
    });
  });

  expect(await screen.findByText('Salário')).toBeInTheDocument();
  expect(screen.queryByText('Aluguel')).not.toBeInTheDocument();
});

test('deve chamar a API de delete ao confirmar a exclusão', async () => {
  localStorage.setItem('user', JSON.stringify(mockUser));
  
  api.get.mockImplementation((url) => {
    if (url === '/transactions') {
      return Promise.resolve({ data: { transactions: mockTransactions, ...mockPagination } });
    }
  });
  
  api.delete.mockResolvedValue({});

  renderTransactionsPage();

  const deleteButton = (await screen.findAllByText('🗑️'))[0];
  userEvent.click(deleteButton);
  
  const confirmButton = await screen.findByText('Sim');
  userEvent.click(confirmButton);
  
  await waitFor(() => {
  expect(api.delete).toHaveBeenCalledWith('/transactions/1');});
  expect(toast.success).toHaveBeenCalledWith('Transação apagada com sucesso!');
  expect(api.get).toHaveBeenCalledTimes(2);
});