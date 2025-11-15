// Arquivo: frontend/src/pages/Register.test.js

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom';
import Register from './Register';
import api from '../services/api';

// 1. Mockar o módulo da API
jest.mock('../services/api');

// 2. Criar um componente "falso" de Login para testar o redirecionamento
const MockLogin = () => {
  const location = useLocation();
  return (
    <div>
      <h2>Página de Login</h2>
      {location.state?.message && (
        <p data-testid="success-message">{location.state.message}</p>
      )}
    </div>
  );
};

// 3. Função helper para renderizar o componente com o Router
const renderRegister = () => {
  render(
    <MemoryRouter initialEntries={['/register']}>
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<MockLogin />} />
        {/* Adicione outras rotas que o Register usa (termos, etc.) */}
        <Route path="/termos-de-uso" element={<div>Termos de Uso</div>} />
        <Route path="/politica-de-privacidade" element={<div>Política de Privacidade</div>} />
      </Routes>
    </MemoryRouter>
  );
};

// 4. Limpar os mocks antes de cada teste
beforeEach(() => {
  jest.resetAllMocks();
});

// --- OS TESTES ---

test('deve renderizar todos os campos e o botão desabilitado', () => {
  renderRegister();

  expect(screen.getByLabelText(/Nome completo/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/E-mail/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/^Senha$/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/Confirmar senha/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/Eu li e aceito/i)).toBeInTheDocument();
  
  expect(screen.getByRole('button', { name: /Criar conta/i })).toBeDisabled();
});

test('deve habilitar o botão de submit ao aceitar os termos', () => {
  renderRegister();
  
  const termsCheckbox = screen.getByLabelText(/Eu li e aceito/i);
  const submitButton = screen.getByRole('button', { name: /Criar conta/i });

  expect(submitButton).toBeDisabled();
  
  userEvent.click(termsCheckbox);
  
  expect(submitButton).toBeEnabled();

  userEvent.click(termsCheckbox);
  expect(submitButton).toBeDisabled();
});

test('deve mostrar erro se as senhas não coincidirem', async () => {
  renderRegister();

  await userEvent.type(screen.getByLabelText(/Nome completo/i), 'Usuário Teste');
  await userEvent.type(screen.getByLabelText(/E-mail/i), 'teste@email.com');
  await userEvent.type(screen.getByLabelText(/^Senha$/i), 'senha123');
  await userEvent.type(screen.getByLabelText(/Confirmar senha/i), 'senhaErrada');
  
  userEvent.click(screen.getByLabelText(/Eu li e aceito/i));
  userEvent.click(screen.getByRole('button', { name: /Criar conta/i }));

  expect(await screen.findByText('As senhas não coincidem!')).toBeInTheDocument();
  expect(api.post).not.toHaveBeenCalled();
});

test('deve mostrar erro se os termos não forem aceitos (mesmo se o botão for forçado)', async () => {
  renderRegister();

  await userEvent.type(screen.getByLabelText(/Nome completo/i), 'Usuário Teste');
  await userEvent.type(screen.getByLabelText(/E-mail/i), 'teste@email.com');
  await userEvent.type(screen.getByLabelText(/^Senha$/i), 'senha123');
  await userEvent.type(screen.getByLabelText(/Confirmar senha/i), 'senha123');

  const submitButton = screen.getByRole('button', { name: /Criar conta/i });
  expect(submitButton).toBeDisabled();
});

test('deve registrar com sucesso e redirecionar para /login com mensagem', async () => {
  api.post.mockResolvedValue({ data: { message: 'Usuário criado' } });
  
  renderRegister();

  await userEvent.type(screen.getByLabelText(/Nome completo/i), 'Usuário Teste');
  await userEvent.type(screen.getByLabelText(/E-mail/i), 'teste@email.com');
  await userEvent.type(screen.getByLabelText(/^Senha$/i), 'senha123');
  await userEvent.type(screen.getByLabelText(/Confirmar senha/i), 'senha123');
  
  userEvent.click(screen.getByLabelText(/Eu li e aceito/i));
  userEvent.click(screen.getByRole('button', { name: /Criar conta/i }));

  await waitFor(() => {
    expect(api.post).toHaveBeenCalledWith('/users/register', {
      nome: 'Usuário Teste',
      email: 'teste@email.com',
      senha: 'senha123',
    });
  });

  expect(await screen.findByTestId('success-message')).toHaveTextContent(
    'Conta criada com sucesso! Faça o login para continuar.'
  );
});

test('deve mostrar erro da API se o e-mail já existir', async () => {
  const errorMessage = 'Este e-mail já está em uso.';
  api.post.mockRejectedValue({
    response: { data: { message: errorMessage } }
  });

  renderRegister();

  await userEvent.type(screen.getByLabelText(/Nome completo/i), 'Usuário Teste');
  await userEvent.type(screen.getByLabelText(/E-mail/i), 'email.existente@email.com');
  await userEvent.type(screen.getByLabelText(/^Senha$/i), 'senha123');
  await userEvent.type(screen.getByLabelText(/Confirmar senha/i), 'senha123');
  
  userEvent.click(screen.getByLabelText(/Eu li e aceito/i));
  userEvent.click(screen.getByRole('button', { name: /Criar conta/i }));

  expect(await screen.findByText(errorMessage)).toBeInTheDocument();
});