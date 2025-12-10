// models/Tarea.js
import { DataTypes } from 'sequelize';

export default (sequelize) => {
    const Tarea = sequelize.define('Tarea', {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        sesion_id: { type: DataTypes.INTEGER, allowNull: false }, // Clave foránea
        nombre: { type: DataTypes.STRING, allowNull: false },
        fecha_programada: { type: DataTypes.DATEONLY, allowNull: false },
        duracion_estimada: { type: DataTypes.INTEGER, defaultValue: 60 },
        tiempo_total_requerido: { type: DataTypes.INTEGER, defaultValue: 0 },
        tiempo_real_ejecucion: { type: DataTypes.INTEGER, defaultValue: 0 },
        es_completada: { type: DataTypes.BOOLEAN, defaultValue: false },
        feedback_dominio: { type: DataTypes.STRING, defaultValue: 'Regular' },
        creado_en: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
        actualizado_en: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
    }, {
        tableName: 'tareas',
        timestamps: false
    });

    // Asociación con Sesion (muchos a uno)
    Tarea.associate = function(models) {
        Tarea.belongsTo(models.Sesion, { foreignKey: 'sesion_id', as: 'sesiones' });
    };

    return Tarea;
};