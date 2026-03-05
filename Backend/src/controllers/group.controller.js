import db from '../models/index.js';

// Backend/src/controllers/group.controller.js

// 1. OBTENER TODOS LOS GRUPOS (Para el listado de la izquierda)
export const getAllMyGroups = async (req, res) => {
    try {
        const admin_id = req.user.id;
        const grupos = await db.Grupo.findAll({ 
            where: { admin_id: admin_id },
            order: [['created_at', 'DESC']]
        });
        res.status(200).json(grupos);
    } catch (error) {
        console.error("Error al listar grupos:", error);
        res.status(500).json({ message: "Error al obtener la lista de grupos" });
    }
};

// 2. CREAR O ACTUALIZAR
export const manageGroup = async (req, res) => {
    try {
        const { id, nombre_grupo, emails } = req.body;
        const admin_id = req.user.id;

        if (id) {
            // --- MODO EDICIÓN ---
            const grupo = await db.Grupo.findOne({ where: { id: id, admin_id: admin_id } });
            if (!grupo) return res.status(404).json({ message: "Grupo no encontrado." });

            grupo.nombre_grupo = nombre_grupo;
            await grupo.save();
            
            // Actualizar lista de emails
            await db.GrupoLista.destroy({ where: { grupo_id: id } });
            if (emails && emails.length > 0) {
                const emailList = emails.map(email => ({
                    email: email.trim().toLowerCase(),
                    grupo_id: id
                }));
                await db.GrupoLista.bulkCreate(emailList);
            }
            
            return res.status(200).json({ message: "Grupo actualizado con éxito", grupo });
        } else {
            // --- MODO CREACIÓN ---
            const nuevoGrupo = await db.Grupo.create({
                nombre_grupo,
                admin_id: admin_id
            });
            
            // Asociar emails si existen
            if (emails && emails.length > 0) {
                const emailList = emails.map(email => ({
                    email: email.trim().toLowerCase(),
                    grupo_id: nuevoGrupo.id
                }));
                await db.GrupoLista.bulkCreate(emailList);
            }
            
            return res.status(201).json({ message: "Grupo creado con éxito", grupo: nuevoGrupo });
        }
    } catch (error) {
        console.error("Error en manageGroup:", error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
};

// 3. OBTENER UNO SOLO
export const getMyGroup = async (req, res) => {
    try {
        const { id } = req.params;
        const grupo = await db.Grupo.findOne({ where: { id: id, admin_id: req.user.id } });
        if (!grupo) return res.status(404).json({ message: "Grupo no encontrado" });
        
        // Obtener los emails asociados
        const emails = await db.GrupoLista.findAll({ 
            where: { grupo_id: id },
            attributes: ['email']
        });
        
        res.status(200).json({
            ...grupo.dataValues,
            emails: emails.map(e => e.email)
        });
    } catch (error) {
        res.status(500).json({ message: "Error al obtener el detalle del grupo" });
    }
};
