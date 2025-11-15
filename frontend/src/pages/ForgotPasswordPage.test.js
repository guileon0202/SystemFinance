import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ForgotPasswordPage from './ForgotPasswordPage';
import api from '../services/api';

// 1. Mockar o módulo da API
jest.mock('../services/api');
const MockLogin = () => <div>Página de Login</div>;
const MockHome = () => <div>Página Inicial</div>;

// 3. Função helper para renderizar o componente com o Router
const renderPage = () => {
  render(
    <MemoryRouter initialEntries={['/esqueci-senha']}>
      <Routes>
        <Route path="/esqueci-senha" element={<ForgotPasswordPage />} />
        <Route path="/login" element={<MockLogin />} />
        <Route path="/" element={<MockHome />} />
      </Routes>
    </MemoryRouter>
  );
};

// 4. Limpar os mocks antes de cada teste
beforeEach(() => {
  jest.resetAllMocks();
});

// --- OS TESTES ---

test('deve renderizar o formulário de "Recuperar Senha" corretamente', () => {
  renderPage();
  
  expect(screen.getByRole('heading', { name: /Recuperar Senha/i })).toBeInTheDocument();
  expect(screen.getByLabelText(/E-mail/i)).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /Enviar link de redefinição/i })).toBeInTheDocument();
});

test('deve permitir que o usuário digite no campo de e-mail', async () => {
  renderPage();
  
  const emailInput = screen.getByLabelText(/E-mail/i);
  await userEvent.type(emailInput, 'usuario@teste.com');
  
  expect(emailInput).toHaveValue('usuario@teste.com');
});

test('deve mostrar mensagem de sucesso e esconder o formulário após o envio', async () => {
  const successMessage = 'Link de redefinição enviado com sucesso!';
  
  api.post.mockResolvedValue({ data: { message: successMessage } });
  
  renderPage();

  const emailInput = screen.getByLabelText(/E-mail/i);
  const submitButton = screen.getByRole('button', { name: /Enviar link de redefinição/i });

  // Preenche e envia o formulário
  await userEvent.type(emailInput, 'usuario@teste.com');
  userEvent.click(submitButton);

  await waitFor(() => {
    expect(api.post).toHaveBeenCalledWith('/users/forgot-password', {
      email: 'usuario@teste.com'
    });
  });

  expect(await screen.findByText(successMessage)).toBeInTheDocument();
  
  // Verifica se o formulário SUMIU (comportamento condicional !message)
  expect(screen.queryByLabelText(/E-mail/i)).not.toBeInTheDocument();
  expect(screen.queryByRole('button', { name: /Enviar link de redefinição/i })).not.toBeInTheDocument();
});

test('deve mostrar mensagem de erro se a API falhar', async () => {
  const errorMessage = 'E-mail não encontrado.';
  
  // Configura o mock da API para falha
  api.post.mockRejectedValue({
    response: { data: { message: errorMessage } }
  });
  
  renderPage();

  const emailInput = screen.getByLabelText(/E-mail/i);
  const submitButton = screen.getByRole('button', { name: /Enviar link de redefinição/i });

  // Preenche e envia
  await userEvent.type(emailInput, 'naoexiste@email.com');
  userEvent.click(submitButton);

  await waitFor(() => {
    expect(api.post).toHaveBeenCalledWith('/users/forgot-password', {
      email: 'naoexiste@email.com'
    });
  });

  expect(await screen.findByText(errorMessage)).toBeInTheDocument();
  expect(screen.getByLabelText(/E-mail/i)).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /Enviar link de redefinição/i })).toBeInTheDocument();
});