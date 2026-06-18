import { DataTypes } from 'sequelize';

export default (sequelize) => {
    return sequelize.define('Rol', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        nombre: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        }
    }, {
        tableName: 'rol',
        timestamps: false
    });
};