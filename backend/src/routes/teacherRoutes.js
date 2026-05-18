const express = require('express');
const router = express.Router();
const { createTeacher, getAllTeachers } = require('../controllers/teacherController');
const authenticateToken = require('../middlewares/authMiddleware');

router.post('/', authenticateToken, createTeacher);
router.get('/', authenticateToken, getAllTeachers);

module.exports = router;