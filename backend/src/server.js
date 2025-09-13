const express = require('express');
const app = express();

// 1. Instalar e configurar o dotenv para carregar variáveis de ambiente
require('dotenv').config();

// Define a porta do servidor, pegando da variável de ambiente ou usando 3001 como padrão
const port = process.env.PORT || 3000;

// 2. Middleware para processar JSON nas requisições HTTP
// Isso permite que o servidor entenda o corpo das requisições POST e PUT
app.use(express.json());

// 3. Importar o arquivo de rotas que você criou
const userRoutes = require('./routes/userRoutes');

// 4. Usar as rotas
// O primeiro argumento '/api/users' define o prefixo para todas as rotas deste arquivo.
// Então, a rota de cadastro será acessada em http://localhost:3001/api/users/register
app.use('/api/users', userRoutes);

// 5. Iniciar o servidor
app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});