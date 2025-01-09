// cyclistRoutes.js
const express = require('express');
const router = express.Router();
const CyclistController = require('../controllers/CyclistController');

router.post('/', CyclistController.create);
router.get('/', CyclistController.getAll);
router.get('/:id', CyclistController.getById);
router.put('/:id', CyclistController.update);
router.delete('/:id', CyclistController.delete);
// Mude esta linha
router.patch('/:id/points', CyclistController.updatePoints); // Removido 'cyclists' do caminho

module.exports = router;