import * as SesionesService from '../services/SesionesService.js';

export const obtenerTodasLasSesionesUsuario = async (req, res) => {
    
    try {
        const user_id = req.params.UserId;
        
        if (!user_id) return res.status(400).json({ error: 'ID de usuario no proporcionado' });
        
        const sesiones = await SesionesService.obtenerSesionesPorUsuario(user_id);
        res.json(sesiones);
        
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener sesiones.', error: error.message });
    }
};

export const crearSesion = async (req, res) => {
    try {
        const { user_id, nombre, fecha_examen, duracion_diaria_estimada } = req.body;
        
        if (!user_id || !nombre || !fecha_examen || !duracion_diaria_estimada) {
            return res.status(400).json({ message: "Faltan campos obligatorios" });
        }
        const result = await SesionesService.crearNuevaSesion(req.body);
        res.status(201).json({
            message: "Sesión y tareas diarias creadas exitosamente",
            sesion: result.nuevaSesion,
            tareasCreadas: result.tareasCount
        });
    } catch (error) {
        res.status(500).json({ message: "Error al crear sesión", error: error.message });
    }
};

export const validarFechaExamen = async (req, res) => {
    const { fecha_examen } = req.body;
    if (!fecha_examen) return res.status(400).json({ valida: false, message: "La fecha es requerida" });
    try {
        const hoy = new Date();
        const fechaEx = new Date(fecha_examen);
        hoy.setHours(0, 0, 0, 0);
        fechaEx.setHours(0, 0, 0, 0);
        
        if (fechaEx < hoy) return res.status(200).json({ valida: false, message: "La fecha debe ser hoy o futura." });
        return res.status(200).json({ valida: true, message: "Fecha válida" });
    } catch (error) {
        res.status(500).json({ valida: false, message: "Error al validar la fecha", error: error.message });
    }
};

export const obtenerTodasLasSesiones = async (req, res) => {
    try {
        const sesiones = await SesionesService.listarSesionesFull();
        res.status(200).json(sesiones);
    } catch (error) {
        res.status(500).json({ message: "Error al obtener sesiones", error: error.message });
    }
};

export const obtenerSesionesPorGrupoIdService = async (userId) => {
    return await SesionesService.obtenerSesionesPorGrupoIdService(userId);
}

export const obtenerSesionPorId = async (req, res) => {
    try {
        const sesion = await SesionesService.buscarSesionId(req.params.id);
        if (!sesion) return res.status(404).json({ message: "Sesión no encontrada" });
        res.status(200).json(sesion);
    } catch (error) {
        res.status(500).json({ message: "Error al obtener sesión", error: error.message });
    }
};

export const actualizarSesion = async (req, res) => {
    try {
        // Solo permitimos actualizar campos específicos para seguridad
        const allowedFields = ['nombre', 'fecha_examen', 'duracion_total_estimada', 'es_completada'];
        
        const dataToUpdate = {};
        for (const key of Object.keys(req.body)) {
            if (allowedFields.includes(key)) {
                dataToUpdate[key] = req.body[key];
            }
        }

        // Usamos el servicio para actualizar. El middleware checkOwnership ya verificó propiedad.
        const updatedSesion = await SesionesService.actualizarSesion(req.params.id, dataToUpdate);
        
        res.status(200).json({ message: 'Sesión actualizada correctamente', sesion: updatedSesion });
    } catch (error) {
        console.error('[actualizarSesion] Error:', error.message);
        // Si es un campo no válido o error de BD
        if (error.name === 'SequelizeValidationError') {
            return res.status(400).json({ message: 'Error de validación', errors: error.errors });
        }
        res.status(500).json({ message: "Error al actualizar sesión", error: error.message });
    }
};

export const eliminarSesionCompleta = async (req, res) => {
    try {
        await SesionesService.borrarSesionCompleta(req.params.id);
        res.status(204).send();
    } catch (error) {
        const status = error.message === "Sesión no encontrada" ? 404 : 500;
        res.status(status).json({ message: error.message });
    }
};

