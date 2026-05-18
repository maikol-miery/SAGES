const express = require('express');
const router = express.Router();
const { saveQualification } = require('../controllers/qualificationController');
const authenticateToken = require('../middlewares/authMiddleware');


router.post('/', authenticateToken, saveQualification);

module.exports = router;