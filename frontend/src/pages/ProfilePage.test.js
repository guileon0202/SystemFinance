import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ProfilePage from './ProfilePage';
import api from '../services/api';
import { ToastContainer, toast } from 'react-toastify'; 

// --- MOCKS GLOBAIS ---
jest.mock('../services/api');
toast.success = jest.fn();
toast.error = jest.fn();

// Mocka o Header (Componente filho)
jest.mock('../components/Header', () => ({ user }) => (
  <header><span>Logado como: {user.email}</span></header>
));

// MOCK LOCALSTORAGE
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
const mockUser = { id: 1, nome: 'Guilherme', email: 'gui@email.com' };
const mockProfileResponse = {
  nome: 'Guilherme Souza',
  email: 'guilherme.souza@corp.com'
};

// --- FUNÇÃO HELPER DE RENDERIZAÇÃO ---
const renderProfilePage = (initialUser = mockUser) => {
  if (initialUser) {
    localStorage.setItem('user', JSON.stringify(initialUser));
  } else {
    localStorage.clear();
  }

  return render(
    <MemoryRouter initialEntries={['/perfil']}>
      <ToastContainer />
      <Routes>
        <Route path="/perfil" element={<ProfilePage />} />
        <Route path="/login" element={<div>Página de Login</div>} />
      </Routes>
    </MemoryRouter>
  );
};

// --- LIMPEZA ---
beforeEach(() => {
  jest.resetAllMocks();
  
  let store = {};
  localStorageMock.getItem.mockImplementation((key) => store[key] || null);
  localStorageMock.setItem.mockImplementation((key, value) => { store[key] = value.toString(); });
  localStorageMock.clear.mockImplementation(() => { store = {}; });

  toast.success.mockClear();
  toast.error.mockClear();
});

// --- TESTES ---

describe('1. Fluxo de Autenticação e Carregamento de Dados', () => {
  
  test('deve redirecionar para /login se não houver usuário logado', async () => {
    act(() => {
        renderProfilePage(null); 
    });
    
    expect(await screen.findByText('Página de Login')).toBeInTheDocument();
  });

  test('deve exibir os dados do perfil após o carregamento', async () => {
    api.get.mockResolvedValue({ data: mockProfileResponse });

    act(() => {
        renderProfilePage();
    });

    await waitFor(() => {
      expect(screen.getByText('Guilherme Souza')).toBeInTheDocument();
    });

    expect(screen.getByText('guilherme.souza@corp.com')).toBeInTheDocument();
    expect(api.get).toHaveBeenCalledWith('/users/profile');
  });

  test('deve mostrar erro se o fetch do perfil falhar', async () => {
    api.get.mockRejectedValue({
      response: { data: { message: 'Falha na busca' } }
    });
    
    act(() => {
        renderProfilePage();
    });

    expect(await screen.findByText(/Não foi possível carregar os dados do perfil/i)).toBeInTheDocument();
    expect(toast.error).toHaveBeenCalledWith('Não foi possível carregar os dados do perfil.');
  });
});


