/**
 * Función para definir todas las asociaciones de Sequelize.
 * Se invoca desde index.js con todos los modelos inicializados.
 * * ESTRUCTURA: User (1) -> Sesión (N) -> Tarea (N)
 * * @param {object} models - Objeto que contiene todos los modelos de Sequelize (db.models)
 */
function defineAssociations(models) {
 
    const { User, Sesion, Tarea, Rol, Grupo, GrupoLista } = models;

    // ====================================================================
    // 1. RELACIÓN USER (1) -> SESION (N)
    // Clave foránea: 'user_id'
    // ====================================================================

    // Un Usuario tiene muchas Sesiones
    User.hasMany(Sesion, {
        foreignKey: 'user_id', 
        as: 'sesiones', 
        onDelete: 'CASCADE',
    });

    // Una Sesión pertenece a un Usuario
    Sesion.belongsTo(User, {
        foreignKey: 'user_id', 
        as: 'usuario', 
    });


    // ====================================================================
    // 2. RELACIÓN SESION (1) -> TAREA (N)
    // SOLUCIÓN AL ERROR: Esta asociación faltante causaba el EagerLoadingError.
    // Clave foránea: 'sesion_id'
    // ====================================================================

    // Una Sesión tiene muchas Tareas.
    Sesion.hasMany(Tarea, {
        foreignKey: 'sesion_id', // Esta FK está definida en el modelo Tarea.js
        as: 'tareas', // ¡Alias crucial para el include!
        onDelete: 'CASCADE',
    });

    // Una Tarea pertenece a una Sesión.
    Tarea.belongsTo(Sesion, {
        foreignKey: 'sesion_id', 
        as: 'sesion', 
    });

    // ====================================================================
    // 3. RELACIÓN USER (1) -> ROL (1)
    // Clave foránea: 'rol_id'
    // ====================================================================

    // Un Usuario pertenece a un Rol
    User.belongsTo(Rol, {
        foreignKey: 'rol_id',
        as: 'rol'
    });

    // ====================================================================
    // 4. RELACIÓN USER (1) -> GRUPO (1)
    // Clave foránea: 'group_id'
    // ====================================================================

    // Un Usuario pertenece a un Grupo
    User.belongsTo(Grupo, {
        foreignKey: 'group_id',
        as: 'grupo'
    });

    // ====================================================================
    // 5. RELACIÓN GRUPO (1) -> GRUPO_LISTA (N)
    // Clave foránea: 'grupo_id'
    // ====================================================================

    // Un Grupo tiene muchos integrantes (emails)
    Grupo.hasMany(GrupoLista, {
        foreignKey: 'grupo_id',
        as: 'emails', // Alias para el include
        onDelete: 'CASCADE',
    });

    // Un Integrante (email) pertenece a un Grupo
    GrupoLista.belongsTo(Grupo, {
        foreignKey: 'grupo_id',
        as: 'grupo',
    });
}

export default defineAssociations;
