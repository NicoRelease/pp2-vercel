import db from '../models/index.js';

// Obtener todos los grupos para el Dropdown
export const getGroupUserInfo = async (req, res) => {
    
    try {
        const group_id = req.user;
        const users = await db.User.findAll({
            where:{group_id: group_id}});
        
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener datos de usuarios pertenecientes al grupo' });
    }
};