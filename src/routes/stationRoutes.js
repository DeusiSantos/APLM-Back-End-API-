const express = require('express');
const router = express.Router();
const StationController = require('../controllers/StationController');

router.post('/', StationController.create);
router.get('/', StationController.getAll);
router.get('/:id', StationController.getById);
router.put('/:id', StationController.update);
router.delete('/:id', StationController.delete);

module.exports = router;