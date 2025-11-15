import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import Dashboard from './Dashboard';
import api from '../services/api';
import { ToastContainer, toast } from 'react-toastify';

// MOCKS
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

// MOCK DE DADOS
const mockUser = { id: 1, nome: 'Usuário Teste' };
const mockSummary = {
  saldo: 500.50,
  total_receitas: 1500.50,
  total_despesas: 1000.00
};
const mockTransactions = [
  { id: 1, descricao: 'Salário', valor: 1500.50, tipo: 'receita' },
  { id: 2, descricao: 'Aluguel', valor: 1000.00, tipo: 'despesa' }
];

// FUNÇÃO HELPER DE RENDERIZAÇÃO
const renderDashboard = (initialRoute = '/dashboard') => {
  render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <ToastContainer />
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/login" element={<div>Página de Login</div>} />
        <Route path="/transactions" element={<div>Página de Transações</div>} />
        <Route path="/balanceamento" element={<div>Página de Balanceamento</div>} />
      </Routes>
    </MemoryRouter>
  );
};

// LIMPAR MOCKS
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


// ---TESTES---

test('deve redirecionar para /login se não houver usuário no localStorage', async () => {
  renderDashboard();
  expect(await screen.findByText('Página de Login')).toBeInTheDocument();
});

test('deve buscar e exibir o sumário e as transações com sucesso', async () => {
  localStorage.setItem('user', JSON.stringify(mockUser));
  
  api.get.mockImplementation((url) => {
    if (url === '/transactions') {
      return Promise.resolve({ data: { transactions: mockTransactions } });
    }
    if (url === '/transactions/summary') {
      return Promise.resolve({ data: mockSummary });
    }
    return Promise.reject(new Error('Rota não mockada'));
  });

  renderDashboard();

  expect(screen.getByText(/Carregando transações.../i)).toBeInTheDocument();
  expect(await screen.findByText('R$ 500,50')).toBeInTheDocument(); 
  expect(screen.getByText('R$ 1.000,00')).toBeInTheDocument(); 
  expect(screen.getByText('R$ 1.500,50')).toBeInTheDocument(); 
  expect(screen.getByText('Salário')).toBeInTheDocument();
  expect(screen.getByText('Aluguel')).toBeInTheDocument();
  expect(screen.getByText('+ R$ 1.500,50')).toBeInTheDocument();
  expect(screen.getByText('- R$ 1.000,00')).toBeInTheDocument();
  expect(screen.getByText('Olá, Usuário Teste')).toBeInTheDocument();
});

test('deve mostrar mensagem de erro se a API falhar', async () => {
  localStorage.setItem('user', JSON.stringify(mockUser));
  api.get.mockRejectedValue(new Error('Erro de API'));
  renderDashboard();
  expect(await screen.findByText(/Erro ao carregar transações/i)).toBeInTheDocument();
  expect(toast.error).toHaveBeenCalledWith('Não foi possível carregar os dados do seu dashboard.');
});

test('deve mostrar mensagem de "nenhuma transação" se a API retornar lista vazia', async () => {
  localStorage.setItem('user', JSON.stringify(mockUser));
  api.get.mockImplementation((url) => {
    if (url === '/transactions') {
      return Promise.resolve({ data: { transactions: [] } });
    }
    if (url === '/transactions/summary') {
      return Promise.resolve({ data: mockSummary });
    }
  });
  renderDashboard();
  expect(await screen.findByText(/Nenhuma transação registrada ainda/i)).toBeInTheDocument();
});

test('deve chamar o logout e redirecionar ao clicar em "Sair"', async () => {
  localStorage.setItem('user', JSON.stringify(mockUser));
  api.get.mockResolvedValueOnce({ data: { transactions: [] } });
  api.get.mockResolvedValueOnce({ data: mockSummary });
  
  renderDashboard();
  const logoutButton = await screen.findByRole('button', { name: /Sair/i });
  userEvent.click(logoutButton);
  expect(localStorage.clear).toHaveBeenCalled();
  expect(await screen.findByText('Página de Login')).toBeInTheDocument();
});

test('deve abrir o modal de edição ao clicar no botão de editar', async () => {
  localStorage.setItem('user', JSON.stringify(mockUser));
  api.get.mockResolvedValueOnce({ data: { transactions: mockTransactions } });
  api.get.mockResolvedValueOnce({ data: mockSummary });
  renderDashboard();
  const editButton = (await screen.findAllByText('✏️'))[0];
  expect(screen.queryByTestId('edit-modal')).not.toBeInTheDocument();
  userEvent.click(editButton);
  expect(screen.getByTestId('edit-modal')).toBeInTheDocument();
});

test('deve chamar a API de delete ao confirmar a exclusão no toast', async () => {
  localStorage.setItem('user', JSON.stringify(mockUser));
  
  api.get.mockImplementation((url) => {
    if (url === '/transactions') {
      return Promise.resolve({ data: { transactions: mockTransactions } });
    }
    if (url === '/transactions/summary') {
      return Promise.resolve({ data: mockSummary });
    }
    return Promise.reject(new Error('Rota não mockada'));
  });
  
  api.delete.mockResolvedValue({});

  renderDashboard();

  const deleteButton = (await screen.findAllByText('🗑️'))[0];
  userEvent.click(deleteButton);
  
  const confirmButton = await screen.findByText('Sim');
  userEvent.click(confirmButton);
  
  await waitFor(() => {
    expect(api.delete).toHaveBeenCalledWith('/transactions/1');});
  expect(toast.success).toHaveBeenCalledWith('Transação apagada com sucesso!');
  expect(api.get).toHaveBeenCalledTimes(4); 
});