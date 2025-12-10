// vite.config.js (CORRECCIÓN FINAL)

import { defineConfig, loadEnv } from 'vite' 
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => {
    
    // Carga las variables de entorno para usar API_URL
    const env = loadEnv(mode, process.cwd(), '');
    const API_TARGET = env.VITE_API_TARGET_LOCAL; // 🔑 USAR UNA NUEVA VARIABLE

    // Asumimos que tu backend de Node.js corre en http://localhost:3000
    // Si tu .env tiene VITE_API_URL=/api, NO uses esa aquí como target.

    console.log(`[Vite Config] API Proxy Target: ${API_TARGET}`); 

    return {
        plugins: [react(), tailwindcss()],
        server: {
            proxy: {
                // 🔑 CLAVE: Captura todas las peticiones que empiezan por /api
                '/api': {
                    // 🔑 Objetivo de tu servidor Node/Express local
                    target: API_TARGET, 
                    changeOrigin: true,
                    // Si tu backend (server.js) maneja las rutas como /login (sin /api),
                    // descomenta la siguiente línea:
                    // rewrite: (path) => path.replace(/^\/api/, ''), 
                }
            }
        }
    }
})