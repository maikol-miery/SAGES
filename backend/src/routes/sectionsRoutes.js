const express = require("express")
const router = express.Router()
const {getAllSections, createSection} = require("../controllers/sectionController")
const authenticateToken = require('../middlewares/authMiddleware');
const validateSchema = require('../middlewares/validateSchema');
const { createSectionSchema, updateSectionSchema } = require("../schemas/sectionSchema")

router.post('/', authenticateToken, validateSchema(createSectionSchema), createSection)
router.get('/', authenticateToken, getAllSections)

module.exports = router;