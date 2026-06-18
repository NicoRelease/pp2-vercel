import { jest } from '@jest/globals';

// 1. MOCK de la base de datos: Esto evita que Sequelize intente leer DATABASE_URL
jest.unstable_mockModule('../Backend/src/config/database.js', () => ({
    default: {
        define: jest.fn(),
        authenticate: jest.fn(),
    },
    sequelize: {
        define: jest.fn(),
        transaction: jest.fn(() => ({
            commit: jest.fn(),
            rollback: jest.fn(),
        })),
    }
}));

// 2. MOCK de los modelos: Simulamos el comportamiento de las tablas
jest.unstable_mockModule('../Backend/src/models/index.js', () => ({
    default: {
        Sesion: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            destroy: jest.fn(),
            findByPk: jest.fn(),
        },
        Tarea: {
            bulkCreate: jest.fn(),
            findByPk: jest.fn(),
            destroy: jest.fn(),
            findOne: jest.fn(),
        },
        sequelize: {
            transaction: jest.fn(() => ({
                commit: jest.fn(),
                rollback: jest.fn(),
            })),
        },
        Sequelize: { Op: { gte: Symbol('gte') } }
    }
}));

// 3. CARGA DINÁMICA: Importamos después de definir los mocks
const { 
    crearNuevaSesion, 
    obtenerSesionesPorUsuario, 
    buscarTareaDiaService, 
    borrarSesionCompleta 
} = await import("../Backend/src/services/SesionesService.js");
const { default: db } = await import('../Backend/src/models/index.js');

describe('Pruebas Unitarias - SesionesService', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    // TEST 1: Validación de Fecha (Lógica de Negocio Crítica)
    test('crearNuevaSesion debe lanzar un error si la fecha de examen es pasada', async () => {
        const datosPasados = {
            user_id: 1,
            nombre: 'Examen Test',
            fecha_examen: '2020-01-01',
            duracion_diaria_estimada: 2,
            group_id: 1
        };

        await expect(crearNuevaSesion(datosPasados))
            .rejects.toThrow("La fecha de examen debe ser hoy o futura.");
    });

    // TEST 2: Cálculo de Duración Total
    test('crearNuevaSesion debe calcular correctamente la duración total estimada', async () => {
        const hoy = new Date();
        const mañana = new Date(hoy);
        mañana.setDate(hoy.getDate() + 1);
        
        const datos = {
            user_id: 1,
            nombre: 'Final PP2',
            fecha_examen: mañana.toISOString().split('T')[0],
            duracion_diaria_estimada: 3,
            group_id: 1
        };

        db.Sesion.create.mockResolvedValue({ id: 100, ...datos });
        db.Tarea.bulkCreate.mockResolvedValue([]);

        await crearNuevaSesion(datos);

        expect(db.Sesion.create).toHaveBeenCalledWith(
            expect.objectContaining({
                duracion_total_estimada: expect.any(Number)
            }),
            expect.any(Object)
        );
    });

    // TEST 3: Listado de Sesiones
    test('obtenerSesionesPorUsuario debe llamar a findAll con el userId correcto', async () => {
        const userId = 45;
        db.Sesion.findAll.mockResolvedValue([]);
        await obtenerSesionesPorUsuario(userId);

        expect(db.Sesion.findAll).toHaveBeenCalledWith(
            expect.objectContaining({
                where: { user_id: userId }
            })
        );
    });

    // TEST 4: Búsqueda de Tarea del Día (Escenario sin sesión activa)
    test('buscarTareaDiaService debe retornar tieneSesiones: false si no hay sesión activa', async () => {
        db.Sesion.findOne.mockResolvedValue(null);

        const resultado = await buscarTareaDiaService(1);
        
        expect(resultado.tieneSesiones).toBe(false);
    });

    // TEST 5: Manejo de errores en eliminación
    test('borrarSesionCompleta debe lanzar error si la sesión no existe', async () => {
        db.Sesion.destroy.mockResolvedValue(0);

        await expect(borrarSesionCompleta(999))
            .rejects.toThrow("Sesión no encontrada");
    });

    // TEST 6: Validación de grupo (corrección del error encontrado)
    test('crearNuevaSesion debe lanzar error si no se proporciona group_id', async () => {
        const datosSinGrupo = {
            user_id: 1,
            nombre: 'Examen Test',
            fecha_examen: new Date().toISOString().split('T')[0],
            duracion_diaria_estimada: 2
            // Sin group_id - este debería lanzar el error
        };

        await expect(crearNuevaSesion(datosSinGrupo))
            .rejects.toThrow("El usuario no pertenece a ningún grupo. Asigna un grupo al usuario primero.");
    });

    // TEST 7: Creación exitosa de sesión
    test('crearNuevaSesion debe crear una sesión exitosamente', async () => {
        const hoy = new Date();
        const mañana = new Date(hoy);
        mañana.setDate(hoy.getDate() + 1);
        
        const datos = {
            user_id: 1,
            nombre: 'Examen Final',
            fecha_examen: mañana.toISOString().split('T')[0],
            duracion_diaria_estimada: 2,
            group_id: 1
        };

        db.Sesion.create.mockResolvedValue({ id: 101, ...datos });
        db.Tarea.bulkCreate.mockResolvedValue([]);

        const resultado = await crearNuevaSesion(datos);
        
        expect(resultado).toBeDefined();
        expect(db.Sesion.create).toHaveBeenCalledWith(
            expect.objectContaining({
                nombre: 'Examen Final'
            }),
            expect.any(Object)
        );
    });
});