const express = require('express');
const router = express.Router();
const { listar, buscarPorId, criar, atualizar, excluir, operacaoOuro } = require('../controllers/membro.controller');
const { authenticate } = require('../middleware/auth.middleware');

router.use(authenticate);

router.get('/', listar);
router.get('/:id', buscarPorId);
router.post('/', criar);
router.put('/:id', atualizar);
router.delete('/:id', excluir);
router.post('/:id/ouro', operacaoOuro);

module.exports = router;
