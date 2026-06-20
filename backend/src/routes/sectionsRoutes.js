const express = require("express")
const router = express.Router()
const {getAllSections, createSection, updateSection, deleteSection} = require("../controllers/sectionController")
const { authenticateToken } = require('../middlewares/authMiddleware');
const validateSchema = require('../middlewares/validateSchema');
const { createSectionSchema, updateSectionSchema } = require("../schemas/sectionSchema")

router.post('/', authenticateToken, validateSchema(createSectionSchema), createSection)
router.patch('/:id', authenticateToken, validateSchema(updateSectionSchema), updateSection)
router.get('/', authenticateToken, getAllSections)
router.delete('/:id', authenticateToken, deleteSection)

module.exports = router;