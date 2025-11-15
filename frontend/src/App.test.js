import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from './App';

// Teste 1: Verifica se a rota /login renderiza o componente Login
test('deve renderizar a página de login na rota /login', () => {
  render(
    <MemoryRouter initialEntries={['/login']}>
      <App />
    </MemoryRouter>
  );

  const loginElement = screen.getByText(/E-mail/i);
  expect(loginElement).toBeInTheDocument();
});

// Teste 2: Verifica se a rota /register renderiza o componente Register
test('deve renderizar a HomePage na rota /', () => {
  render(
    <MemoryRouter initialEntries={['/']}>
      <App />
    </MemoryRouter>
  );

  const homeElement = screen.getByRole('heading', {
    level: 1,
    name: /Controle suas finanças com facilidade/i
  });

  expect(homeElement).toBeInTheDocument();
});