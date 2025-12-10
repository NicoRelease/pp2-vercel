import db from '../models/index.js';

const sequelize = db.sequelize;
const Op = db.Sequelize.Op;
const Sesion = db.Sesion;
const Tarea = db.Tarea;

// Factores de dificultad (Usados también en el hook beforeValidate de Tarea)
const DIFICULTAD_FACTORES = [0.6, 0.8, 1.0, 1.4, 1.7];

// Función auxiliar para calcular días entre fechas
const diasEntre = (start, end) => {
    const oneDay = 1000 * 60 * 60 * 24;
    const diffTime = new Date(end) - new Date(start);
    // +1 para incluir el día de inicio
    return Math.round(diffTime / oneDay) + 1; 
};

// =======================================================
// EXPORTACIONES DEL CONTROLADOR
// (Cambiado de 'exports.función' a 'export const función')
// =======================================================

// --- CRUD BÁSICO DE SESIONES ---

export const obtenerTodasLasSesionesUsuario = async (req, res) => {
    try {
        console.log("🔍 Obtener todas las sesiones para el usuario solicitado");
        console.log("🔍 req.params.UserId:", req.params.UserId);
        
        // ✅ USAR req.params.UserId de la URL
        const user_id = req.params.UserId;
        
        if (!user_id) {
            return res.status(400).json({ 
                error: 'ID de usuario no proporcionado en la URL' 
            });
        }
        
        console.log(`🔍 Buscando sesiones para user_id: ${user_id}`);
        
        const sesiones = await Sesion.findAll({
            where: {
                user_id: user_id
            },
            include: [{ model: Tarea, as: 'tareas' }],
            order: [
                ['fecha_examen', 'ASC'],
                [{ model: Tarea, as: 'tareas' }, 'fecha_programada', 'ASC']
            ]
        });

        console.log(`✅ Encontradas ${sesiones.length} sesiones para usuario ${user_id}`);
        res.json(sesiones);
        
    } catch (error) {
        console.error("❌ Error al obtener sesiones por usuario:", error);
        res.status(500).json({ 
            message: 'Error al obtener sesiones.', 
            error: error.message 
        });
    }
};

export const crearSesion = async (req, res) => {
    const { user_id, nombre, fecha_examen, duracion_diaria_estimada } = req.body;
    console.log("📥 Datos recibidos para crear sesión:", req.body);
    if (!user_id || !nombre || !fecha_examen || !duracion_diaria_estimada) {
        return res.status(400).json({
            message: "Faltan campos obligatorios: user_id, nombre, fecha_examen, duracion_diaria_estimada"
        });
    }
    
    const t = await sequelize.transaction();

    try {
        const fechaExamenDate = new Date(fecha_examen).toISOString().split('T')[0];
        const fechaInicio = new Date().toISOString().split('T')[0];
        
        if (fechaExamenDate < fechaInicio) {
            await t.rollback();
            return res.status(400).json({
                message: "La fecha de examen debe ser hoy o futura."
            });
        }

        const diasTotales = diasEntre(fechaInicio, fechaExamenDate);
        const diasDisponibles = diasTotales > 1 ? diasTotales - 1 : 1; 
        
        const duracionTotalEstimada = duracion_diaria_estimada * diasDisponibles;

        const nuevaSesion = await Sesion.create({
            user_id,
            nombre,
            fecha_examen: fechaExamenDate,
            duracion_diaria_estimada: duracion_diaria_estimada,
            duracion_total_estimada: duracionTotalEstimada,
            es_completada: false,
            fecha_programada: fechaInicio,
        }, { transaction: t });

        let tiempoRestante = duracionTotalEstimada;
        let tareasProgramadas = [];
        let fechaActual = new Date(fechaInicio);
        
        for (let i = 0; i < diasDisponibles; i++) {
            if (tiempoRestante <= 0) break;

            const duracionProgramada = Math.min(
                duracion_diaria_estimada, 
                tiempoRestante 
            );
            
            tareasProgramadas.push({
                sesion_id: nuevaSesion.id,
                nombre: `Tarea Día ${i + 1} de ${nombre}`, 
                fecha_programada: new Date(fechaActual).toISOString().split('T')[0],
                duracion_estimada: duracionProgramada,
                es_completada: false,
            });

            tiempoRestante -= duracionProgramada;
            fechaActual.setDate(fechaActual.getDate() + 1); 
        }
        
        await Tarea.bulkCreate(tareasProgramadas, { transaction: t });
        await t.commit();

        res.status(201).json({
            message: "Sesión y tareas diarias creadas exitosamente",
            sesion: nuevaSesion,
            tareasCreadas: tareasProgramadas.length
        });

    } catch (error) {
        await t.rollback();
        console.error("Error al crear sesión:", error);
        res.status(500).json({ 
            message: "Error interno al crear sesión", 
            error: error.message 
        });
    }
};

