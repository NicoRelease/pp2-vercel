import { DataTypes } from 'sequelize';

export default (sequelize) => {
    return sequelize.define('Grupo', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        nombre: {
            type: DataTypes.STRING,
            allowNull: false
        },
        admin_id: {
            type: DataTypes.INTEGER,
            allowNull: true // El ID del usuario que crea el grupo
        }
    }, {
        tableName: 'grupo',
        timestamps: false
    });
};