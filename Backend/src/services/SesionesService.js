import db from '../models/index.js';
import { Sequelize } from 'sequelize'; 
const sequelize = db.sequelize;
const Op = Sequelize.Op;
const Sesion = db.Sesion;
const Tarea = db.Tarea;

const diasEntre = (start, end) => {
    const oneDay = 1000 * 60 * 60 * 24;
    const diffTime = new Date(end) - new Date(start);
    return Math.round(diffTime / oneDay) + 1;
};

export const obtenerSesionesPorUsuario = async (userId) => {
    
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
            
            await t.rollback();
            throw error;
        }
        
    } catch (error) {
        ("Error al crear sesión:", error); // Mover esta línea antes del throw
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

export const ejecutarGestionTarea = async (id, action, tiempo_ejecutado, notas) => {
    const t = ['stop', 'pause', 'note'].includes(action) ? await sequelize.transaction() : null;
    try {
        const tarea = await Tarea.findByPk(id, { include: [{ model: Sesion, as: 'sesion' }], transaction: t });
        if (!tarea) throw new Error("Tarea no encontrada");

        // Inicializar updates con tiempo si es válido
        const updates = {};
        
        switch (action) {
            case 'start':
                // Opcional: solo registrar sin actualizar BD para evitar sobrecarga
                break;

            case 'pause':
                // Guardar tiempo en BD al pausar para persistencia entre sesiones/navegación
                if (typeof tiempo_ejecutado === 'number' && !isNaN(tiempo_ejecutado)) {
                    updates.tiempo_real_ejecucion = tiempo_ejecutado;
                }
                break;

            case 'stop':
                // Marcar como completada y guardar tiempo final
                updates.es_completada = true;
                updates.feedback_dominio = 'Todo';
                if (typeof tiempo_ejecutado === 'number') {
                    updates.tiempo_real_ejecucion = tiempo_ejecutado;
                }
                break;

            case 'note':
                // Actualizar solo las notas (máx 10,000 caracteres)
                if (typeof notas === 'string' && notas.length <= 10000) {
                    updates.notas = notas;
                } else {
                    throw new Error("Nota inválida o excede el límite de 10,000 caracteres");
                }
                break;

            default:
                // Si no hay acción válida pero llegó tiempo (compatibilidad), solo actualizar tiempo
                if (typeof tiempo_ejecutado === 'number') {
                    updates.tiempo_real_ejecucion = tiempo_ejecutado;
                }
                break;
        }

        // Solo ejecutar update si hay cambios pendientes
        if (Object.keys(updates).length > 0) {
            await tarea.update(updates, { transaction: t });
        }

        if (t && !t.finished) await t.commit();

        return await Tarea.findByPk(id, { include: [{ model: Sesion, as: 'sesion' }] });
    } catch (error) {
        if (t && !t.finished) await t.rollback();
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
export const actualizarSesion = async (sesionId, datos) => {
    const t = await sequelize.transaction();
    try {
        const sesion = await Sesion.findByPk(sesionId, { transaction: t });
        if (!sesion) throw new Error("Sesión no encontrada");

        // 1. Obtener tareas completadas para calcular tiempo ya invertido y fechas ocupadas
        const tareasCompletadas = await Tarea.findAll({ 
            where: { sesion_id: sesionId, es_completada: true }, 
            transaction: t 
        });
        const tiempoCompletado = tareasCompletadas.reduce((sum, tarea) => sum + (Number(tarea.duracion_estimada) || 0), 0);
        const fechasOcupadas = new Set(tareasCompletadas.map(t => t.fecha_programada)); // Fechas con tareas ya completadas

        // 2. Validar regla mínima: Mínimo 1 hora (60 min) O el tiempo ya completado, lo que sea mayor
        const minDuracion = Math.max(60, tiempoCompletado);
        const duracionTotal = datos.duracion_total_estimada || sesion.duracion_total_estimada;
        
        if (duracionTotal < minDuracion) {
            await t.rollback();
            throw new Error(`La duración debe ser al menos ${minDuracion} minutos (basado en tareas completadas o 1 hora base).`);
        }

        // Actualizar campos básicos de la sesión
        await sesion.update(datos, { transaction: t });

        let tareasRegeneradas = 0;
        
        // Si cambiaron la fecha o la duración total, recalculamos y regeneramos las tareas pendientes
        if (datos.fecha_examen || datos.duracion_total_estimada) {
            const hoy = new Date();
            hoy.setHours(0, 0, 0, 0);
            // Ajuste de zona horaria para la fecha de examen
            const rawExamDate = new Date(datos.fecha_examen || sesion.fecha_examen);
            const userTimezoneOffset = hoy.getTimezoneOffset() * 60000;
            const fechaExamenDate = new Date(rawExamDate.getTime() + userTimezoneOffset);
            
            // Validación estricta: fecha no puede ser menor a la actual
            if (fechaExamenDate < hoy) {
                await t.rollback();
                throw new Error("La fecha de examen no puede ser anterior al día de hoy.");
            }

            // Calcular días totales disponibles desde hoy hasta el nuevo examen
            const diffTime = fechaExamenDate - hoy;
            let diasDisponibles = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            if (diasDisponibles < 1) diasDisponibles = 1;

            // Descontar los días que ya tienen tareas completadas para obtener días reales disponibles para nuevas tareas
            const diasRealesDisponibles = Math.max(1, diasDisponibles - fechasOcupadas.size);

            // 3. Calcular nuevo tiempo diario basado en el tiempo pendiente restante distribuido equitativamente
            const tiempoPendiente = duracionTotal - tiempoCompletado;
            const nuevoTiempoDiario = Math.round(tiempoPendiente / diasRealesDisponibles);

            // Eliminar tareas incompletas anteriores para regenerar el plan de estudio
            await Tarea.destroy({ 
                where: { sesion_id: sesionId, es_completada: false }, 
                transaction: t 
            });

            const nuevasTareas = [];
            let fechaActual = new Date(hoy);
            let tareasGeneradas = 0;

            // Iterar día a día para generar solo las tareas que correspondan a los días disponibles reales
            while (tareasGeneradas < diasRealesDisponibles && fechaActual <= fechaExamenDate) {
                const fechaStr = new Date(fechaActual).toISOString().split('T')[0];
                
                // Si esta fecha YA tiene una tarea completada, la saltamos (no generamos nueva tarea para ese día)
                if (!fechasOcupadas.has(fechaStr)) {
                    nuevasTareas.push({
                        sesion_id: sesionId,
                        nombre: `Tarea Día ${tareasGeneradas + 1} de ${sesion.nombre}`,
                        fecha_programada: fechaStr,
                        duracion_estimada: nuevoTiempoDiario, // Usamos el nuevo cálculo equitativo
                        es_completada: false,
                    });
                    tareasGeneradas++;
                }
                
                // Avanzar al siguiente día
                fechaActual = new Date(fechaActual.getTime() + 24 * 60 * 60 * 1000);
            }

            if (nuevasTareas.length > 0) {
                await Tarea.bulkCreate(nuevasTareas, { transaction: t });
                tareasRegeneradas = nuevasTareas.length;
            }
        }


        await t.commit();

        return await Sesion.findByPk(sesionId, { 
            include: [{ model: Tarea, as: 'tareas' }] 
        });
    } catch (error) {
        if (t && !t.finished) await t.rollback();
        throw error;
    }
};