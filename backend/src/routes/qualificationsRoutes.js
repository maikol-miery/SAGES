const express = require('express');
const router = express.Router();
const { saveQualification } = require('../controllers/qualificationController');
const authenticateToken = require('../middlewares/authMiddleware');
const validateSchema = require('../middlewares/validateSchema');
const { createQualificationSchema, updateQualificationSchema } = require("../schemas/qualificationSchema")


router.post('/', authenticateToken, validateSchema(createQualificationSchema), saveQualification);

module.exports = router;