const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const validateSchema = require('../middlewares/validateSchema');
const { authenticateToken, isAdmin } = require('../middlewares/authMiddleware');

const { 
    registerUserSchema, 
    loginUserSchema, 
    updateUserSchema, 
    changePasswordSchema,
    verifySecurityQuestionsSchema,
    resetPasswordSchema,
    updateProfileSchema
} = require('../schemas/userSchema');

// --- RUTAS PÚBLICAS (No necesitan token) ---
router.post('/setup-admin', validateSchema(registerUserSchema), authController.registerAdmin);
router.post('/login', validateSchema(loginUserSchema), authController.login);

// --- RUTAS PRIVADAS (Para Secretaria, Profesor o Admin) ---
// Usamos authenticateToken para que solo pase quien haya hecho login
router.put('/change-password', authenticateToken, validateSchema(changePasswordSchema), authController.changePassword);
router.put('/profile', authenticateToken, validateSchema(updateProfileSchema), authController.updateProfile);

// --- RUTAS EXCLUSIVAS DE ADMIN ---
// Aquí está la magia: exigimos token Y exigimos que el rol sea 'admin'
router.post('/verify-questions', validateSchema(verifySecurityQuestionsSchema), authController.verifySecurityQuestions);
router.post('/reset-password', validateSchema(resetPasswordSchema), authController.resetPassword);

module.exports = router;