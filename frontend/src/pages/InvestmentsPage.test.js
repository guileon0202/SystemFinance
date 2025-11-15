import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react'; 
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import InvestmentsPage from './InvestmentsPage';
import api from '../services/api'; 
import { ToastContainer, toast } from 'react-toastify'; 

// --- MOCKS GLOBAIS ---
jest.mock('../services/api', () => ({ get: jest.fn() }));
toast.error = jest.fn();

// Mock Header
jest.mock('../components/Header', () => ({ user, handleLogout }) => (
  <header>
    <span>Logado como: {user.email}</span>
    <button onClick={handleLogout}>Sair</button>
  </header>
));

// MOCK LOCALSTORAGE (Padrão)
const mockUser = { id: 1, email: 'gui@corp.com' };
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
const mockQuoteSuccess = {
  symbol: 'PETR4',
  longName: 'Petróleo Brasileiro S.A. - Petrobras',
  regularMarketPrice: 30.50,
  regularMarketChange: 0.45,
  regularMarketChangePercent: 1.50,
  regularMarketVolume: 1000000,
  marketState: 'REGULAR',
  logourl: 'https://logo.com/petr4.png'
};

// --- FUNÇÃO HELPER DE RENDERIZAÇÃO ---
const renderPage = (initialUser = mockUser) => {
  if (initialUser) {
    localStorage.setItem('user', JSON.stringify(initialUser));
  } else {
    localStorage.clear();
  }

  return render(
    <MemoryRouter initialEntries={['/investimentos']}>
      <ToastContainer />
      <Routes>
        <Route path="/investimentos" element={<InvestmentsPage />} />
        <Route path="/login" element={<div>Página de Login</div>} />
      </Routes>
    </MemoryRouter>
  );
};

// --- LIMPEZA ---
beforeEach(() => {
  jest.resetAllMocks();
  localStorage.clear();
  // Garante que o usuário logado seja retornado para a maioria dos testes
  localStorageMock.getItem.mockImplementation((key) => {
    if (key === 'user') return JSON.stringify(mockUser);
    return null;
  });
  const api = require('../services/api');
  api.get.mockClear(); 
  toast.error.mockClear();
});

// --- OS TESTES ---

describe('1. Fluxo de Autenticação e Renderização', () => {
  
  test('1. deve redirecionar para /login se não houver usuário logado', async () => {
    localStorage.clear();
    
    // CORREÇÃO: Removemos o act para evitar o bloqueio da navegação do useEffect
    renderPage(null);
    
    // O await findByText cuida da assincronia do navigate()
    expect(await screen.findByText('Página de Login')).toBeInTheDocument();
  });

  test('2. deve renderizar o formulário de busca e o botão Buscar', () => {
    renderPage();
    
    expect(screen.getByRole('heading', { name: /Mercado de Ações/i })).toBeInTheDocument(); 
    expect(screen.getByRole('button', { name: 'Buscar' })).toBeInTheDocument();
  });
});

describe('2. Fluxo de Busca e Resultados', () => {

  test('3. deve buscar a cotação e exibir os dados com sucesso', async () => {
    const api = require('../services/api');
    api.get.mockResolvedValue({ data: mockQuoteSuccess });

    renderPage();
    
    const tickerInput = screen.getByLabelText(/Digite o Ticker do Ativo/i);
    const searchButton = screen.getByRole('button', { name: /Buscar/i });

    await userEvent.type(tickerInput, 'petr4');
    userEvent.click(searchButton);

    expect(screen.getByRole('button', { name: /Buscando.../i })).toBeDisabled();

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith('/investments/quote/PETR4');
    });

    // CORREÇÃO: Procura a string literal '1.50%'
    expect(await screen.findByText('R$ 30,50')).toBeInTheDocument();
    expect(screen.getByText('PETR4')).toBeInTheDocument();
    expect(screen.getByText('1.50%')).toBeInTheDocument(); // <<< CORREÇÃO DE FORMATAÇÃO FINAL
    expect(screen.getByText(/Aberto/i)).toBeInTheDocument(); 
    expect(screen.getByRole('button', { name: 'Buscar' })).toBeEnabled();
  });

  test('4. deve mostrar toast de erro se a busca na API falhar', async () => {
    const api = require('../services/api');
    const errorMessage = 'Ativo não listado ou inválido.';
    
    api.get.mockRejectedValue({
      response: { data: { message: errorMessage } }
    });

    renderPage();
    
    const tickerInput = screen.getByLabelText(/Digite o Ticker do Ativo/i);
    const searchButton = screen.getByRole('button', { name: /Buscar/i });
    
    await userEvent.type(tickerInput, 'ASDF');
    userEvent.click(searchButton);
    
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(errorMessage);
    });

    expect(screen.getByRole('button', { name: /Buscar/i })).toBeEnabled();
  });

  test('5. não deve buscar se o campo Ticker estiver vazio', async () => {
    const api = require('../services/api');
    renderPage();
    
    const searchButton = screen.getByRole('button', { name: /Buscar/i });
    
    userEvent.click(searchButton);

    await waitFor(() => {
      expect(api.get).not.toHaveBeenCalled();
    }, { timeout: 100 }); 
  });
});