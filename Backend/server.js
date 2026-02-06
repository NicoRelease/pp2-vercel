// server.js 
//import db from './src/models/index.js';
import cors from 'cors';
import authRouter from './src/routes/authroutes.js';
import sesionesRouter from './src/routes/sesiones.routes.js';
import dotenv from 'dotenv';
import express from 'express';

console.log("comienza a ejecutar el server");
dotenv.config();

const app = express();
//const PORT = process.env.PORT || 3000;

// ===================================
// A. Middlewares Globales
// ===================================

app.use(cors()); 
app.use(express.json());

app.get('/prueba', (req, res) => {
    console.log("✅ Servidor Express recibió /prueba");
    res.status(200).json({ 
        status: "OK", 
        message: "El servidor de Express está recibiendo peticiones correctamente." 
    });
});

app.use('/backend', authRouter); 
app.use('/backend/sesiones', sesionesRouter);

if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
    app.listen(3000, () => {
        console.log('Servidor Backend escuchando en http://localhost:3000');
    });
}

export default app;