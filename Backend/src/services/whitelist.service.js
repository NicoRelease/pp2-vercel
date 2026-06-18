// Backend/src/services/whitelist.service.js

import db from '../models/index.js';

// Obtener todos los usuarios en la whitelist
export const getAllWhitelistedUsers = async () => {
    return await db.Whitelist.findAll({
        attributes: ['id', 'email', 'activo', 'notas']
    });
};

// Agregar un usuario a la whitelist
export const addWhitelistedUser = async (email, notas = null) => {
    try {
        const whitelistedUser = await db.Whitelist.create({
            email: email,
            notas: notas
        });
        return whitelistedUser;
    } catch (error) {
        throw new Error(`Error al agregar usuario a whitelist: ${error.message}`);
    }
};

// Eliminar un usuario de la whitelist
export const removeWhitelistedUser = async (userId) => {
    const whitelistedUser = await db.Whitelist.findByPk(userId);
    if (!whitelistedUser) {
        throw new Error("Usuario no encontrado en whitelist");
    }
    
    await whitelistedUser.destroy();
    return { message: 'Usuario eliminado de whitelist correctamente' };
};

// Activar o desactivar un usuario en la whitelist
export const toggleWhitelistUserStatus = async (userId, status) => {
    const whitelistedUser = await db.Whitelist.findByPk(userId);
    if (!whitelistedUser) {
        throw new Error("Usuario no encontrado en whitelist");
    }
    
    whitelistedUser.activo = status;
    await whitelistedUser.save();
    return whitelistedUser;
};

// Verificar si un usuario está en la whitelist
export const isWhitelisted = async (email) => {
    const whitelistedUser = await db.Whitelist.findOne({
        where: {
            email: email,
            activo: true
        }
    });
    return whitelistedUser !== null;
};
