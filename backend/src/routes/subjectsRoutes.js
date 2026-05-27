const express = require("express");
const router = express.Router();
const {createSubject, getAllSubjects} = require("../controllers/subjectsController");
const authenticateToken = require('../middlewares/authMiddleware');
const validateSchema = require('../middlewares/validateSchema');
const { createSubjectSchema, updateSubjectSchema } = require("../schemas/subjectSchema")

router.post("/", authenticateToken,  validateSchema(createSubjectSchema), createSubject);
router.get("/", authenticateToken, getAllSubjects);


module.exports = router;