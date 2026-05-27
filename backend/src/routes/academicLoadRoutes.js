const express = require('express');
const router = express.Router();
const {assignTeacher, getAcademicLoads} = require("../controllers/academicLoadController");
const authenticateToken = require('../middlewares/authMiddleware');
const validateSchema = require('../middlewares/validateSchema');
const { createAcademicLoadSchema, updateAcademicLoadSchema } = require("../schemas/academicLoadSchema")

router.post("/", authenticateToken, assignTeacher)

router.get("/", authenticateToken, getAcademicLoads)

module.exports = router