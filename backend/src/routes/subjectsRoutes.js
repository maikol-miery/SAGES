const express = require("express");
const router = express.Router();
const {createSubject, getAllSubjects} = require("../controllers/subjectsController");
const authenticateToken = require('../middlewares/authMiddleware');

router.get("/", authenticateToken, getAllSubjects);
router.post("/", authenticateToken, createSubject);

module.exports = router;