const express = require('express');
const router = express.Router();
const { listar, listarPorMembro } = require('../controllers/historico.controller');
const { authenticate } = require('../middleware/auth.middleware');

router.use(authenticate);

router.get('/', listar);
router.get('/membro/:membroId', listarPorMembro);

module.exports = router;
