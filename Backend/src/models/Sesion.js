// models/Sesion.js
import { DataTypes } from 'sequelize';

export default (sequelize) => {
    const Sesion = sequelize.define('Sesion', {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        user_id: { type: DataTypes.INTEGER, allowNull: false }, // Clave foránea
        nombre: { type: DataTypes.STRING, allowNull: false },
        fecha_examen: { type: DataTypes.DATEONLY, allowNull: true },
        duracion_total_estimada: { type: DataTypes.INTEGER, allowNull: false },
        es_completada: { type: DataTypes.BOOLEAN, defaultValue: false },
        creado_en: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
        actualizado_en: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
    }, {
        tableName: 'sesiones',
        timestamps: false
    });
    
    // Asociación con Tarea (uno a muchos)
    Sesion.associate = function(models) {
        Sesion.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
        Sesion.hasMany(models.Tarea, { foreignKey: 'sesion_id', as: 'tareas' });
    };

    return Sesion;
};