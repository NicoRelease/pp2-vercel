import { DataTypes } from 'sequelize';
import dotenv from 'dotenv';


dotenv.config();



export default (sequelize) => {
    const Log = sequelize.define('Log', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        timestamp: { 
            type: DataTypes.DATE, 
            defaultValue: DataTypes.NOW
        },
        user_id: { 
            type: DataTypes.INTEGER,
            allowNull: false
        },
        endpoint: {
            type: DataTypes.STRING,
        },
        metodo: {
            type: DataTypes.STRING,
        },
        mensaje: {
            type: DataTypes.STRING,
        },
        estado: {
            type: DataTypes.INTEGER,
        },
        categoria: {
            type: DataTypes.STRING,
        }, 
        tipo: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        descripcion: {
            type: DataTypes.TEXT,
            allowNull: false
       },
    },
    {
    tableName: 'log',
        timestamps: false
    });
   
    
    return Log;
};