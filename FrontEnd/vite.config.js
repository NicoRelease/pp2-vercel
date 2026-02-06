import { defineConfig, loadEnv } from 'vite' 
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path';

export default defineConfig(({ mode }) => {
    // 1. Cargamos las variables del entorno (Vercel las inyecta aquí)
    // Buscamos en la raíz del proyecto (..) para encontrar las variables
    const rootPath = path.resolve(process.cwd(), '..'); 
    const env = loadEnv(mode, rootPath, '');

    // 2. Definimos el target para el proxy (solo se usa en desarrollo local)
    // NOTA: Cambié el nombre a API_TARGET para que coincida con tu console.log
    const API_TARGET = env.VITE_API_URL || 'http://localhost:3000';

    const envVariables = {
        // USAMOS 'env' en lugar de 'import.meta.env' aquí
        'import.meta.env.VITE_CLIENT_SECRET_KEY': JSON.stringify(env.VITE_CLIENT_SECRET_KEY || ''), 
        'import.meta.env.VITE_API_URL': JSON.stringify(env.VITE_API_URL || '/backend'),
    };

    console.log(`[Vite Config] Modo: ${mode}`);
    console.log(`[Vite Config] API Target: ${API_TARGET}`); 

    return {
        plugins: [react(), tailwindcss()],
        define: envVariables,
        server: {
            proxy: {
                '/backend': {   
                    target: API_TARGET, 
                    changeOrigin: true,
                    configure: (proxy, options) => {
                        proxy.on('proxyReq', (proxyReq, req, res) => {
                            console.log(`[PROXY] ${req.method} ${req.url} -> ${options.target}`);
                        });
                    }
                }
            }
        }
    }
})