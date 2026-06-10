const express = require("express");
const router = express.Router();
const { authenticateToken } = require('../middlewares/authMiddleware');
const representativeController = require("../controllers/representativeController");

// Ruta protegida para traer los representantes paginados y filtrados
router.get('/', authenticateToken, representativeController.getAllRepresentatives);

module.exports = router;