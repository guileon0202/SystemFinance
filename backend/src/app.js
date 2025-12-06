const express = require('express');
const cors = require('cors');
const app = express();

// Carrega as variáveis de ambiente do arquivo .env
require('dotenv').config();

// --- Middlewares Essenciais ---
app.use(cors());
app.use(express.json());

// --- Importação das Rotas ---
const userRoutes = require('./routes/userRoutes');
const transactionRoutes = require('./routes/transactionsRoutes');
const feedbackRoutes = require('./routes/feedbackRoutes');
const investmentsRoutes = require('./routes/investmentsRoutes');
const adminRoutes = require('./routes/adminRoutes'); // Assumindo que foi adicionado

// --- Uso das Rotas ---
app.use('/api/users', userRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/feedbacks', feedbackRoutes);
app.use('/api/investments', investmentsRoutes);
app.use('/api/admin', adminRoutes);
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});

module.exports = app;