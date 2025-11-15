// arquivo: backend/__mocks__/pg.js (CORRIGIDO)

// Criamos UMA ÚNICA instância do mock
const mockConnect = jest.fn();

// O construtor do Pool AGORA aponta para essa ÚNICA instância
const mockPool = jest.fn(() => ({
  connect: mockConnect, // Aponta para o mockConnect acima
  query: jest.fn(),
}));

// Exportamos o Pool e a função de controle (que agora é a MESMA função)
module.exports = {
  Pool: mockPool,
  __mockConnect: mockConnect, // Exporta o mockConnect acima
};