export const obtenerSesionActiva = async (req, res) => {
    try {
        const result = await SesionesService.buscarSesionActivaYHistorial(req.user.id);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: "Error al obtener sesión activa", error: error.message });
    }
};

export const gestionarTarea = async (req, res) => {
    const { action, tiempo_ejecutado, notas } = req.body;

    // Validación flexible: Si es 'note', no requiere acción de timer estricta ni tiempo válido
    if (!action && !notas) {
        return res.status(400).json({ message: "Acción o nota requerida." });
    }

    try {
        // Validar tiempo solo si es una acción de timer (start, pause, stop)
        let tiempoValido = 0;
        if (['start', 'pause', 'stop'].includes(action)) {
            if (typeof tiempo_ejecutado !== 'number' || isNaN(tiempo_ejecutado) || tiempo_ejecutado < 0) {
                return res.status(400).json({ message: "El campo 'tiempo_ejecutado' debe ser un número válido." });
            }
            tiempoValido = tiempo_ejecutado;
        }

        const tarea = await SesionesService.ejecutarGestionTarea(req.params.id, action || '', tiempoValido, notas);
        res.status(200).json({ tarea });
    } catch (error) {
        console.error('[gestionarTarea] Error:', error.message);
        const status = error.message === "Tarea no encontrada" ? 404 : 500;
        res.status(status).json({ message: error.message });
    }
};

export const eliminarTarea = async (req, res) => {
    try {
        await SesionesService.borrarTareaId(req.params.id);
        res.status(204).send();
    } catch (error) {
        const status = error.message === "Tarea no encontrada" ? 404 : 500;
        res.status(status).json({ message: error.message });
    }
};

export const obtenerTareaPorId = async (req, res) => {
    try {
        const tarea = await SesionesService.buscarTareaId(req.params.id);
        if (!tarea) return res.status(404).json({ message: "Tarea no encontrada" });
        res.status(200).json(tarea);
    } catch (error) {
        res.status(500).json({ message: "Error al obtener tarea", error: error.message });
    }
};

export const obtenerTareaDelDia = async (req, res) => {
    try {
        const result = await SesionesService.buscarTareaDiaService(req.user.id);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: "Error interno", error: error.message });
    }
};

export const obtenerSesionesPorGrupoId = async (req, res) => {
    try {
        // Corregir la obtención del group_id
        const group_id = req.params.group_id;  // El grupo viene como parámetro en la URL
        
        if (!group_id) {
            return res.status(400).json({ 
                message: "ID de grupo no proporcionado" 
            });
        }
        
        const result = await SesionesService.obtenerSesionesPorGrupoIdService(group_id);
        res.status(200).json(result);
    } catch (error) {
        console.error("Error en obtenerSesionesPorGrupoId:", error);
        res.status(500).json({ 
            message: "Error al obtener sesiones por grupo", 
            error: error.message 
        });
    }
};

export const actualizarNotasTarea = async (req, res) => {
    try {
        const { notas } = req.body;
        if (notas === undefined || notas === null) {
            return res.status(400).json({ message: "El campo 'notas' es requerido" });
        }
        if (typeof notas !== 'string' || notas.length > 10000) {
            return res.status(400).json({ message: "Las notas deben ser un string de máximo 10,000 caracteres" });
        }

        const tarea = await SesionesService.actualizarNotasTarea(req.params.id, notas);
        if (!tarea) {
            return res.status(404).json({ message: "Tarea no encontrada" });
        }
        res.status(200).json({ 
            message: "Nota guardada correctamente", 
            tarea 
        });
    } catch (error) {
        console.error("[actualizarNotasTarea] Error:", error.message);
        if (error.name === 'SequelizeValidationError') {
            return res.status(400).json({ message: 'Error de validación', errors: error.errors });
        }
        res.status(500).json({ message: "Error al guardar la nota", error: error.message });
    }
};
