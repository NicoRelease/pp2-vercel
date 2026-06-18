import { DataTypes } from 'sequelize';

export default (sequelize) => {
    return sequelize.define('Whitelist', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        activo: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        },
        notas: {
            type: DataTypes.STRING
        }
    }, {
        tableName: 'whitelist',
        timestamps: false
    });
};