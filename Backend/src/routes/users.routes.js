// Backend/src/routes/users.routes.js
import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import * as userController from '../controllers/user.controller.js';

const router = express.Router();

// Rutas para gestión de usuarios
router.get('/grupo/:group_id', protect, userController.getGroupUserInfo);

export default router;
