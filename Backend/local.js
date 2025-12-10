// local.js (Solo para ejecución local con npm run dev)

import dotenv from 'dotenv';
// Importa la aplicación de Express que exportaste en server.js
import app from './server.js'; 
import { connectDB } from './src/config/database.js';

// Cargar variables de entorno local
dotenv.config();

const PORT = process.env.PORT || 3000;

async function startLocalServer() {
    console.log("🚀 Iniciando servidor en modo desarrollo...");
    
    // 1. Conectar a la Base de Datos (solo al inicio en local)
    // Esto asegura que los modelos y la conexión estén listos.
    try {
        await connectDB();
        console.log("✅ Conexión a PostgreSQL/Supabase establecida.");
    } catch (error) {
        console.error("❌ ERROR: No se pudo conectar a la base de datos.", error);
        // Si no se puede conectar, podemos detener la ejecución local
        process.exit(1); 
    }

    // 2. Escuchar el Puerto
    app.listen(PORT, () => {
        console.log(`✅ Servidor Express.js iniciado en http://localhost:${PORT}`);
    });
}

startLocalServer();