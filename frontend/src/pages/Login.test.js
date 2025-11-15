import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import Login from './Login';
import api from '../services/api';

// 1. Mockar o módulo da API
jest.mock('../services/api');

// 2. Mockar o localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: jest.fn((key) => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = value.toString();
    }),
    clear: jest.fn(() => {
      store = {};
    }),
    removeItem: jest.fn((key) => {
      delete store[key];
    }),
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// 3. Criar um componente "falso" de Dashboard para testar o redirecionamento
const MockDashboard = () => <div>Bem-vindo ao Dashboard</div>;

// 4. Criar uma função helper para renderizar o Login com o Router
const renderLogin = (locationState = null) => {
  const initialEntries = [{
    pathname: '/login',
    state: locationState
  }];

  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<MockDashboard />} />
        <Route path="/register" element={<div>Página de Cadastro</div>} />
        <Route path="/esqueci-senha" element={<div>Esqueci Senha</div>} />
        <Route path="/" element={<div>HomePage</div>} />
      </Routes>
    </MemoryRouter>
  );
};

// 5. Limpar os mocks antes de cada teste
beforeEach(() => {
  jest.resetAllMocks(); 
  localStorageMock.clear();
});


// --- OS TESTES ---

test('deve renderizar os campos e o botão de login', () => {
  renderLogin();
  expect(screen.getByLabelText(/E-mail/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/Senha/i)).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /Entrar/i })).toBeInTheDocument();
});

test('deve permitir que o usuário digite email e senha', async () => {
  renderLogin();

  const emailInput = screen.getByLabelText(/E-mail/i);
  const passwordInput = screen.getByLabelText(/Senha/i);

  await userEvent.type(emailInput, 'teste@email.com');
  await userEvent.type(passwordInput, '123456');

  expect(emailInput).toHaveValue('teste@email.com');
  expect(passwordInput).toHaveValue('123456');
});

test('deve navegar para /dashboard em um login bem-sucedido', async () => {
  const mockUserData = { id: 1, nome: 'Usuário Teste' };
  const mockToken = 'fake.token.123';
  
  // Define o mock de SUCESSO (agora não vaza mais)
  api.post.mockResolvedValue({
    data: {
      token: mockToken,
      user: mockUserData
    }
  });

  renderLogin();

  await userEvent.type(screen.getByLabelText(/E-mail/i), 'teste@email.com');
  await userEvent.type(screen.getByLabelText(/Senha/i), 'senha123');
  userEvent.click(screen.getByRole('button', { name: /Entrar/i }));

  await waitFor(() => {
    expect(api.post).toHaveBeenCalledWith('/users/login', {
      email: 'teste@email.com',
      senha: 'senha123',
    });
  });

  expect(localStorage.setItem).toHaveBeenCalledWith('token', mockToken);
  expect(localStorage.setItem).toHaveBeenCalledWith('user', JSON.stringify(mockUserData));
  
  // Agora ele deve encontrar o texto do Dashboard
  expect(await screen.findByText(/Bem-vindo ao Dashboard/i)).toBeInTheDocument();
});

test('deve mostrar uma mensagem de erro em um login malsucedido', async () => {
  const errorMessage = 'Credenciais inválidas';
  
  // Define o mock de ERRO (agora não vaza mais)
  api.post.mockRejectedValue({
    response: {
      data: { message: errorMessage }
    }
  });

  renderLogin();

  await userEvent.type(screen.getByLabelText(/E-mail/i), 'errado@email.com');
  await userEvent.type(screen.getByLabelText(/Senha/i), 'senhaerrada');
  userEvent.click(screen.getByRole('button', { name: /Entrar/i }));

  expect(await screen.findByText(errorMessage)).toBeInTheDocument();
  expect(localStorage.setItem).not.toHaveBeenCalled();
  expect(screen.queryByText(/Bem-vindo ao Dashboard/i)).not.toBeInTheDocument();
});

test('deve alternar a visibilidade da senha', () => {
  renderLogin();

  const passwordInput = screen.getByLabelText(/Senha/i);
  const toggleButton = screen.getByText('👁️');

  expect(passwordInput).toHaveAttribute('type', 'password');

  userEvent.click(toggleButton);
  expect(passwordInput).toHaveAttribute('type', 'text');
  expect(screen.getByText('🙈')).toBeInTheDocument();

  userEvent.click(toggleButton);
  expect(passwordInput).toHaveAttribute('type', 'password');
  expect(screen.getByText('👁️')).toBeInTheDocument();
});

test('deve mostrar mensagem de sucesso vinda do location.state', () => {
  const successMessage = 'Cadastro realizado com sucesso!';
  
  renderLogin({ message: successMessage });

  expect(screen.getByText(successMessage)).toBeInTheDocument();
});