import db from '../models/index.js';

// 1. OBTENER TODOS LOS GRUPOS (Para el listado de la izquierda)
export const getAllMyGroups = async (req, res) => {
    try {
        const admin_id = req.user.id;
        const grupos = await db.Grupo.findAll({ 
            where: { admin_id: admin_id },
            order: [['created_at', 'DESC']] // Los más recientes primero
        });
        res.status(200).json(grupos);
    } catch (error) {
        console.error("Error al listar grupos:", error);
        res.status(500).json({ message: "Error al obtener la lista de grupos" });
    }
};

// 2. CREAR O ACTUALIZAR (Lógica dual para el formulario de la derecha)
export const manageGroup = async (req, res) => {
    try {
        const { id, nombre_grupo, emails } = req.body; // Recibimos el id si es edición
        const admin_id = req.user.id;

        if (id) {
            // --- MODO EDICIÓN ---
            const grupo = await db.Grupo.findOne({ where: { id: id, admin_id: admin_id } });
            if (!grupo) return res.status(404).json({ message: "Grupo no encontrado." });

            grupo.nombre_grupo = nombre_grupo;
            grupo.email = emails;
            await grupo.save();
            return res.status(200).json({ message: "Grupo actualizado con éxito", grupo });
        } else {
            // --- MODO CREACIÓN ---
            const nuevoGrupo = await db.Grupo.create({
                nombre_grupo,
                email: emails,
                admin_id: admin_id
            });
            return res.status(201).json({ message: "Grupo creado con éxito", grupo: nuevoGrupo });
        }
    } catch (error) {
        console.error("Error en manageGroup:", error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
};

// 3. OBTENER UNO SOLO (Por si refrescas la página con un ID seleccionado)
export const getMyGroup = async (req, res) => {
    try {
        const { id } = req.params; // Lo buscamos por parámetro en la URL
        const grupo = await db.Grupo.findOne({ where: { id: id, admin_id: req.user.id } });
        if (!grupo) return res.status(404).json({ message: "Grupo no encontrado" });
        res.status(200).json(grupo);
    } catch (error) {
        res.status(500).json({ message: "Error al obtener el detalle del grupo" });
    }
};