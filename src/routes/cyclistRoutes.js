const express = require('express');
const router = express.Router();
const CyclistController = require('../controllers/CyclistController');

router.post('/', CyclistController.create);
router.get('/', CyclistController.getAll);
router.get('/:id', CyclistController.getById);
router.put('/:id', CyclistController.update);
router.delete('/:id', CyclistController.delete);

module.exports = router;