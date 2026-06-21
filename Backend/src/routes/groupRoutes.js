// Backend/src/routes/group.routes.js
import express from 'express';
import { 
    manageGroup, 
    getMyGroup, 
    getAllMyGroups,
    deleteGroup,
    getGroupById,
    getAll
} from '../controllers/group.controller.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/all/:id', protect, getAllMyGroups);
router.get('/all', protect, getAll); // Para el listado de la izquierda
router.get('/:id', protect, getMyGroup);      // Para ver detalle por ID
router.post('/manage', protect, manageGroup); // Para crear o editar
router.delete('/delete/:id', protect, deleteGroup);
router.get('/byGroupId/:group_id', protect, getGroupById);      // Para ver detalle por ID // Nueva ruta para eliminar grupos

export default router;
