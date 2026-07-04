const express = require('express');
const router = express.Router();
const { getBanco, bancoParaMembro, membroParaBanco, getHistoricoBanco } = require('../controllers/banco.controller');
const { authenticate } = require('../middleware/auth.middleware');

router.use(authenticate);

router.get('/', getBanco);
router.get('/historico', getHistoricoBanco);
router.post('/banco-para-membro', bancoParaMembro);
router.post('/membro-para-banco', membroParaBanco);

module.exports = router;
