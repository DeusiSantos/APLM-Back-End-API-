const router = require('express').Router();
const trajetoriaController = require('../controllers/TrajetoriaController');

// Registrar nova trajetória
router.post('/', trajetoriaController.create);

// Buscar trajetórias de um usuário
router.get('/usuario/:id_usuario', trajetoriaController.getByUser);

module.exports = router;