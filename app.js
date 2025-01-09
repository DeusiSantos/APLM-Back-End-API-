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
const reserveRoutes = require('./src/routes/reserveRoutes');
const trajetoriaRoutes = require('./src/routes/trajetoriaRoutes');

// Definindo rotas principais
app.use('/api/ListCyclists', cyclistRoutes);
app.use('/api/cyclists', cyclistRoutes);
app.use('/api/stations', stationRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/reservas', reserveRoutes);
app.use('/api/trajetorias', trajetoriaRoutes);
// Rota de teste
app.get('/', (req, res) => {
  res.json({ message: 'BinasJC API está funcionando!' });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
