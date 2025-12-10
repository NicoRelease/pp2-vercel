// config/database.js (CORREGIDO PARA POSTGRESQL/SUPABASE)

import { Sequelize } from 'sequelize';
import dotenv from 'dotenv'; 
// Asegúrate de que dotenv.config() se ejecute en local.js, 
// pero lo dejamos aquí por si acaso:
dotenv.config(); 


// 1. CONFIGURACIÓN E INSTANCIACIÓN
const SYNC_ENABLED = true; // Mantener para el desarrollo

// 🔑 CLAVE: Usamos la URL completa de Supabase
const sequelize = new Sequelize(process.env.DATABASE_URL, { 
    // Usamos el dialecto de PostgreSQL
    dialect: 'postgres', 
    
    // Configuraciones adicionales (SSL es necesario en Vercel/Supabase)
    dialectOptions: {
        ssl: {
            require: true, 
            rejectUnauthorized: false // Para entornos de desarrollo/Vercel
        }
    },
    logging: false, 
});


// 2. FUNCIÓN DE CONEXIÓN (Exportación Nombrada)
export async function connectDB() { 
    try {
        await sequelize.authenticate();
        console.log(`✅ Conexión a PostgreSQL (Supabase) establecida correctamente.`);
        
        // LÓGICA DE SINCRONIZACIÓN
        if (SYNC_ENABLED) {
            await sequelize.sync({ alter: true }); 
            console.log('✨ BASE DE DATOS ESTRUCTURADA: Las tablas han sido creadas/actualizadas en la DB.');
        } else {
            console.log('✅ Modo de sincronización de DB DESHABILITADO.');
            // Puedes eliminar la lógica de TRUNCATE/DELETE si la sincronización siempre estará activa en desarrollo.
        }
    } catch (error) {
        console.error('❌ ERROR CRÍTICO DE CONEXIÓN A LA BASE DE DATOS:', error.message);
        throw new Error('Fallo al conectar o sincronizar la base de datos.'); 
    }
}


// 3. EXPORTACIÓN DE LA INSTANCIA DE SEQUELIZE
export default sequelize;