// arquivo: backend/src/server.js (COMPLETO E ATUALIZADO)

const express = require('express');
const cors = require('cors');
const app = express();

// Carrega as variáveis de ambiente do arquivo .env
require('dotenv').config();

// Define a porta do servidor
const port = process.env.PORT || 3000;

// --- Middlewares Essenciais ---
// Habilita o CORS para permitir que o frontend se comunique com o backend
app.use(cors());
// Habilita o Express para entender o corpo das requisições em formato JSON
app.use(express.json());

// --- Importação das Rotas ---
const userRoutes = require('./routes/userRoutes');
const transactionRoutes = require('./routes/transactionsRoutes'); // <-- LINHA ADICIONADA

// --- Uso das Rotas ---
// Todas as rotas de usuário usarão o prefixo /api/users
app.use('/api/users', userRoutes);
// Todas as rotas de transação usarão o prefixo /api/transactions
app.use('/api/transactions', transactionRoutes); // <-- LINHA ADICIONADA

// --- Iniciar o Servidor ---
app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});