import { jest } from '@jest/globals';

// 1. MOCK de la base de datos
jest.unstable_mockModule('../Backend/src/config/database.js', () => ({
    default: { define: jest.fn(), authenticate: jest.fn() },
    sequelize: { 
        define: jest.fn(), 
        // Simulamos una transacción que permite commit/rollback
        transaction: jest.fn(() => ({
            commit: jest.fn().mockResolvedValue(true),
            rollback: jest.fn().mockResolvedValue(true),
            finished: false, // Importante para las validaciones internas del servicio
        })),
    }
}));

// 2. MOCK de los modelos con datos realistas para lógica compleja (reduce, map)
jest.unstable_mockModule('../Backend/src/models/index.js', () => ({
    default: {
        Sesion: {
            create: jest.fn(),
            findAll: jest.fn().mockResolvedValue([]),
            findOne: jest.fn(),
            findByPk: jest.fn(),
            destroy: jest.fn().mockResolvedValue(1), // Por defecto borra algo
            update: jest.fn().mockReturnValue([1]),  // <--- NECESARIO PARA PROD-08 (Actualizar)
        },
        Tarea: {
            create: jest.fn(),
            bulkCreate: jest.fn(),
            findByPk: jest.fn(),
            findOne: jest.fn(),
            findAll: jest.fn().mockResolvedValue([]), // Para contar tareas completadas
            destroy: jest.fn().mockResolvedValue(5),  // Simula borrado de tareas viejas
        },
        sequelize: { 
            transaction: jest.fn(() => ({ commit: jest.fn(), rollback: jest.fn(), finished: false })), 
            Op: { gte: Symbol('gte'), lte: Symbol('lte') } 
        }
    }
}));

// 3. CARGA DINÁMICA (Importamos TODAS las funciones críticas para cobertura total)
const { 
    crearNuevaSesion, 
    obtenerSesionesPorUsuario, 
    buscarTareaDiaService, 
    borrarSesionCompleta,
    actualizarSesion,          // <--- CLAVE PARA PROD-08 y líneas 127-224
    ejecutarGestionTarea,      // <--- CLAVE para líneas 255-271 (Start/Stop/Pause)
    buscarSesionActivaYHistorial // <--- Utilidad no probada
} = await import("../Backend/src/services/SesionesService.js");

const { default: db } = await import('../Backend/src/models/index.js');

