const express = require('express');
const router = express.Router();
const { getDashboard, getEstatisticas } = require('../controllers/dashboard.controller');
const { authenticate } = require('../middleware/auth.middleware');

router.use(authenticate);

router.get('/', getDashboard);
router.get('/estatisticas', getEstatisticas);

module.exports = router;
