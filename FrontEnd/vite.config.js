
import { defineConfig, loadEnv } from 'vite' 
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path';

export default defineConfig(({ mode }) => {
    
    // Carga las variables de entorno para usar API_URL
    const rootPath = path.resolve(process.cwd(), '..'); 
    const env = loadEnv(mode, rootPath, '');
    const API_TARGET = env.VITE_API_TARGET_LOCAL || 'http://localhost:3000';

    // Asumimos que tu backend de Node.js corre en http://localhost:3000
    // Si tu .env tiene VITE_API_URL=/api, NO uses esa aquí como target.
    const envVariables = {
        // Debemos inyectar la clave secreta con el prefijo VITE_
        // y asegurarnos de que el valor es una cadena (JSON.stringify)
        'import.meta.env.VITE_CLIENT_SECRET_KEY': JSON.stringify(env.CLIENT_SECRET_KEY), 
        
        // Inyectamos la URL de la API también para mayor seguridad, aunque el proxy ya funciona.
        'import.meta.env.VITE_API_URL': JSON.stringify(env.VITE_API_URL || '/backend'),
    };
    console.log(`[Vite Config] API Proxy Target: ${API_TARGET}`); 

    return {
        plugins: [react(), tailwindcss()],
        define: envVariables,
        server: {
            proxy: {
                
                '/backend': {   
                    target: API_TARGET, 
                    changeOrigin: true,
                   
                }
            }
        }
    }
})