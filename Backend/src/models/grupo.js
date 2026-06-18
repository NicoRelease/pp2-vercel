// Backend/src/models/grupo.js
import { DataTypes } from 'sequelize';

export default (sequelize) => {
    return sequelize.define('Grupo', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        nombre_grupo: {
            type: DataTypes.STRING,
            allowNull: false
        },
        admin_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        }
    }, {
        tableName: 'grupo',
        timestamps: false
    });
};
