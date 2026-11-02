const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Rota de login
router.post('/llogin', authController.login);

module.exports = router;
