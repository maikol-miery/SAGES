const express = require('express');
const router = express.Router();
const { exportDatabase, restoreDatabase } = require('../controllers/maintenanceController');

// Middlewares protectores que ya debes tener creados en tu sistema
const { authenticateToken, isAdmin } = require('../middlewares/authMiddleware');

// Ruta para exportar (Generar y descargar .bak)
// GET /api/maintenance/export
router.get('/export', authenticateToken, isAdmin, exportDatabase);

module.exports = router;