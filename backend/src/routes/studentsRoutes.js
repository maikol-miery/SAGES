const express = require("express");
const router = express.Router();
const authenticateToken = require('../middlewares/authMiddleware');
const studentController = require("../controllers/studentController");
const validateSchema = require("../middlewares/validateSchema");
const { enrollmentSchema } = require("../schemas/enrollmentSchema");

router.post('/register', authenticateToken, validateSchema(enrollmentSchema), studentController.registerStudent);
router.get('/all', authenticateToken, studentController.getAllStudents);

module.exports = router;