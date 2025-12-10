// /src/services/auth.service.js

import db from '../models/index.js'; 
import bcrypt from 'bcrypt'; 
import jwt from 'jsonwebtoken'; 
// Importar CryptoJS si aún usas la encriptación de transporte
// import CryptoJS from 'crypto-js'; 

const JWT_SECRET = process.env.JWT_SECRET || 'clave_jwt_por_defecto'; // Asegura un valor por defecto
const SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS || 10, 10);

// Esta función es LÓGICA de negocio. Es candidata para TESTING con Jest.
const generateToken = (id) => {
    return jwt.sign({ id }, JWT_SECRET, {
        expiresIn: '30d', 
    });
};

// =======================================================
// SERVICIO DE LOGIN
// =======================================================
export const loginUser = async (userIdentifier, password) => { 
    // Nota: Aquí se asume que la desencriptación de transporte ya ocurrió en el controller (ver Paso 2)

    const user = await db.User.findOne({
        where: {
            [db.Op.or]: [
                { username: userIdentifier },
                { email: userIdentifier }
            ]
        }
    });

    if (!user || !(await bcrypt.compare(password, user.password))) {
        // En lugar de devolver un 401, lanzamos un error que el Controller capturará
        const error = new Error("Credenciales inválidas. Usuario o contraseña incorrectos.");
        error.status = 401; 
        throw error;
    }

    const token = generateToken(user.id);
    return { user: { id: user.id, username: user.username, email: user.email }, token };
};

// =======================================================
// SERVICIO DE REGISTRO
// =======================================================
export const registerUser = async (username, email, plainPassword) => {
    
    // 1. Verificar existencia
    const userExists = await db.User.findOne({ where: { email } });
    if (userExists) {
        const error = new Error("El correo electrónico ya está registrado.");
        error.status = 400; 
        throw error;
    }

    // 2. Hashing (LÓGICA CRÍTICA para TESTING)
    const hashedPassword = await bcrypt.hash(plainPassword, SALT_ROUNDS);

    // 3. Crear usuario
    const newUser = await db.User.create({
        username,
        email,
        password: hashedPassword,
    });

    const token = generateToken(newUser.id);
    return { user: { id: newUser.id, username: newUser.username, email: newUser.email }, token };
};