const mockConnect = jest.fn();

// Mock da classe Pool do 'pg'
const mockPool = jest.fn(() => ({
  connect: mockConnect,
  query: jest.fn(),
}));

// Exporta o mock da Pool e o mockConnect para uso nos testes
module.exports = {
  Pool: mockPool,
  __mockConnect: mockConnect,
};