// Backend/src/services/user.service.js

import db from '../models/index.js';

// Obtener todos los usuarios
export const getAllUsers = async () => {
    return await db.User.findAll({
        attributes: ['id', 'username', 'email', 'estado', 'rol_id', 'group_id'],
        include: [
            { model: db.Rol, as: 'rol', attributes: ['nombre'] },
            { model: db.Grupo, as: 'grupo', attributes: ['nombre_grupo'] } // Cambiado a nombre_grupo
        ]
    });
};

// Editar un usuario
export const updateUser = async (userId, userData) => {
    const user = await db.User.findByPk(userId);
    if (!user) throw new Error("Usuario no encontrado");

    // Actualiza los campos del usuario
    Object.assign(user, userData);
    await user.save();
    return user;
};

// Activar o desactivar un usuario
export const toggleUserStatus = async (userId, status) => {
    const user = await db.User.findByPk(userId);
    if (!user) throw new Error("Usuario no encontrado");

    user.estado = status;
    await user.save();
    return user;
};

// Eliminar un usuario
export const deleteUser = async (userId) => {
    const user = await db.User.findByPk(userId);
    if (!user) throw new Error("Usuario no encontrado");

    await user.destroy();
    return { message: 'Usuario eliminado correctamente' };
};
