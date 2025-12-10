import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import * as sesionesController from '../controllers/sesionesController.js';

const router = express.Router();

// =======================================================
// RUTAS PARA SESIONES (SOLO ACCESIBLES CON TOKEN VÁLIDO)
// =======================================================

// 1. OBTENER todas las sesiones del usuario ACTUAL
router.get('/user/:UserId', protect, sesionesController.obtenerTodasLasSesionesUsuario);

// 2. OBTENER todas las sesiones (admin o testing)
router.get('/', protect, sesionesController.obtenerTodasLasSesiones);

// 3. CREAR una nueva sesión con sus tareas
router.post('/', protect, sesionesController.crearSesion);

// 4. OBTENER una sesión específica por ID
router.get('/:id', protect, sesionesController.obtenerSesionPorId);

// 5. ELIMINAR una sesión completa
router.delete('/:id', protect, sesionesController.eliminarSesionCompleta);

// 6. OBTENER la sesión activa
router.get('/sesion-activa/actual', protect, sesionesController.obtenerSesionActiva);

// 7. OBTENER tarea del día actual
router.get('/tarea-del-dia/actual', protect, sesionesController.obtenerTareaDelDia);

// 8. VALIDAR fecha de examen
router.post('/validar-fecha', protect, sesionesController.validarFechaExamen);

// =======================================================
// RUTAS PARA TAREAS (CONTENIDO DE LAS SESIONES)
// =======================================================

// 9. GESTIONAR una tarea específica
router.post('/tareas/:id/gestionar', protect, sesionesController.gestionarTarea);

// 10. ELIMINAR una tarea específica
router.delete('/tareas/:id', protect, sesionesController.eliminarTarea);

// 11. OBTENER una tarea específica por ID
router.get('/tareas/:id', protect, sesionesController.obtenerTareaPorId);

export default router;