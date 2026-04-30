const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Esta será la ruta inicial para crear al primer jefe del sistema
router.post('/setup-admin', authController.registerAdmin);
router.post('/login', authController.login);

module.exports = router;