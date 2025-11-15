jest.mock('../db/db');
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');
jest.mock('crypto');
jest.mock('../services/emailService', () => ({
  sendMail: jest.fn().mockResolvedValue('E-mail enviado'),
}));

const {
  register,
  login,
  forgotPassword,
  resetPassword,
  getUserProfile,
  updateUserProfile,
  changePassword,
} = require('./userController');

const db = require('../db/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const emailTransporter = require('../services/emailService');

describe('User Controller - Testes Unitários', () => {
  let res;

  beforeEach(() => {
    jest.clearAllMocks();
    res = {
      status: jest.fn(() => res),
      json: jest.fn(),
    };
  });

  // --- Testes para a função register ---
  describe('register', () => {
    it('deve criar um novo usuário com sucesso', async () => {
      const req = { body: { nome: 'Usuário Teste', email: 'teste@email.com', senha: '123' } };
      db.query.mockResolvedValueOnce({ rows: [] }); 
      bcrypt.hash.mockResolvedValue('senhaCriptografada123');
      const mockNewUser = { id: 1, nome: 'Usuário Teste', email: 'teste@email.com' };
      db.query.mockResolvedValueOnce({ rows: [mockNewUser] });
      jwt.sign.mockReturnValue('tokenJWT123');
      
      await register(req, res);
      
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Usuário cadastrado com sucesso!',
        token: 'tokenJWT123',
        user: mockNewUser,
      });
    });

    it('deve retornar 400 se o e-mail já existir', async () => {
      const req = { body: { nome: 'Usuário Teste', email: 'jaexiste@email.com', senha: '123' } };
      db.query.mockResolvedValueOnce({ rows: [{ id: 2, email: 'jaexiste@email.com' }] });
      
      await register(req, res);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Usuário com este email já existe.' });
    });

    it('deve retornar 400 se os campos estiverem faltando', async () => {
      const req = { body: { nome: 'Usuário Teste' } };
      
      await register(req, res);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Nome, email e senha são obrigatórios.' });
    });

    it('deve retornar 500 se houver um erro no banco de dados', async () => {
      const req = { body: { nome: 'Usuário Teste', email: 'teste@email.com', senha: '123' } };
      db.query.mockRejectedValue(new Error('Erro de DB simulado'));
      
      await register(req, res);
      
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Erro interno do servidor.' });
    });
  });

  // --- Testes para a função login ---
  describe('login', () => {
    it('deve logar um usuário com sucesso', async () => {
      const mockUser = { id: 1, nome: 'Usuário Logado', email: 'login@email.com', senha: 'senhaCriptografada' };
      const req = { body: { email: 'login@email.com', senha: '123' } };
      db.query.mockResolvedValue({ rows: [mockUser] });
      bcrypt.compare.mockResolvedValue(true);
      jwt.sign.mockReturnValue('tokenDeLoginValido');
      
      await login(req, res);
      
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Login bem-sucedido!',
        token: 'tokenDeLoginValido',
        user: { id: 1, email: 'login@email.com', nome: 'Usuário Logado' },
      });
    });

    it('deve retornar 400 se o e-mail não for encontrado', async () => {
      const req = { body: { email: 'naoexiste@email.com', senha: '123' } };
      db.query.mockResolvedValue({ rows: [] });
      
      await login(req, res);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Email ou senha inválidos.' });
    });

    it('deve retornar 400 se a senha estiver incorreta', async () => {
      const mockUser = { id: 1, nome: 'Usuário Logado', email: 'login@email.com', senha: 'senhaCriptografada' };
      const req = { body: { email: 'login@email.com', senha: 'senhaErrada' } };
      db.query.mockResolvedValue({ rows: [mockUser] });
      bcrypt.compare.mockResolvedValue(false);
      
      await login(req, res);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Email ou senha inválidos.' });
    });

    it('deve retornar 500 se houver um erro no banco de dados', async () => {
      const req = { body: { email: 'login@email.com', senha: '123' } };
      db.query.mockRejectedValue(new Error('Erro de DB simulado'));
      
      await login(req, res);
      
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Erro interno do servidor.' });
    });
  });

  // --- Testes para a função forgotPassword ---
  describe('forgotPassword', () => {
    const expectedMsg = 'Se um usuário com este e-mail existir, um link de redefinição de senha foi enviado.';

    it('deve enviar um e-mail de redefinição se o usuário for encontrado', async () => {
      const mockUser = { id: 1, email: 'teste@email.com' };
      const req = { body: { email: 'teste@email.com' } };
      db.query.mockResolvedValueOnce({ rows: [mockUser] });
      crypto.randomBytes.mockReturnValue({ toString: () => 'tokenDeResetFalso123' });
      db.query.mockResolvedValueOnce({ rowCount: 1 });
      
      await forgotPassword(req, res);
      
      expect(res.status).toHaveBeenCalledWith(200);
      expect(emailTransporter.sendMail).toHaveBeenCalledTimes(1);
      expect(res.json).toHaveBeenCalledWith({ message: expectedMsg });
    });

    it('deve retornar 200 (silenciosamente) se o e-mail não for encontrado', async () => {
      const req = { body: { email: 'naoexiste@email.com' } };
      db.query.mockResolvedValue({ rows: [] });
      
      await forgotPassword(req, res);
      
      expect(res.status).toHaveBeenCalledWith(200);
      expect(emailTransporter.sendMail).not.toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({ message: expectedMsg });
    });

    it('deve retornar 500 se houver um erro no banco de dados', async () => {
      const req = { body: { email: 'teste@email.com' } };
      db.query.mockRejectedValue(new Error('Erro de DB simulado'));
      
      await forgotPassword(req, res);
      
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Erro interno do servidor, tente novamente.' });
    });
  });

  // --- Testes para a função resetPassword ---
  describe('resetPassword', () => {
    it('deve redefinir a senha com um token válido', async () => {
      const mockUser = { id: 1, email: 'teste@email.com' };
      const req = { body: { token: 'tokenValido123', newPassword: 'novaSenha' } };
      db.query.mockResolvedValueOnce({ rows: [mockUser] });
      bcrypt.hash.mockResolvedValue('novaSenhaCriptografada');
      db.query.mockResolvedValueOnce({ rowCount: 1 });
      
      await resetPassword(req, res);
      
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'Senha redefinida com sucesso!' });
    });

    it('deve retornar 400 se o token for inválido ou expirado', async () => {
      const req = { body: { token: 'tokenInvalido', newPassword: 'novaSenha' } };
      db.query.mockResolvedValue({ rows: [] });
      
      await resetPassword(req, res);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Token de redefinição inválido ou expirado.' });
    });

    it('deve retornar 500 se houver um erro no banco de dados', async () => {
      const req = { body: { token: 'tokenValido123', newPassword: 'novaSenha' } };
      db.query.mockRejectedValue(new Error('Erro de DB simulado'));
      
      await resetPassword(req, res);
      
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Erro interno do servidor.' });
    });

    it('deve retornar 400 se os campos estiverem faltando', async () => {
      const req = { body: { token: 'tokenValido123' } }; // Falta newPassword
      
      await resetPassword(req, res);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Token e nova senha são obrigatórios.' });
    });
  });

  // --- Testes para a função getUserProfile ---
  describe('getUserProfile', () => {
    it('deve retornar os dados do perfil do usuário logado', async () => {
      const mockProfile = { id: 1, nome: 'Usuário Teste', email: 'teste@email.com' };
      const req = { userId: 1 };
      db.query.mockResolvedValue({ rows: [mockProfile] });
      
      await getUserProfile(req, res);
      
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockProfile); 
    });

    it('deve retornar 404 se o usuário não for encontrado', async () => {
      const req = { userId: 999 };
      db.query.mockResolvedValue({ rows: [] });
      
      await getUserProfile(req, res);
      
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Usuário não encontrado.' });
    });

    it('deve retornar 500 se houver um erro no banco de dados', async () => {
      const req = { userId: 1 };
      db.query.mockRejectedValue(new Error('Erro de DB simulado'));
      
      await getUserProfile(req, res);
      
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Erro interno do servidor.' });
    });
  });

  // --- Testes para a função updateUserProfile ---
  describe('updateUserProfile', () => {
    it('deve atualizar o perfil do usuário com sucesso', async () => {
      const mockUpdatedUser = { id: 1, nome: 'Nome Atualizado', email: 'novo@email.com' };
      const req = { userId: 1, body: { nome: 'Nome Atualizado', email: 'novo@email.com' } };
      db.query.mockResolvedValueOnce({ rows: [] });
      db.query.mockResolvedValueOnce({ rows: [mockUpdatedUser] });
      
      await updateUserProfile(req, res);
      
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Perfil atualizado com sucesso!',
        user: mockUpdatedUser,
      });
    });

    it('deve retornar 400 se o e-mail já estiver em uso por outro usuário', async () => {
      const req = { userId: 1, body: { nome: 'Nome Atualizado', email: 'emaildeoutro@email.com' } };
      db.query.mockResolvedValueOnce({ rows: [{ id: 2 }] });
      
      await updateUserProfile(req, res);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Este e-mail já está em uso por outra conta.' });
    });

    it('deve retornar 500 se houver um erro no banco de dados', async () => {
      const req = { userId: 1, body: { nome: 'Nome Atualizado', email: 'novo@email.com' } };
      db.query.mockRejectedValue(new Error('Erro de DB simulado'));
      
      await updateUserProfile(req, res);
      
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Erro interno do servidor.' });
    });
    it('deve retornar 400 se os campos obrigatórios estiverem faltando', async () => {
    const req = { userId: 1, body: { nome: 'Nome Atualizado' } };
    // res já é mockado no beforeEach

    await updateUserProfile(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'Nome e e-mail são obrigatórios.' });
    });
  });

  // --- Testes para a função changePassword ---
  describe('changePassword', () => {
    it('deve alterar a senha com sucesso', async () => {
      const mockUser = { id: 1, senha: 'senhaAntigaCriptografada' };
      const req = { userId: 1, body: { senhaAntiga: 'senhaAntiga123', novaSenha: 'novaSenha123' } };
      db.query.mockResolvedValueOnce({ rows: [mockUser] });
      bcrypt.compare.mockResolvedValue(true);
      bcrypt.hash.mockResolvedValue('novaSenhaCriptografada');
      db.query.mockResolvedValueOnce({ rowCount: 1 });
      
      await changePassword(req, res);
      
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'Senha alterada com sucesso!' });
    });

    it('deve retornar 400 se a senha antiga estiver incorreta', async () => {
      const mockUser = { id: 1, senha: 'senhaAntigaCriptografada' };
      const req = {
        userId: 1,
        body: { senhaAntiga: 'senhaErradaDigitada', novaSenha: 'novaSenha123' },
      };
      db.query.mockResolvedValueOnce({ rows: [mockUser] });
      bcrypt.compare.mockResolvedValue(false);
      
      await changePassword(req, res);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Senha atual incorreta.' });
    });

    it('deve retornar 500 se houver um erro no banco de dados', async () => {
      const req = { userId: 1, body: { senhaAntiga: 'senhaAntiga123', novaSenha: 'novaSenha123' } };
      db.query.mockRejectedValue(new Error('Erro de DB simulado'));
      
      await changePassword(req, res);
      
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Erro interno do servidor.' });
    });
    // (Para cobrir a linha 138 - validação de campos)
    it('deve retornar 400 se os campos de senha estiverem faltando', async () => {
    const req = { userId: 1, body: { senhaAntiga: 'senhaAntiga123' } };
    await changePassword(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'Senha antiga e nova senha são obrigatórias.' });
    });

    it('deve retornar 404 se o usuário não for encontrado', async () => {
    const req = {
        userId: 999,
        body: { senhaAntiga: 'senhaAntiga123', novaSenha: 'novaSenha123' },
    };

    db.query.mockResolvedValue({ rows: [] });

    await changePassword(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'Usuário não encontrado.' });
    });
  });
});