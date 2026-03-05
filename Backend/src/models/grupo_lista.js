// Backend/src/models/grupo_lista.js
import { DataTypes } from 'sequelize';

export default (sequelize) => {
    return sequelize.define('GrupoLista', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false
        },
        grupo_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'grupo',
                key: 'id'
            }
        }
    }, {
        tableName: 'grupo_lista',
        timestamps: false
    });
};
