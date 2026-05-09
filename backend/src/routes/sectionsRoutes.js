const express = require("express")
const router = express.Router()
const {getAllSections, createSection} = require("../controllers/sectionController")
const authenticateToken = require('../middlewares/authMiddleware');

router.post('/', authenticateToken, createSection)
router.get('/', authenticateToken, getAllSections)

module.exports = router;