// Backend/src/routes/users.routes.js
import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import * as userController from '../controllers/userController.js';

const router = express.Router();

// Rutas para gestión de usuarios
router.get('/', protect, userController.getAllUsers);
router.get('/:id', protect, userController.getUserById);
router.post('/', protect, userController.createUser);
router.put('/:id', protect, userController.updateUser);
router.delete('/:id', protect, userController.deleteUser);

export default router;
