const express = require("express");
const router = express.Router();
const { authenticateToken } = require('../middlewares/authMiddleware');
const representativeController = require("../controllers/representativeController");
const validateSchema = require("../middlewares/validateSchema");
const { updateRepresentativeSchema } = require("../schemas/representativeSchema");

// Ruta protegida para traer los representantes paginados y filtrados
router.get('/', authenticateToken, representativeController.getAllRepresentatives);
router.patch('/:id', authenticateToken, validateSchema(updateRepresentativeSchema), representativeController.updateRepresentative);

module.exports = router;