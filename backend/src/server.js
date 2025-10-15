// arquivo: backend/src/server.js (CORRIGIDO)

const express = require('express');
const cors = require('cors');
const app = express();

// Carrega as variáveis de ambiente do arquivo .env
require('dotenv').config();

// Define a porta do servidor
const port = process.env.PORT || 3000;

// --- Middlewares Essenciais ---
app.use(cors());
app.use(express.json());

// --- Importação das Rotas ---
const userRoutes = require('./routes/userRoutes');
const transactionRoutes = require('./routes/transactionsRoutes');
const feedbackRoutes = require('./routes/feedbackRoutes');

// --- Uso das Rotas ---
// Todas as rotas de usuário usarão o prefixo /api/users
app.use('/api/users', userRoutes);
// Todas as rotas de transação usarão o prefixo /api/transactions
app.use('/api/transactions', transactionRoutes);
// ADICIONADO: Ativa as rotas de feedback com o prefixo /api/feedbacks
app.use('/api/feedbacks', feedbackRoutes);

// --- Iniciar o Servidor ---
app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});