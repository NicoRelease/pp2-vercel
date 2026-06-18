// Backend/src/services/group.service.js

import db from '../models/index.js';

// Obtener todos los grupos del usuario actual
export const getAllMyGroups = async (admin_id) => {
    return await db.Grupo.findAll({ 
        where: { admin_id: admin_id },
        order: [['created_at', 'DESC']]
    });
};

// Crear un nuevo grupo
export const createGroup = async (groupData) => {
    return await db.Grupo.create(groupData);
};

// Actualizar un grupo
export const updateGroup = async (groupId, groupData) => {
    const group = await db.Grupo.findByPk(groupId);
    if (!group) throw new Error("Grupo no encontrado");
    
    Object.assign(group, groupData);
    await group.save();
    return group;
};

// Eliminar un grupo
export const deleteGroup = async (groupId) => {
    const group = await db.Grupo.findByPk(groupId);
    if (!group) throw new Error("Grupo no encontrado");
    
    await group.destroy();
    return { message: 'Grupo eliminado correctamente' };
};
