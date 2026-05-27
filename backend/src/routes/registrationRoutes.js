const express = require("express");
const router = express.Router();
const { registerStudent } = require("../controllers/registrationController");
const authenticateToken = require('../middlewares/authMiddleware');
const validateSchema = require('../middlewares/validateSchema');
const { createRegistrationSchema, updateRegistrationSchema } = require("../schemas/registrationSchema")

// Ruta para inscribir a un nuevo estudiante
router.post("/", authenticateToken, validateSchema(createRegistrationSchema),registerStudent);

module.exports = router;