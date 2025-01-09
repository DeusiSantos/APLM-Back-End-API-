const express = require('express');
const router = express.Router();
const ReserveController = require('../controllers/ReserveController');

router.post('/reserve', ReserveController.create);
router.put('/status/:id', ReserveController.updateStatus);
router.get('/active/:id_ciclista', ReserveController.getUserActiveReserve);
router.patch('/status/levantado/:id', ReserveController.changeToLevantado);
router.patch('/status/devolvido/:id', ReserveController.changeToDevolvido);

module.exports = router;
