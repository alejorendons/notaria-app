// routes/userRoutes.js
const express = require('express');
const { registerUser, authUser, getUsers, getUserById, updateUserPermissions, updateUserPassword, deleteUser } = require('../controllers/userController'); // Agrega updateUserPassword y deleteUser
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/register', protect, authorize(['admin']), registerUser);
router.post('/login', authUser);

// Rutas para gestión de usuarios (solo admin)
router.get('/', protect, authorize(['admin']), getUsers);
router.get('/:id', protect, authorize(['admin']), getUserById);
router.put('/:id/permissions', protect, authorize(['admin']), updateUserPermissions); // Esta ya existe

router.put('/:id/password', protect, authorize(['admin']), updateUserPassword);


router.delete('/:id', protect, authorize(['admin']), deleteUser); // Agrega esta línea si decides implementarla

module.exports = router;
