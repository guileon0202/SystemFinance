const request = require('supertest');
const app = require('../src/app');
const db = require('../src/db/db');

// MOCKING DO BANCO DE DADOS E DEPENDÊNCIAS

// Mocka o módulo pg (db.query) para que os testes não atinjam o DB real
jest.mock('../src/db/db', () => ({
    query: jest.fn(),
}));

// Define dados de usuário fictício
const testUser = {
    id: 9999,
    nome: 'Teste User',
    email: 'teste@exemplo.com',
    senha: 'Senha123',
    is_admin: false
};
const hashedPassword = '$2a$10$hashedpasswordfrombcryptjs';
const fakeToken = 'fake-jwt-token';

// O grupo de testes para as rotas de usuário
describe('User Routes /api/users', () => {

    // Configura os mocks de bcrypt e jwt antes de cada teste
    beforeEach(() => {
        db.query.mockClear();
        jest.spyOn(require('bcryptjs'), 'hash').mockResolvedValue(hashedPassword);
        jest.spyOn(require('bcryptjs'), 'compare').mockImplementation((password, hash) => {
            return Promise.resolve(password === testUser.senha);
        });
        jest.spyOn(require('jsonwebtoken'), 'sign').mockReturnValue(fakeToken);
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });


    // TESTES DE REGISTRO (/register)
    it('POST /register: deve registrar um novo usuário com sucesso', async () => {
        db.query.mockResolvedValueOnce({ rows: [] })
            .mockResolvedValueOnce({ rows: [{ id: testUser.id, email: testUser.email, nome: testUser.nome }] });

        const response = await request(app)
            .post('/api/users/register')
            .send({
                nome: testUser.nome,
                email: testUser.email,
                senha: testUser.senha
            });

        expect(response.statusCode).toBe(201);
        expect(response.body.message).toBe('Usuário cadastrado com sucesso!');
        expect(response.body.token).toBe(fakeToken);
        expect(db.query).toHaveBeenCalledTimes(2);
    });

    it('POST /register: deve retornar 400 se o email já estiver em uso', async () => {
        db.query.mockResolvedValueOnce({ rows: [testUser] });

        const response = await request(app)
            .post('/api/users/register')
            .send({
                nome: testUser.nome,
                email: testUser.email,
                senha: testUser.senha
            });

        expect(response.statusCode).toBe(400);
        expect(response.body.message).toBe('Usuário com este email já existe.');
        expect(db.query).toHaveBeenCalledTimes(1);
    });


    // --- TESTES DE LOGIN (/login) ---
    it('POST /login: deve logar um usuário com credenciais válidas', async () => {
        db.query.mockResolvedValueOnce({
            rows: [{ ...testUser, senha: hashedPassword }]
        });

        const response = await request(app)
            .post('/api/users/login')
            .send({
                email: testUser.email,
                senha: testUser.senha
            });

        expect(response.statusCode).toBe(200);
        expect(response.body.token).toBe(fakeToken);
        expect(response.body.user.email).toBe(testUser.email);
        expect(db.query).toHaveBeenCalledTimes(1);
    });

    it('POST /login: deve retornar 400 com email ou senha incorreta (senha)', async () => {
        db.query.mockResolvedValueOnce({
            rows: [{ ...testUser, senha: hashedPassword }]
        });

        require('bcryptjs').compare.mockResolvedValue(false);

        const response = await request(app)
            .post('/api/users/login')
            .send({
                email: testUser.email,
                senha: 'SenhaIncorreta'
            });

        expect(response.statusCode).toBe(400);
        expect(response.body.message).toBe('Email ou senha inválidos.');
    });

    it('POST /login: deve retornar 400 com email ou senha incorreta (email não encontrado)', async () => {
        db.query.mockResolvedValueOnce({ rows: [] });

        const response = await request(app)
            .post('/api/users/login')
            .send({
                email: 'naoexiste@exemplo.com',
                senha: testUser.senha
            });

        expect(response.statusCode).toBe(400);
        expect(response.body.message).toBe('Email ou senha inválidos.');
    });

});