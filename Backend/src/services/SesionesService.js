import db from '../models/index.js';

const sequelize = db.sequelize;
const Op = db.Sequelize.Op;
const Sesion = db.Sesion;
const Tarea = db.Tarea;

const diasEntre = (start, end) => {
    const oneDay = 1000 * 60 * 60 * 24;
    const diffTime = new Date(end) - new Date(start);
    return Math.round(diffTime / oneDay) + 1;
};

export const obtenerSesionesPorUsuario = async (userId) => {
    console.log("UserId dentro del service",userId)
    return await Sesion.findAll({
        where: { user_id: userId },
        include: [{ model: Tarea, as: 'tareas' }],
        order: [
            ['fecha_examen', 'ASC'],
            [{ model: Tarea, as: 'tareas' }, 'fecha_programada', 'ASC']
        ]
    });
};

export const crearNuevaSesion = async (datos) => {
    console.log("Datos recibidos en servicio para crear sesión:", datos);
    const { user_id, nombre, fecha_examen, duracion_diaria_estimada, group_id } = datos;
    const t = await sequelize.transaction();

    try {
        const fechaExamenDate = new Date(fecha_examen).toISOString().split('T')[0];
        const fechaInicio = new Date().toISOString().split('T')[0];
        
        if (fechaExamenDate < fechaInicio) {
            throw new Error("La fecha de examen debe ser hoy o futura.");
        }

        if (!group_id) {
            throw new Error("El usuario no pertenece a ningún grupo. Asigna un grupo al usuario primero.");
        }

        
        const diasTotales = diasEntre(fechaInicio, fechaExamenDate);
        const diasDisponibles = diasTotales > 1 ? diasTotales - 1 : 1;
        const duracionTotalEstimada = duracion_diaria_estimada * diasDisponibles;
        try {
            const nuevaSesion = await Sesion.create({
            user_id, 
            nombre, 
            fecha_examen: fechaExamenDate,
            //duracion_diaria_estimada, 
            duracion_total_estimada: duracionTotalEstimada,
            es_completada: false, 
            fecha_programada: fechaInicio,
            grupo_id: group_id
        }, { transaction: t });
        console.log("Datos de crear Sesión// Backend", nuevaSesion);
        let tiempoRestante = duracionTotalEstimada;
        let tareasProgramadas = [];
        let fechaActual = new Date(fechaInicio);

        for (let i = 0; i < diasDisponibles; i++) {
            if (tiempoRestante <= 0) break;
            const duracionProgramada = Math.min(duracion_diaria_estimada, tiempoRestante);
            
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
        return { nuevaSesion, tareasCount: tareasProgramadas.length };
        } catch (error) {
            console.log("Error al crear sesión o tareas:", error);
            await t.rollback();
            throw error;
        }
        
    } catch (error) {
        console.log("Error al crear sesión:", error); // Mover esta línea antes del throw
        await t.rollback();
        throw error;
    }
};



export const listarSesionesFull = async () => {
    return await Sesion.findAll({
        include: [{ model: Tarea, as: 'tareas' }],
        order: [
            ['fecha_examen', 'ASC'],
            [{ model: Tarea, as: 'tareas' }, 'fecha_programada', 'ASC']
        ]
    });
};

export const buscarSesionId = async (id) => {
    return await Sesion.findByPk(id, { include: [{ model: Tarea, as: 'tareas' }] });
};

export const borrarSesionCompleta = async (id) => {
    const t = await sequelize.transaction();
    try {
        await Tarea.destroy({ where: { sesion_id: id }, transaction: t });
        const eliminadas = await Sesion.destroy({ where: { id }, transaction: t });
        if (eliminadas === 0) throw new Error("Sesión no encontrada");
        await t.commit();
        return true;
    } catch (error) {
        await t.rollback();
        throw error;
    }
};

// Asegúrate de que esta función esté correctamente definida
// En SesionesService.js
export const obtenerSesionesPorGrupoIdService = async (group_id) => {
    try {
        if (!group_id || isNaN(group_id)) {
            throw new Error('ID de grupo inválido');
        }

        const sesiones = await db.Sesion.findAll({
            where: { grupo_id: group_id },
            include: [
                {
                    model: db.Tarea,
                    as: 'tareas'
                }
            ]
        });

        return sesiones;
    } catch (error) {
        console.error("Error en obtenerSesionesPorGrupoIdService:", error);
        throw error;
    }
};



export const buscarSesionActivaYHistorial = async (userId) => {
    const hoy = new Date().toISOString().split('T')[0];
    const sesionActual = await Sesion.findOne({
        where: { user_id: userId, es_completada: false, fecha_examen: { [Op.gte]: hoy } },
        include: [{ model: Tarea, as: 'tareas' }],
        order: [['fecha_examen', 'ASC']]
    });
    const historial = await Sesion.findAll({
        where: { user_id: userId, es_completada: true },
        include: [{ model: Tarea, as: 'tareas' }],
        order: [['fecha_examen', 'DESC']],
        limit: 10
    });
    return { sesionActual, historial };
};

export const ejecutarGestionTarea = async (id, action, tiempo_ejecutado) => {
    const t = (action === 'stop') ? await sequelize.transaction() : null;
    try {
        const tarea = await Tarea.findByPk(id, { include: [{ model: Sesion, as: 'sesion' }], transaction: t });
        if (!tarea) throw new Error("Tarea no encontrada");

        const updates = { tiempo_real_ejecucion: tiempo_ejecutado };
        if (action === 'stop') {
            updates.es_completada = true;
            updates.feedback_dominio = 'Todo';
        }
        await tarea.update(updates, { transaction: t });
        if (t) await t.commit();
        return await Tarea.findByPk(id, { include: [{ model: Sesion, as: 'sesion' }] });
    } catch (error) {
        if (t) await t.rollback();
        throw error;
    }
};

export const borrarTareaId = async (id) => {
    const t = await sequelize.transaction();
    try {
        const tarea = await Tarea.findByPk(id, { transaction: t });
        if (!tarea) throw new Error("Tarea no encontrada");
        await Tarea.destroy({ where: { id }, transaction: t });
        await t.commit();
    } catch (error) {
        await t.rollback();
        throw error;
    }
};

export const buscarTareaId = async (id) => {
    return await Tarea.findByPk(id, { include: [{ model: Sesion, as: 'sesion' }] });
};

export const buscarTareaDiaService = async (userId) => {
    const hoy = new Date().toISOString().split('T')[0];
    const sesionActiva = await Sesion.findOne({
        where: { user_id: userId, es_completada: false, fecha_examen: { [Op.gte]: hoy } },
        include: [{ model: Tarea, as: 'tareas' }],
        order: [['fecha_examen', 'ASC']]
    });

    if (!sesionActiva) return { tieneSesiones: false };

    let tarea = await Tarea.findOne({
        where: { sesion_id: sesionActiva.id, fecha_programada: hoy, es_completada: false },
        include: [{ model: Sesion, as: 'sesion' }],
        order: [['id', 'ASC']]
    });

    let message = "Tarea del día encontrada";
    if (!tarea) {
        tarea = await Tarea.findOne({
            where: { sesion_id: sesionActiva.id, fecha_programada: { [Op.gte]: hoy }, es_completada: false },
            include: [{ model: Sesion, as: 'sesion' }],
            order: [['fecha_programada', 'ASC'], ['id', 'ASC']]
        });
        message = "No hay tareas para hoy. Próxima tarea disponible.";
    }

    return { tieneSesiones: true, message, tarea, sesion: sesionActiva };
};