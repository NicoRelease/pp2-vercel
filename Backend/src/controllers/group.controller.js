// Backend/src/controllers/group.controller.js
import db from '../models/index.js';

export const manageGroup = async (req, res) => {
    try {
        const { nombre_grupo, emails } = req.body;
        const admin_id = req.user.id; // Extraído del token por verifyToken

        // Buscamos el grupo vinculado al ID del Administrador
        const grupo = await db.Grupo.findOne({ where: { admin_id: admin_id } });

        if (!grupo) {
            return res.status(404).json({ message: "No se encontró el grupo." });
        }

        // Actualizamos los campos según el esquema de la imagen
        grupo.nombre_grupo = nombre_grupo;
        grupo.email = emails; // Se guarda la cadena de texto separada por comas
        await grupo.save();

        res.status(200).json({ message: "Grupo actualizado con éxito" });
    } catch (error) {
        console.error("Error al grabar grupo:", error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
};

export const getMyGroup = async (req, res) => {
    try {
        const grupo = await db.Grupo.findOne({ where: { admin_id: req.user.id } });
        res.status(200).json(grupo);
    } catch (error) {
        res.status(500).json({ message: "Error al obtener grupo" });
    }
};