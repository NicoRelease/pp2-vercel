import express from 'express';
import { protect, authorizeRoles, checkOwnership } from '../middleware/authMiddleware.js';
import * as sesionesController from '../controllers/sesionesController.js';

const router = express.Router();

// =======================================================
// RUTAS PARA SESIONES (SOLO ACCESIBLES CON TOKEN VÁLIDO)
// =======================================================

// 1. OBTENER todas las sesiones del usuario ACTUAL
router.get('/user/:UserId', protect, sesionesController.obtenerTodasLasSesionesUsuario);

// 2. OBTENER todas las sesiones (SOLO ADMIN - Rol 1)
router.get('/', protect, authorizeRoles(1), sesionesController.obtenerTodasLasSesiones);

// 3. CREAR una nueva sesión con sus tareas
router.post('/', protect, sesionesController.crearSesion);

// 4. OBTENER una sesión específica por ID
router.get('/:id', protect, sesionesController.obtenerSesionPorId);

// 5. ELIMINAR una sesión completa (Solo si es dueño o Admin)
router.delete('/:id', protect, checkOwnership('Sesion'), sesionesController.eliminarSesionCompleta);

// 6. ACTUALIZAR una sesión existente (PATCH/PUT - Solo si es dueño o Admin)
router.put('/:id', protect, checkOwnership('Sesion'), sesionesController.actualizarSesion);

// 6. OBTENER la sesión activa
router.get('/sesion-activa/actual', protect, sesionesController.obtenerSesionActiva);

// 7. OBTENER tarea del día actual
router.get('/tarea-del-dia/actual', protect, sesionesController.obtenerTareaDelDia);

// 8. VALIDAR fecha de examen
router.post('/validar-fecha', protect, sesionesController.validarFechaExamen);

// 9. Obtener sesiones por ID de grupo
router.get('/grupo/:group_id', protect, sesionesController.obtenerSesionesPorGrupoId);


// =======================================================
// RUTAS PARA TAREAS (CONTENIDO DE LAS SESIONES)
// =======================================================

// 10. GESTIONAR una tarea específica (Valida propiedad del recurso)
router.post('/tareas/:id/gestionar', protect, checkOwnership('Tarea'), sesionesController.gestionarTarea);

// 11. ELIMINAR una tarea específica (Valida propiedad del recurso)
router.delete('/tareas/:id', protect, checkOwnership('Tarea'), sesionesController.eliminarTarea);

// 12. OBTENER una tarea específica por ID
router.get('/tareas/:id', protect, sesionesController.obtenerTareaPorId);

export default router;