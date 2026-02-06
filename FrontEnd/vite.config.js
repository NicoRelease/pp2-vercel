
import { defineConfig, loadEnv } from 'vite' 
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path';

export default defineConfig(({ mode }) => {
    
    // Carga las variables de entorno para usar API_URL
    const rootPath = path.resolve(process.cwd(), '..'); 
    const env = loadEnv(mode, rootPath, '');
    const API_BASE_URL = import.meta.env.VITE_API_URL || '/backend';

    
    
    const envVariables = {
    
        
        'import.meta.env.VITE_CLIENT_SECRET_KEY': JSON.stringify(env.VITE_CLIENT_SECRET_KEY), 
        
        
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
                   configure: (proxy, options) => {
                // Este listener se dispara cuando la conexión al backend es exitosa
                proxy.on('proxyReq', (proxyReq, req, res) => {
                    if (req.url.startsWith('/backend')) {
                        console.log(`[PROXY-OK] 📞 Redirigiendo ${req.method} ${req.url} a ${options.target}`);
                    }
                });
            }
                }
            }
        }
    }
})