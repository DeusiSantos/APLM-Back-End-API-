const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Importando rotas
const cyclistRoutes = require('./src/routes/cyclistRoutes');
const stationRoutes = require('./src/routes/stationRoutes'); // Corrigido aqui
const authRoutes = require('./src/routes/authRoutes');
const authMiddleware = require('./src/controllers/authMiddleware');

// Definindo rotas principais
app.use('/api/cyclists', authMiddleware, cyclistRoutes);
app.use('/api/stations', stationRoutes);
app.use('/api/auth', authRoutes);

// Rota de teste
app.get('/', (req, res) => {
  res.json({ message: 'BinasJC API está funcionando!' });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
