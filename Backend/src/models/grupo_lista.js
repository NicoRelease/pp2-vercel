import { DataTypes } from 'sequelize';

export default (sequelize) => {
    return sequelize.define('GrupoLista', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        // Fecha de creación con valor por defecto now() como muestra tu esquema
        created_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
            field: 'created_at'
        },
        // El email del integrante del grupo
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            field: 'email'
        },
        // La clave foránea que apunta a la tabla 'grupo'
        grupo_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: 'grupo_id',
            references: {
                model: 'grupo',
                key: 'id'
            }
        }
    }, {
        tableName: 'grupo_lista',
        timestamps: false, // Desactivamos timestamps automáticos de Sequelize para usar 'created_at' manualmente
        underscored: true
    });
};