export const validarFechaExamen = async (req, res) => {
    const { fecha_examen } = req.body;

    if (!fecha_examen) {
        return res.status(400).json({ 
            valida: false,
            message: "La fecha es requerida" 
        });
    }

    try {
        const hoy = new Date();
        const fechaExamen = new Date(fecha_examen);
        
        hoy.setHours(0, 0, 0, 0);
        fechaExamen.setHours(0, 0, 0, 0);
        
        if (fechaExamen < hoy) {
            return res.status(200).json({
                valida: false,
                message: "La fecha de examen no puede ser pasada. Debe ser hoy o una fecha futura."
            });
        }

        return res.status(200).json({
            valida: true,
            message: "Fecha válida"
        });

    } catch (error) {
        console.error("Error al validar fecha:", error);
        res.status(500).json({ 
            valida: false,
            message: "Error al validar la fecha",
            error: error.message 
        });
    }
};

export const obtenerTodasLasSesiones = async (req, res) => {
    try {
        const sesiones = await Sesion.findAll({
            include: [{ model: Tarea, as: 'tareas' }],
            order: [
                ['fecha_examen', 'ASC'],
                [{ model: Tarea, as: 'tareas' }, 'fecha_programada', 'ASC']
            ]
        });

        res.status(200).json(sesiones);
    } catch (error) {
        console.error("Error al obtener sesiones:", error);
        res.status(500).json({ message: "Error interno al obtener sesiones", error: error.message });
    }
};

export const obtenerSesionPorId = async (req, res) => {
    try {
        const { id } = req.params;
        const sesion = await Sesion.findByPk(id, {
            include: [{ model: Tarea, as: 'tareas' }]
        });

        if (!sesion) {
            return res.status(404).json({ message: "Sesión no encontrada" });
        }

        res.status(200).json(sesion);
    } catch (error) {
        console.error("Error al obtener sesión:", error);
        res.status(500).json({ message: "Error interno al obtener sesión", error: error.message });
    }
};

export const eliminarSesionCompleta = async (req, res) => {
    const { id } = req.params;
    const t = await sequelize.transaction();

    try {
        // Asumiendo que has configurado la asociación con ON DELETE CASCADE, esto podría ser suficiente,
        // pero es más seguro eliminar explícitamente si no estás seguro de la configuración de la DB.
        await Tarea.destroy({
            where: { sesion_id: id },
            transaction: t
        });

        const eliminadas = await Sesion.destroy({
            where: { id: id },
            transaction: t
        });

        if (eliminadas === 0) {
            await t.rollback();
            return res.status(404).json({ message: "Sesión no encontrada" });
        }

        await t.commit();
        res.status(204).send();

    } catch (error) {
        await t.rollback();
        console.error("Error al eliminar sesión:", error);
        res.status(500).json({ message: "Error interno al eliminar sesión", error: error.message });
    }
};

export const obtenerSesionActiva = async (req, res) => {
    try {
        const hoy = new Date().toISOString().split('T')[0];
        const userId = req.user.id;

        const sesionActual = await Sesion.findOne({
            where: {
                user_id: userId, // ⬅️ Filtro por usuario
                es_completada: false,
                fecha_examen: { [Op.gte]: hoy }
            },
            include: [{ model: Tarea, as: 'tareas' }],
            order: [['fecha_examen', 'ASC']]
        });

        const historial = await Sesion.findAll({
            where: {
                user_id: userId, // ⬅️ Filtro por usuario
                es_completada: true
            },
            include: [{ model: Tarea, as: 'tareas' }],
            order: [['fecha_examen', 'DESC']],
            limit: 10
        });

    
        res.status(200).json({
            sesionActual,
            historial
        });

    } catch (error) {
        console.error("Error al obtener sesión activa:", error);
        res.status(500).json({ message: "Error interno al obtener sesión activa", error: error.message });
    }
};

