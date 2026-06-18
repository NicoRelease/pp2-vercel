import db from '../models/index.js';

// 1. OBTENER TODOS LOS GRUPOS (Para el listado de la izquierda)
export const getAllMyGroups = async (req, res) => {
    console.log ("Datos del body",req.params.id);
    try {
        // Corrección: Validar que req.user.id sea un número válido
        const admin_id = parseInt(req.params.id);
        
        // Verificar que la conversión fue exitosa
        if (isNaN(admin_id)) {
            return res.status(400).json({ 
                message: "ID de administrador inválido" 
            });
        }
        
        const grupos = await db.Grupo.findAll({ 
            where: { admin_id: admin_id },
            order: [['created_at', 'DESC']],
            include: [{
                model: db.GrupoLista,
                attributes: ['email', 'grupo_id'],
                as: 'emails'
            }]
        });
        
        // Procesar los resultados para incluir los emails en formato adecuado
        const gruposConEmails = grupos.map(grupo => {
            const grupoData = grupo.toJSON();
            const emails = grupoData.emails ? grupoData.emails.map(emailObj => emailObj.email) : [];
            return {
                ...grupoData,
                emails: emails // Añadir el campo emails como array
            };
        });
        
        res.status(200).json(gruposConEmails);
    } catch (error) {
        console.error("Error al listar grupos:", error);
        res.status(500).json({ message: "Error al obtener la lista de grupos" });
    }
};

// 2. CREAR O ACTUALIZAR
export const manageGroup = async (req, res) => {
    console.log ("Datos del body",req.body);
    try {
        const { id, nombre_grupo, emails, admin_id } = req.body;
        

        if (id) {
            // --- MODO EDICIÓN ---
            const grupo = await db.Grupo.findOne({ where: { id: id, admin_id: admin_id } });
            if (!grupo) return res.status(404).json({ message: "Grupo no encontrado." });

            grupo.nombre_grupo = nombre_grupo;
            await grupo.save();
            
            // Actualizar lista de emails
            await db.GrupoLista.destroy({ where: { grupo_id: id } });
            
            if (emails && emails.length > 0) {
                try {
                    const emailList = emails.map(email => ({
                        email: email.trim().toLowerCase(),
                        grupo_id: id
                    }));
                    await db.GrupoLista.bulkCreate(emailList);
                } catch (error) {
                    console.error("Error al actualizar emails del grupo:", error);
                    return res.status(500).json({ message: "Error al actualizar los emails del grupo. Posiblemente exista algún correo duplicado." });
                }
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
        const grupo = await db.Grupo.findOne({ 
            where: { id: id, admin_id: req.user.id },
            include: [{
                model: db.GrupoLista,
                attributes: ['email', 'grupo_id'],
                as: 'emails'
            }]
        });
        
        if (!grupo) return res.status(404).json({ message: "Grupo no encontrado" });
        
        const grupoData = grupo.toJSON();
        const emails = grupoData.emails ? grupoData.emails.map(emailObj => emailObj.email) : [];
        
        res.status(200).json({
            ...grupoData,
            emails: emails
        });
    } catch (error) {
        res.status(500).json({ message: "Error al obtener el detalle del grupo" });
    }
};

// 4. ELIMINAR GRUPO
export const deleteGroup = async (req, res) => {
    try {
        const { id } = req.params;
        const admin_id = req.user.id;

        // Verificar que el grupo exista y pertenezca al administrador
        const grupo = await db.Grupo.findOne({ 
            where: { id: id, admin_id: admin_id }
        });
        
        if (!grupo) {
            return res.status(404).json({ message: "Grupo no encontrado" });
        }

        // Eliminar los registros asociados en GrupoLista (emails)
        await db.GrupoLista.destroy({ 
            where: { grupo_id: id } 
        });

        // Eliminar el grupo principal
        await db.Grupo.destroy({ 
            where: { id: id, admin_id: admin_id } 
        });

        res.status(200).json({ message: "Grupo eliminado con éxito" });
    } catch (error) {
        console.error("Error al eliminar grupo:", error);
        res.status(500).json({ message: "Error al eliminar el grupo" });
    }
};

// 5. OBTENER USUARIOS POR ID DE GRUPO
export const getGroupById = async (req, res) => {
    
    try {
        const { group_id } = req.params;
       
        
        // Verificar que el grupo exista
        const grupo = await db.Grupo.findOne({ 
            where: { id: group_id }
        });
        
        if (!grupo) {
            return res.status(404).json({ message: "Grupo no encontrado" });
        }

        // Obtener todos los usuarios (usuarios de la base de datos) que pertenecen a este grupo
        // Primero obtenemos los emails del grupo
        const emails = await db.GrupoLista.findAll({
            where: { grupo_id: group_id },
            attributes: ['email']
        });
        
        // Si no hay emails en el grupo, devolvemos un array vacío
        if (!emails || emails.length === 0) {
            return res.status(200).json({ 
                grupo: grupo.toJSON(),
                usuarios: []
            });
        }
        
        // Obtener los usuarios que tienen estos emails
        const usuarios = await db.User.findAll({
            where: {
                email: emails.map(email => email.email)
            },
            attributes: ['id']
        });

        res.status(200).json({ 
            grupo: grupo.toJSON(),
            usuarios: usuarios.map(usuario => usuario.toJSON())
            
        });
        
    } catch (error) {
        console.error("Error al obtener usuarios por ID de grupo:", error);
        res.status(500).json({ message: "Error al obtener los usuarios del grupo" });
    }
    
};