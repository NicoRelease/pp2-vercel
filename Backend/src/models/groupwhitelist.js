import { DataTypes } from 'sequelize';

export default (sequelize) => {
    return sequelize.define('GroupWhitelist', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false
        },
        group_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        }
    }, {
        tableName: 'groupwhitelist',
        timestamps: false
    });
};