describe('2. Fluxo de Edição do Perfil (PUT)', () => {
  
  beforeEach(() => {
    api.get.mockResolvedValue({ data: mockProfileResponse });
  });

  test('deve ativar o modo de edição ao clicar em "Editar Perfil"', async () => {
    act(() => {
        renderProfilePage();
    });
    
    await screen.findByText('Guilherme Souza');

    userEvent.click(screen.getByRole('button', { name: /Editar Perfil/i }));

    expect(screen.getByDisplayValue('Guilherme Souza')).toBeInTheDocument();
  });

  test('deve cancelar a edição e restaurar o modo read-only', async () => {
    act(() => {
        renderProfilePage();
    });
    await screen.findByText('Guilherme Souza');
    
    userEvent.click(screen.getByRole('button', { name: /Editar Perfil/i }));

    await userEvent.type(screen.getByLabelText(/Nome:/i), ' Novo');
    
    userEvent.click(screen.getByRole('button', { name: /Cancelar/i }));
    
    expect(await screen.findByText('Nome:')).toBeInTheDocument();
    expect(screen.getByText('Guilherme Souza')).toBeInTheDocument();
  });

  test('deve salvar as alterações e atualizar o localStorage/estado', async () => {
    const novoNome = 'Guilherme Atualizado';
    const novoEmail = 'novo@email.com';
    
    api.put.mockResolvedValue({
      data: { user: { nome: novoNome, email: novoEmail } }
    });

    act(() => {
        renderProfilePage();
    });
    await screen.findByText('Guilherme Souza');

    userEvent.click(screen.getByRole('button', { name: /Editar Perfil/i }));

    await userEvent.clear(screen.getByLabelText(/Nome:/i));
    await userEvent.type(screen.getByLabelText(/Nome:/i), novoNome);
    await userEvent.clear(screen.getByLabelText(/E-mail:/i));
    await userEvent.type(screen.getByLabelText(/E-mail:/i), novoEmail);
    
    userEvent.click(screen.getByRole('button', { name: /Salvar Alterações/i }));

    await waitFor(() => {
      expect(api.put).toHaveBeenCalledWith('/users/profile', {
        nome: novoNome,
        email: novoEmail
      });
    });

    expect(await screen.findByText(novoNome)).toBeInTheDocument();
    expect(screen.getByText(novoEmail)).toBeInTheDocument();
    expect(localStorage.setItem).toHaveBeenCalledWith('user', JSON.stringify({ nome: novoNome, email: novoEmail }));
    expect(toast.success).toHaveBeenCalledWith('Perfil atualizado com sucesso!');
  });
});


describe('3. Fluxo de Alteração de Senha (PUT)', () => {

  test('deve mostrar erro se Nova Senha e Confirmação não coincidirem', async () => {
    api.get.mockResolvedValue({ data: mockProfileResponse });
    
    act(() => {
        renderProfilePage();
    });
    await screen.findByText('Guilherme Souza'); 
    
    const senhaAtual = screen.getByLabelText(/Senha Atual/i);
    const novaSenhaInput = screen.getByLabelText(/^Nova Senha$/i); 
    const confirmarSenhaInput = screen.getByLabelText(/^Confirmar Nova Senha$/i); 
    const submitButton = screen.getByRole('button', { name: /Alterar Senha/i });

    await userEvent.type(senhaAtual, 'senhaAntigaCerta');
    await userEvent.type(novaSenhaInput, 'nova123');
    await userEvent.type(confirmarSenhaInput, 'nova321');

    userEvent.click(submitButton);

    await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('As novas senhas não coincidem.');
    });
    
    expect(api.put).not.toHaveBeenCalled();
  });

  test('deve alterar a senha com sucesso e limpar os campos', async () => {
    api.get.mockResolvedValue({ data: mockProfileResponse });
    api.put.mockResolvedValue({ data: { message: 'Senha alterada' } });
    
    act(() => {
        renderProfilePage();
    });
    await screen.findByText('Guilherme Souza');

    const senhaAtual = screen.getByLabelText(/Senha Atual/i);
    const novaSenhaInput = screen.getByLabelText(/^Nova Senha$/i);
    const confirmarSenhaInput = screen.getByLabelText(/^Confirmar Nova Senha$/i);
    const submitButton = screen.getByRole('button', { name: /Alterar Senha/i });

    await userEvent.type(senhaAtual, 'senhaantiga');
    await userEvent.type(novaSenhaInput, 'nova_senha_forte');
    await userEvent.type(confirmarSenhaInput, 'nova_senha_forte');

    userEvent.click(submitButton);

    await waitFor(() => {
      expect(api.put).toHaveBeenCalledWith('/users/change-password', {
        senhaAntiga: 'senhaantiga',
        novaSenha: 'nova_senha_forte',
      });
    });

    expect(toast.success).toHaveBeenCalledWith('Senha alterada com sucesso!');

    await waitFor(() => {
        expect(senhaAtual).toHaveValue('');
        expect(novaSenhaInput).toHaveValue('');
        expect(confirmarSenhaInput).toHaveValue('');
    });
  });
});