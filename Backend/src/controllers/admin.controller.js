import db from '../models/index.js';

// Obtener todos los grupos para el Dropdown
export const getGroupsList = async (req, res) => {
    try {
        const grupos = await db.Grupo.findAll({ attributes: ['id', 'nombre'] });
        res.json(grupos);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener grupos' });
    }
};

// Actualizar grupo y estado de un usuario
export const updateUserAdmin = async (req, res) => {
    const { id } = req.params;
    const { group_id, estado } = req.body;

    try {
        const user = await db.User.findByPk(id);
        if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

        // Actualizamos solo los campos permitidos
        user.group_id = group_id;
        user.estado = estado;
        
        await user.save();
        res.json({ message: 'Usuario actualizado correctamente' });
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar usuario' });
    }
};