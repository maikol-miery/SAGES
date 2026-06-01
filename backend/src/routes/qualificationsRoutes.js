const express = require('express');
const router = express.Router();
const validateSchema = require('../middlewares/validateSchema');
const { authenticateToken } = require('../middlewares/authMiddleware');
const qualificationController = require('../controllers/qualificationController');
const { createQualificationSchema, updateQualificationSchema, createBulkQualificationsSchema } = require('../schemas/qualificationSchema');

//registrar una sola nota (Individual)
router.post('/', authenticateToken, validateSchema(createQualificationSchema), qualificationController.saveQualification);

//actualizar una sola nota por su ID (Individual)
router.put('/:id', authenticateToken, validateSchema(updateQualificationSchema), qualificationController.updateQualification);

//carga masiva/planilla completa (Bulk)
router.post('/bulk', authenticateToken, validateSchema(createBulkQualificationsSchema), qualificationController.saveBulkQualifications);

module.exports = router;