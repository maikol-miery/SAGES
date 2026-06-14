const express = require("express");
const router = express.Router();
const registrationController = require("../controllers/registrationController");
const { authenticateToken } = require('../middlewares/authMiddleware');
const validateSchema = require('../middlewares/validateSchema');
const { createRegistrationSchema, updateRegistrationSchema, bulkRegistrationSchema} = require("../schemas/registrationSchema")
const { fullRegistrationSchema } = require("../schemas/fullRegistrationSchema")

// Ruta para inscribir a un nuevo estudiante
router.post('/bulk', authenticateToken, validateSchema(bulkRegistrationSchema), registrationController.saveBulkRegistrations);
// router.post("/", authenticateToken, validateSchema(createRegistrationSchema), registrationController.registerStudent);
router.post("/", authenticateToken, validateSchema(fullRegistrationSchema), registrationController.fullEnrollment);
router.patch("/:id", authenticateToken, registrationController.updateFullRegistration );
router.get("/", authenticateToken, registrationController.getAllRegistrations);

module.exports = router;