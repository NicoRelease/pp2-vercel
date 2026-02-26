// Backend/src/routes/group.routes.js
import express from 'express';
import { manageGroup, getMyGroup } from '../controllers/group.controller.js';
import { protect } from '../middleware/authMiddleware.js'; // Necesario para identificar al Admin

const router = express.Router();

// Ruta para cargar datos en el Dashboard (GET)
router.get('/my-group', protect, getMyGroup);

// Ruta para grabar/actualizar nombre y participantes (POST)
router.post('/manage', protect, manageGroup);

export default router;