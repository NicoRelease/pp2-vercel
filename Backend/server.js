// server.js 
import cors from 'cors';
import authRouter from './src/routes/authroutes.js';
import sesionesRouter from './src/routes/sesiones.routes.js';
import dotenv from 'dotenv';
import express from 'express';

dotenv.config();

const app = express();

// =============
// A. Middleware
// =============

app.use(cors()); 
app.use(express.json());

app.get('/prueba', (req, res) => {
    res.status(200).json({ 
        status: "OK", 
        message: "El servidor de Express está recibiendo peticiones correctamente." 
    });
});

app.use('/', authRouter); 
app.use('/sesiones', sesionesRouter);

if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
    app.listen(3000, () => {
    });
}

export default app;