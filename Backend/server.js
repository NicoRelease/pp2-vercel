// server.js 
import cors from 'cors';
import db from './src/models/index.js'; 
import authRouter from './src/routes/authroutes.js';
import sesionesRouter from './src/routes/sesiones.routes.js';
import dotenv from 'dotenv';
import express from 'express';


dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// ===================================
// A. Middlewares Globales
// ===================================

app.use(cors()); 
app.use(express.json());


app.use('/backend', authRouter); 
app.use('/backend/sesiones', sesionesRouter);


export default app;