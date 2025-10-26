const axios = require('axios');
const BRAPI_URL = 'https://brapi.dev/api/quote';

async function getStockQuote(req, res) {
  const { ticker } = req.params;

  if (!ticker) {
    return res.status(400).json({ message: 'O ticker do ativo é obrigatório.' });
  }

  try {
    const response = await axios.get(`${BRAPI_URL}/${ticker}`);

    const stockData = response.data.results;

    if (!stockData || stockData.length === 0) {
      return res.status(404).json({ message: 'Ativo não encontrado.' });
    }

    // Enviamos apenas o primeiro resultado para o nosso frontend
    res.status(200).json(stockData[0]);

  } catch (error) {
    console.error('Erro ao buscar dados da Brapi:', error.message);
    res.status(500).json({ message: 'Erro interno do servidor ao buscar dados do ativo.' });
  }
}

module.exports = {
  getStockQuote,
};