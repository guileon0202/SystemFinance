jest.mock('dotenv', () => ({
  config: jest.fn(),
}));

describe('Configuração do Banco de Dados (db.js)', () => {

  beforeEach(() => {
    jest.resetModules();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('deve logar um erro se a conexão falhar (cobre a linha 13)', () => {
    const { __mockConnect } = require('pg'); 
    const consoleErrorMock = jest.spyOn(console, 'error').mockImplementation(() => {});
    const mockError = new Error('Falha de conexão simulada');

    // Configura o 'connect' (importado do mock) para falhar
    __mockConnect.mockImplementation((callback) => {
      callback(mockError);
    });

    require('../db/db');

    expect(__mockConnect).toHaveBeenCalled();
    expect(consoleErrorMock).toHaveBeenCalledWith('Erro ao conectar ao banco de dados:', mockError);

    consoleErrorMock.mockRestore();
  });

  it('deve logar sucesso se a conexão funcionar', () => {
    const { __mockConnect } = require('pg');
    const consoleLogMock = jest.spyOn(console, 'log').mockImplementation(() => {});

    __mockConnect.mockImplementation((callback) => {
      callback(null);
    });

    require('../db/db');

    expect(__mockConnect).toHaveBeenCalled();
    expect(consoleLogMock).toHaveBeenCalledWith('Conectado ao banco de dados com sucesso.');
    
    consoleLogMock.mockRestore();
  });
});