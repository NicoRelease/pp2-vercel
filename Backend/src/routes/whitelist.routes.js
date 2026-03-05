// Backend/src/routes/whitelist.routes.js

import express from 'express';
import { 
    getAllWhitelistedUsers,
    addWhitelistedUser,
    removeWhitelistedUser,
    toggleWhitelistUserStatus
} from '../services/whitelist.service.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Rutas para whitelist
router.get('/', protect, async (req, res) => {
    try {
        const users = await getAllWhitelistedUsers();
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.post('/add', protect, async (req, res) => {
    try {
        const { email, notas } = req.body;
        const user = await addWhitelistedUser(email, notas);
        res.status(201).json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.delete('/:id', protect, async (req, res) => {
    try {
        const { id } = req.params;
        const result = await removeWhitelistedUser(id);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.put('/:id/toggle', protect, async (req, res) => {
    try {
        const { id } = req.params;
        const { activo } = req.body;
        const user = await toggleWhitelistUserStatus(id, activo);
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
