// Backend/src/routes/admin.routes.js

import express from 'express';
import { 
    getAllUsers,
    updateUser,
    deleteUser
} from '../services/user.service.js';
import { getAllMyGroups } from '../services/group.service.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

// Rutas protegidas para administración
// En admin.routes.js - Solo SysAdmin (rol_id = 1)
router.get('/users', protect, authorizeRoles(1), async (req, res) => {
    try {
       
        const users = await getAllUsers();
       
        res.status(200).json(users);
    } catch (error) {
        console.error('Error completo:', error); // Debug
        res.status(500).json({ message: error.message });
    }
});


router.get('/groups', protect, authorizeRoles(1), async (req, res) => {
    try {
        // Necesitamos el admin_id del usuario autenticado
        const admin_id = req.user.id;
        const groups = await getAllMyGroups(admin_id);
        res.status(200).json(groups);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.put('/users/:id', protect, authorizeRoles(1), async (req, res) => {
    try {
        const { id } = req.params;
        // Filtrado de campos permitidos para evitar asignación masiva insegura
        const allowedFields = ['username', 'email', 'estado'];
        const userData = {};
        for (const field of allowedFields) {
            if (req.body[field] !== undefined) {
                userData[field] = req.body[field];
            }
        }
        
        const user = await updateUser(id, userData);
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.delete('/users/:id', protect, authorizeRoles(1), async (req, res) => {
    try {
        const { id } = req.params;
        const result = await deleteUser(id);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
