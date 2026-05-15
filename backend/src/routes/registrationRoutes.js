const express = require("express");
const router = express.Router();
const { registerStudent } = require("../controllers/registrationController");
const authenticateToken = require('../middlewares/authMiddleware');

// Ruta para inscribir a un nuevo estudiante
router.post("/", authenticateToken, registerStudent);

module.exports = router;