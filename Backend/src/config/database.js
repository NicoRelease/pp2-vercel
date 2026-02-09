import { Sequelize } from 'sequelize';
import dotenv from 'dotenv'; 
dotenv.config(); 


// 1. CONFIGURACIÓN E INSTANCIACIÓN
const SYNC_ENABLED = false; 

const sequelize = new Sequelize(process.env.DATABASE_URL, { 
    dialect: 'postgres', 
    dialectOptions: {
        ssl: {
            require: true, 
            rejectUnauthorized: false
        }
    },
    logging: false, 
});


// 2. FUNCIÓN DE CONEXIÓN (Exportación Nombrada)
export async function connectDB() { 
    try {
        await sequelize.authenticate();
        
        // LÓGICA DE SINCRONIZACIÓN
        if (SYNC_ENABLED) {
            await sequelize.sync({ alter: true }); 
        } else {
        }
    } catch (error) {
        console.error('❌ ERROR CRÍTICO DE CONEXIÓN A LA BASE DE DATOS:', error.message);
        throw new Error('Fallo al conectar o sincronizar la base de datos.'); 
    }
}


export default sequelize;