export const gestionarTarea = async (req, res) => {
    const { id } = req.params;
    const { action, tiempo_ejecutado } = req.body;

    if (!['start', 'pause', 'stop'].includes(action)) {
        return res.status(400).json({ message: "Acción no válida. Use: start, pause, o stop" });
    }

    const t = (action === 'stop') ? await sequelize.transaction() : null;

    try {
        const tarea = await Tarea.findByPk(id, { 
            include: [{ model: Sesion, as: 'sesion' }],
            transaction: t 
        });

        if (!tarea) {
            if (t) await t.rollback();
            return res.status(404).json({ message: "Tarea no encontrada" });
        }

        const updates = {};

        if (action === 'start') {
            updates.tiempo_real_ejecucion = tiempo_ejecutado;
        } else if (action === 'pause') {
            updates.tiempo_real_ejecucion = tiempo_ejecutado;
        } else if (action === 'stop') {
            updates.tiempo_real_ejecucion = tiempo_ejecutado;
            updates.es_completada = true;
            updates.feedback_dominio = 'Todo';
        }

        await tarea.update(updates, { transaction: t });

        if (t) await t.commit();

        const tareaActualizada = await Tarea.findByPk(id, {
            include: [{ model: Sesion, as: 'sesion' }]
        });

        res.status(200).json({ 
            tarea: tareaActualizada 
        });

    } catch (error) {
        if (t) await t.rollback();
        console.error("Error al gestionar tarea:", error);
        res.status(500).json({ message: "Error interno al gestionar tarea", error: error.message });
    }
};

export const eliminarTarea = async (req, res) => {
    const { id } = req.params;
    const t = await sequelize.transaction();

    try {
        const tarea = await Tarea.findByPk(id, { transaction: t });

        if (!tarea) {
            await t.rollback();
            return res.status(404).json({ message: "Tarea no encontrada" });
        }

        await Tarea.destroy({
            where: { id: id },
            transaction: t
        });

        await t.commit();
        res.status(204).send();

    } catch (error) {
        await t.rollback();
        console.error("Error al eliminar tarea:", error);
        res.status(500).json({ message: "Error interno al eliminar tarea", error: error.message });
    }
};

export const obtenerTareaPorId = async (req, res) => {
    try {
        const { id } = req.params;
        const tarea = await Tarea.findByPk(id, {
            include: [{ model: Sesion, as: 'sesion' }]
        });

        if (!tarea) {
            return res.status(404).json({ message: "Tarea no encontrada" });
        }

        res.status(200).json(tarea);
    } catch (error) {
        console.error("Error al obtener tarea:", error);
        res.status(500).json({ message: "Error interno al obtener tarea", error: error.message });
    }
};

export const obtenerTareaDelDia = async (req, res) => {
    try {
        const hoy = new Date().toISOString().split('T')[0];
        const userId = req.user.id;
        
        const sesionActiva = await Sesion.findOne({
            where: {
                user_id: userId, // ⬅️ Filtro por usuario
                es_completada: false,
                fecha_examen: { [Op.gte]: hoy }
            },
            include: [{ model: Tarea, as: 'tareas' }],
            order: [['fecha_examen', 'ASC']]
        });

        if (!sesionActiva) {
            return res.status(200).json({ 
                tieneSesiones: false,
                message: "No hay sesiones activas.",
                tarea: null,
                sesion: null
            });
        }

        const tareaHoy = await Tarea.findOne({
            where: {
                sesion_id: sesionActiva.id,
                fecha_programada: hoy, // ⬅️ CORREGIDO: Usar fecha_programada
                es_completada: false
            },
            include: [{ model: Sesion, as: 'sesion' }],
            order: [['id', 'ASC']]
        });

        if (!tareaHoy) {
            const proximaTarea = await Tarea.findOne({
                where: {
                    sesion_id: sesionActiva.id,
                    fecha_programada: { [Op.gte]: hoy }, // ⬅️ CORREGIDO: Usar fecha_programada
                    es_completada: false
                },
                include: [{ model: Sesion, as: 'sesion' }],
                order: [
                    ['fecha_programada', 'ASC'],
                    ['id', 'ASC']
                ]
            });

            return res.status(200).json({
                tieneSesiones: true,
                message: "No hay tareas para hoy. Próxima tarea disponible.",
                tarea: proximaTarea,
                sesion: sesionActiva
            });
        }

        res.status(200).json({
            tieneSesiones: true,
            message: "Tarea del día encontrada",
            tarea: tareaHoy,
            sesion: sesionActiva
        });

    } catch (error) {
        console.error("Error al obtener tarea del día:", error);
        res.status(500).json({ 
            message: "Error interno al obtener tarea del día", 
            error: error.message 
        });
    }
};