// Backend/src/routes/admin.routes.js

import express from 'express';
import { 
    getAllUsers,
    updateUser,
    deleteUser
} from '../services/user.service.js';
import { getAllMyGroups } from '../services/group.service.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Rutas protegidas para administración
// En admin.routes.js
router.get('/users', protect, async (req, res) => {
    try {
       
        const users = await getAllUsers();
       
        res.status(200).json(users);
    } catch (error) {
        console.error('Error completo:', error); // Debug
        res.status(500).json({ message: error.message });
    }
});


router.get('/groups', protect, async (req, res) => {
    try {
        // Necesitamos el admin_id del usuario autenticado
        const admin_id = req.user.id;
        const groups = await getAllMyGroups(admin_id);
        res.status(200).json(groups);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.put('/users/:id', protect, async (req, res) => {
    try {
        const { id } = req.params;
        const userData = req.body;
        const user = await updateUser(id, userData);
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.delete('/users/:id', protect, async (req, res) => {
    try {
        const { id } = req.params;
        const result = await deleteUser(id);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
