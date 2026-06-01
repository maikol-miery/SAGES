const express = require('express');
const router = express.Router();
const { createTeacher, getAllTeachers, updateTeacher } = require('../controllers/teacherController');
const { authenticateToken } = require('../middlewares/authMiddleware');
const validateSchema = require('../middlewares/validateSchema');
const { createTeacherSchema, updateTeacherSchema } = require("../schemas/teacherSchema")

router.post('/', authenticateToken, validateSchema(createTeacherSchema), createTeacher);
router.patch('/:id', authenticateToken, validateSchema(updateTeacherSchema), updateTeacher);
router.get('/', authenticateToken, getAllTeachers);

module.exports = router;