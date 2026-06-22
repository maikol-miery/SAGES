const express = require('express');
const router = express.Router();
const {assignTeacher, getAcademicLoads, updateAcademicLoad, deleteAcademicLoad} = require("../controllers/academicLoadController");
const { authenticateToken } = require('../middlewares/authMiddleware');
const validateSchema = require('../middlewares/validateSchema');
const { createAcademicLoadSchema, updateAcademicLoadSchema } = require("../schemas/academicLoadSchema")

router.post("/", authenticateToken, validateSchema(createAcademicLoadSchema), assignTeacher)
router.patch("/:id", authenticateToken, validateSchema(updateAcademicLoadSchema), updateAcademicLoad)
router.delete("/:id", authenticateToken, deleteAcademicLoad);
router.get("/", authenticateToken, getAcademicLoads)

module.exports = router