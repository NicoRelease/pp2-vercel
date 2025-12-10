// /src/controllers/auth.controller.js

import * as authService from '../services/auth.service.js';
import CryptoJS from 'crypto-js';

const CLIENT_SECRET_KEY = process.env.CLIENT_SECRET_KEY || 'clave-secreta-255bits'; 

// =======================================================
// FUNCIÓN DE DESENCRIPTACIÓN (LA QUE FALTABA)
// =======================================================
const decryptTransport = (encryptedText) => {
    try {
        console.log('🔐 Intentando desencriptar:', encryptedText?.substring(0, 50) + '...');
        console.log('🔑 Clave usada:', CLIENT_SECRET_KEY);
        
        // Desencriptar usando AES
        const bytes = CryptoJS.AES.decrypt(encryptedText, CLIENT_SECRET_KEY);
        
        // Convertir a string UTF-8
        const decryptedText = bytes.toString(CryptoJS.enc.Utf8);
        
        console.log('✅ Texto desencriptado:', decryptedText);
        
        if (!decryptedText) {
            console.log('❌ La desencriptación devolvió string vacío');
            return '';
        }
        
        return decryptedText;
        
    } catch (error) {
        console.error('❌ Error en decryptTransport:', error.message);
        return ''; // Devuelve string vacío si hay error
    }
};

// =======================================================
// 1. LOGIN (POST /login)
// =======================================================
export const login = async (req, res) => {
    const { encryptedUser, encryptedPassword } = req.body;
    
    // Debug logs
    console.log('📥 LOGIN - Datos recibidos:');
    console.log('encryptedUser:', encryptedUser?.substring(0, 50) + '...');
    console.log('encryptedPassword:', encryptedPassword?.substring(0, 50) + '...');
    
    const userIdentifier = decryptTransport(encryptedUser); 
    const password = decryptTransport(encryptedPassword);

    console.log('🔓 LOGIN - Desencriptado:');
    console.log('userIdentifier:', userIdentifier);
    console.log('password:', password ? '[PASSWORD_SET]' : '[EMPTY]');

    if (!userIdentifier || !password) {
        return res.status(400).json({ error: "Datos de credenciales incompletos o inválidos." });
    }

    try {
        const result = await authService.loginUser(userIdentifier, password);
        
        return res.status(200).json({ 
            message: "Login exitoso con mensaje del backend",
            user: result.user,
            token: result.token
        });

    } catch (error) {
        const status = error.status || 500;
        console.error("Error en login:", error.message);
        return res.status(status).json({ error: error.message });
    }
};

// =======================================================
// 2. REGISTER (POST /register)
// =======================================================
export const register = async (req, res) => {
    const { username, encryptedEmail, encryptedPassword } = req.body;

    // Debug logs
    console.log('📥 REGISTER - Datos recibidos:');
    console.log('username:', username);
    console.log('encryptedEmail:', encryptedEmail?.substring(0, 50) + '...');
    console.log('encryptedPassword:', encryptedPassword?.substring(0, 50) + '...');
    
    const email = decryptTransport(encryptedEmail); 
    const password = decryptTransport(encryptedPassword);

    console.log('🔓 REGISTER - Desencriptado:');
    console.log('email:', email);
    console.log('password:', password ? '[PASSWORD_SET]' : '[EMPTY]');

    if (!username || !email || !password) {
        console.log('❌ Validación fallida - Campos vacíos:');
        console.log('username empty?', !username);
        console.log('email empty?', !email);
        console.log('password empty?', !password);
        return res.status(400).json({ error: "Por favor, complete todos los campos requeridos." });
    }

    try {
        const result = await authService.registerUser(username, email, password);

        return res.status(201).json({
            message: "Registro exitoso",
            user: result.user,
            token: result.token,
        });
        
    } catch (error) {
        const status = error.status || 500;
        console.error("Error en registro:", error.message);
        return res.status(status).json({ error: error.message });
    }
};