const express = require("express");
const router = express.Router();
const { registerStudent, saveBulkRegistrations, updateRegistration, getAllRegistrations} = require("../controllers/registrationController");
const { authenticateToken } = require('../middlewares/authMiddleware');
const validateSchema = require('../middlewares/validateSchema');
const { createRegistrationSchema, updateRegistrationSchema, bulkRegistrationSchema } = require("../schemas/registrationSchema")

// Ruta para inscribir a un nuevo estudiante
router.post('/bulk', authenticateToken, validateSchema(bulkRegistrationSchema), saveBulkRegistrations);
router.post("/", authenticateToken, validateSchema(createRegistrationSchema), registerStudent);
router.post("/:id", authenticateToken, validateSchema(updateRegistrationSchema), updateRegistration);
router.get("/", authenticateToken, getAllRegistrations);

module.exports = router;