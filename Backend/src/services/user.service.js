import db from '../models/index.js';

// Listar todos los usuarios para el Panel de Administración
export const getAllUsers = async () => {
    return await db.User.findAll({
        attributes: ['id', 'username', 'email', 'estado', 'rol_id', 'group_id'],
        include: [
            { model: db.Rol, as: 'rol', attributes: ['nombre'] },
            { model: db.Grupo, as: 'grupo', attributes: ['nombre'] }
        ]
    });
};

// Activar o desactivar un usuario manualmente
export const toggleUserStatus = async (userId, status) => {
    const user = await db.User.findByPk(userId);
    if (!user) throw new Error("Usuario no encontrado");
    
    user.estado = status;
    await user.save();
    return user;
};

// Asignar un usuario a un grupo y cambiar su rol a GroupAdmin si es necesario
export const assignUserToGroup = async (userId, groupId, roleId = 3) => {
    const user = await db.User.findByPk(userId);
    if (!user) throw new Error("Usuario no encontrado");

    user.group_id = groupId;
    user.rol_id = roleId;
    user.estado = true; // Al asignarlo a un grupo, lo activamos automáticamente
    await user.save();
    return user;
};