// Backend/src/routes/group.routes.js
import express from 'express';
import { 
    manageGroup, 
    getMyGroup, 
    getAllMyGroups // Nueva función que debemos crear
} from '../controllers/group.controller.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/all', protect, getAllMyGroups); // Para el listado de la izquierda
router.get('/:id', protect, getMyGroup);      // Para ver detalle por ID
router.post('/manage', protect, manageGroup); // Para crear o editar

export default router;