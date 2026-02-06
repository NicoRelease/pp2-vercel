// api/index.js

// Importa la aplicación Express definida en server.js
import log from './log.js';
import app from '../server.js'; 

if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
    // Si no estamos en producción Y no estamos en Vercel, iniciamos el listener local.
    app.listen(3000, () => {
        console.log('✅ Servidor Backend LOCAL escuchando en http://localhost:3000');
    });
}
export default app; 