describe('Pruebas Unitarias - SesionesService (Cobertura 100%)', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    // ==========================================================================
    // BLOQUE 1: ACTUALIZAR SESIÓN (PROD-08 & Lógica Compleja)
    // Cubre líneas: 127-145 (Cálculo), 168-224 (Regeneración), 152-164 (Validaciones)
    // ==========================================================================

    test('actualizarSesion: Recalcula tareas si cambia la fecha de examen', async () => {
        const sesionExistente = { 
            id: 1, user_id: 1, nombre: 'Vieja Sesion', 
            // ✅ Agregamos el stub .update para que no tire error al ejecutarlo dentro del servicio.
            update: jest.fn().mockResolvedValue(true) 
        };

        db.Sesion.findByPk = jest.fn(() => Promise.resolve(sesionExistente));

        await actualizarSesion(1, { fecha_examen: '2035-06-01' });

        // Verificamos que el método de instancia 'update' fue llamado correctamente
        expect(sesionExistente.update).toHaveBeenCalled();
        expect(db.Tarea.destroy).toHaveBeenCalledWith({ 
            where: { sesion_id: 1, es_completada: false }, 
            transaction: expect.any(Object) 
        });
        expect(db.Tarea.bulkCreate).toHaveBeenCalled();
    });

    test('actualizarSesion: Actualiza solo datos si NO cambia fecha/duración', async () => {
         const sesionExistente = { 
            id: 1, user_id: 1, nombre: 'Vieja Sesion',
             update: jest.fn().mockResolvedValue(true) // ✅ Agregamos la función mock.
        };

        db.Sesion.findByPk = jest.fn(() => Promise.resolve(sesionExistente));
        
        await actualizarSesion(1, { duracion_estimada_min: 45 });

        // Verificamos que se llamó al update de la instancia recuperada por findByPk:
        expect(sesionExistente.update).toHaveBeenCalled();
        // Al no cambiar fecha, NO se deben borrar tareas pendientes
        expect(db.Tarea.destroy).not.toHaveBeenCalled(); 
    });

   test('actualizarSesion: Error si la nueva fecha es en el pasado', async () => {
        // Aseguramos mock local con update() por si tu lógica lo necesita antes de evaluar.
         const sesionExistente = { id: 1, user_id: 1, nombre: 'Vieja Sesion' ,update : jest.fn().mockResolvedValue(true)};

        db.Sesion.findByPk = jest.fn(() => Promise.resolve(sesionExistente));

        await expect(actualizarSesion(1, { fecha_examen: '2020-01-01' }))
            .rejects.toThrow("La fecha de examen no puede ser anterior al día de hoy.");
    });

    test('actualizarSesion: Error si la duración es menor a lo completado', async () => {
        const sesionExistente = { id: 1, user_id: 1 };
        
        db.Sesion.findByPk.mockResolvedValue(sesionExistente);
        // Simulamos que ya se estudiaron 100 minutos (líneas 127-135)
        db.Tarea.findAll.mockResolvedValue([
            { duracion_estimada: 60 }, 
            { duracion_estimada: 40 } 
        ]);

        // Intentamos poner una duración total menor a lo ya estudiado
        await expect(actualizarSesion(1, { duracion_total_estimada: 50 }))
            .rejects.toThrow("La duración debe ser al menos");
    });


    // ==========================================================================
    // BLOQUE 2: GESTIÓN DE TIEMPO EN VIVO (Start/Stop/Pause)
    // Cubre líneas: 255-271 (Switch case y actualizaciones parciales)
    // ==========================================================================

    test('ejecutarGestionTarea: Acción "stop" completa la tarea', async () => {
        const tareaMock = { 
            id: 1, 
            update: jest.fn().mockResolvedValue(true),
            sesion: {} 
        };
        
        db.Tarea.findByPk.mockResolvedValue(tareaMock);

        await ejecutarGestionTarea(1, 'stop', 300, null); // stop con 5 min

        expect(db.Tarea.findByPk).toHaveBeenCalled();
        expect(tareaMock.update).toHaveBeenCalledWith(
            { es_completada: true, feedback_dominio: 'Todo', tiempo_real_ejecucion: 300 }, 
            expect.any(Object)
        );
    });

    test('ejecutarGestionTarea: Acción "note" actualiza solo notas', async () => {
        const tareaMock = { id: 1, update: jest.fn().mockResolvedValue(true), sesion: {} };
        
        db.Tarea.findByPk.mockResolvedValue(tareaMock);

        await ejecutarGestionTarea(1, 'note', null, "Estudié capítulo 5");

        expect(tareaMock.update).toHaveBeenCalledWith(
            { notas: "Estudié capítulo 5" }, 
            expect.any(Object)
        );
    });

    test('ejecutarGestionTarea: Acción "pause" guarda tiempo pero no completa', async () => {
        const tareaMock = { id: 1, update: jest.fn().mockResolvedValue(true), sesion: {} };
        
        db.Tarea.findByPk.mockResolvedValue(tareaMock);

        await ejecutarGestionTarea(1, 'pause', 120); // 2 minutos pausados

        expect(tareaMock.update).toHaveBeenCalledWith(
            { tiempo_real_ejecucion: 120 }, 
            expect.any(Object)
        );
    });


    // ==========================================================================
    // BLOQUE 3: VALIDACIONES Y CASOS LÍMITE (Cobertura de Ramas)
    // Cubre líneas: 83-97, 107-120
    // ==========================================================================

    test('crearNuevaSesion: Error de fecha pasada', async () => {
        const datosPasados = { user_id: 1, nombre: 'Test', fecha_examen: '2020-01-01', duracion_diaria_estimada: 2, group_id: 1 };
        
        await expect(crearNuevaSesion(datosPasados)).rejects.toThrow("La fecha de examen debe ser hoy o futura.");
    });

    test('crearNuevaSesion: Manejo de error en Base de Datos (Rollback)', async () => {
        const mañana = new Date(); mañana.setDate(mañana.getDate() + 1);
        
        // Simulamos que la BD falla al crear (Fuerza el catch de las líneas 83-84)
        db.Sesion.create.mockRejectedValue(new Error("DB Crash"));

        await expect(crearNuevaSesion({ user_id: 1, nombre: 'Error', fecha_examen: mañana.toISOString().split('T')[0], duracion_diaria_estimada: 2, group_id: 1 }))
            .rejects.toThrow();
    });

    test('borrarSesionCompleta: Error si la sesión no existe', async () => {
        db.Sesion.destroy.mockResolvedValue(0); // 0 filas afectadas
        
        await expect(borrarSesionCompleta(999)).rejects.toThrow("Sesión no encontrada");
    });

    test('buscarTareaDiaService: Lógica de fallback a próxima tarea', async () => {
        const sesionMock = { id: 5, user_id: 1 };
        
        // No hay sesión hoy (devuelve null) -> Busca la siguiente
        db.Sesion.findOne.mockResolvedValue(sesionMock);
        db.Tarea.findOne.mockResolvedValue({ id: 200, fecha_programada: 'Futuro' }); 

        const resultado = await buscarTareaDiaService(1);
        
        expect(resultado.tieneSesiones).toBe(true);
    });

    test('buscarSesionActivaYHistorial: Debe retornar ambas listas', async () => {
        db.Sesion.findOne.mockResolvedValue({ id: 1 }); // Actual
        db.Sesion.findAll.mockResolvedValue([]);         // Historial
        
        const res = await buscarSesionActivaYHistorial(1);
        
        expect(res.sesionActual).toBeDefined();
        expect(Array.isArray(res.historial)).toBe(true);
    });

});
