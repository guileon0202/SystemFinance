import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ResetPasswordPage from './ResetPasswordPage';
import api from '../services/api';

// 1. Mockar a API
jest.mock('../services/api');

// 2. Usar Timers Falsos para controlar o setTimeout
jest.useFakeTimers();
const MockLogin = () => <div>Página de Login</div>;

// 3. Função Helper que INJETA o token na rota
const renderPage = (initialToken = 'fake-token-123') => {
  render(
    <MemoryRouter initialEntries={[`/redefinir-senha/${initialToken}`]}>
      <Routes>
        <Route path="/redefinir-senha/:token" element={<ResetPasswordPage />} />
        <Route path="/login" element={<MockLogin />} />
      </Routes>
    </MemoryRouter>
  );
};

// 4. Limpar mocks antes de cada teste
beforeEach(() => {
  jest.resetAllMocks();
});

// --- OS TESTES ---

test('deve renderizar o formulário e o título corretamente', () => {
  renderPage();
  
  expect(screen.getByRole('heading', { name: /Crie sua Nova Senha/i })).toBeInTheDocument();
  expect(screen.getByLabelText(/^Nova Senha$/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/^Confirmar Nova Senha$/i)).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /Redefinir Senha/i })).toBeInTheDocument();
});

test('deve mostrar erro se as senhas não coincidirem e não chamar a API', async () => {
  renderPage();

  const newPasswordInput = screen.getByLabelText(/^Nova Senha$/i); 
  const confirmPasswordInput = screen.getByLabelText(/^Confirmar Nova Senha$/i); 
  const submitButton = screen.getByRole('button', { name: /Redefinir Senha/i });

  await userEvent.type(newPasswordInput, 'senhaforte123');
  await userEvent.type(confirmPasswordInput, 'senhaerrada');

  userEvent.click(submitButton);

  expect(await screen.findByText('As senhas não coincidem!')).toBeInTheDocument();
  
  expect(api.post).not.toHaveBeenCalled();
});

test('deve redefinir a senha com sucesso, mostrar mensagem e redirecionar', async () => {
  const successMessage = 'Senha redefinida com sucesso!';
  api.post.mockResolvedValue({ data: { message: successMessage } });
  
  const tokenParaTeste = 'valid-reset-token'; 
  renderPage(tokenParaTeste); 

  const newPasswordInput = screen.getByLabelText(/^Nova Senha$/i);
  const confirmPasswordInput = screen.getByLabelText(/^Confirmar Nova Senha$/i);
  const submitButton = screen.getByRole('button', { name: /Redefinir Senha/i });

  await userEvent.type(newPasswordInput, 'novaSenhaSecreta');
  await userEvent.type(confirmPasswordInput, 'novaSenhaSecreta');

  await act(async () => {
    userEvent.click(submitButton);
  });

  await waitFor(() => {
    expect(api.post).toHaveBeenCalledWith('/users/reset-password', {
      token: tokenParaTeste,
      newPassword: 'novaSenhaSecreta',
    });
  });

  expect(await screen.findByText(/Senha redefinida com sucesso!/i)).toBeInTheDocument();
  
  act(() => {
    jest.advanceTimersByTime(5000); 
  });
  
  expect(screen.getByText('Página de Login')).toBeInTheDocument();
});

test('deve mostrar erro da API se o token for inválido/expirado', async () => {
  const errorMessage = 'O link expirou ou é inválido.';
  api.post.mockRejectedValue({
    response: { data: { message: errorMessage } }
  });
  
  renderPage('expired-token');

  const newPasswordInput = screen.getByLabelText(/^Nova Senha$/i); 
  const confirmPasswordInput = screen.getByLabelText(/^Confirmar Nova Senha$/i); 
  const submitButton = screen.getByRole('button', { name: /Redefinir Senha/i });

  await userEvent.type(newPasswordInput, 'qwertY123');
  await userEvent.type(confirmPasswordInput, 'qwertY123');
  
  await act(async () => {
    userEvent.click(submitButton);
  });

  await waitFor(() => {
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });
  
  expect(screen.getByLabelText(/^Nova Senha$/i)).toBeInTheDocument();
});