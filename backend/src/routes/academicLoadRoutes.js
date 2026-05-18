const express = require('express');
const router = express.Router();
const {assignTeacher, getAcademicLoads} = require("../controllers/academicLoadController");
const authenticateToken = require('../middlewares/authMiddleware');

router.post("/", authenticateToken, assignTeacher)

router.get("/", authenticateToken, getAcademicLoads)

module.exports = router