const express = require("express");
const router = express.Router();
const authenticateToken = require('../middlewares/authMiddleware');
const studentController = require("../controllers/studentController");

router.post('/register', authenticateToken, studentController.registerStudent);
router.get('/all', authenticateToken, studentController.getAllStudents);

module.exports = router;