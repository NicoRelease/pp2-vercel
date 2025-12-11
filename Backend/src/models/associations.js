/**
 * Función para definir todas las asociaciones de Sequelize.
 * Se invoca desde index.js con todos los modelos inicializados.
 * * ESTRUCTURA: User (1) -> Sesión (N) -> Tarea (N)
 * * @param {object} models - Objeto que contiene todos los modelos de Sequelize (db.models)
 */
function defineAssociations(models) {
 
    const { User, Sesion, Tarea } = models;

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

}

export default defineAssociations;