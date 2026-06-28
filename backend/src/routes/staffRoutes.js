const express = require('express');
const router = express.Router();
const { createStaff, getAllStaff, updateStaff, getStaffList, deleteStaff } = require('../controllers/staffController');
const { authenticateToken, isAdmin } = require('../middlewares/authMiddleware');
const validateSchema = require('../middlewares/validateSchema');
const { createStaffSchema, updateStaffSchema } = require("../schemas/staffSchema")

router.post('/', authenticateToken, isAdmin, validateSchema(createStaffSchema), createStaff);
router.patch('/:id', authenticateToken, validateSchema(updateStaffSchema), updateStaff);
router.get('/list', authenticateToken, getStaffList);
router.get('/', authenticateToken, getAllStaff);
router.delete('/:id', authenticateToken, deleteStaff);

module.exports = router;