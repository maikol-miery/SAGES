const express = require("express");
const router = express.Router();
const {createSubject, getAllSubjects, updateSubject, deleteSubject} = require("../controllers/subjectsController");
const { authenticateToken } = require('../middlewares/authMiddleware');
const validateSchema = require('../middlewares/validateSchema');
const { createSubjectSchema, updateSubjectSchema } = require("../schemas/subjectSchema")

router.post("/", authenticateToken,  validateSchema(createSubjectSchema), createSubject);
router.patch("/:id", authenticateToken,  validateSchema(updateSubjectSchema), updateSubject);
router.delete("/:id", authenticateToken, deleteSubject);
router.get("/", authenticateToken, getAllSubjects);


module.exports = router;