import * as authService from '../services/auth.service.js';
import CryptoJS from 'crypto-js';

const CLIENT_SECRET_KEY = process.env.VITE_CLIENT_SECRET_KEY; 

const decryptTransport = (encryptedText) => {
    try {
        if (!encryptedText) return '';
        const bytes = CryptoJS.AES.decrypt(encryptedText, CLIENT_SECRET_KEY);
        const decryptedText = bytes.toString(CryptoJS.enc.Utf8);
        return decryptedText || '';
    } catch (error) {
        console.error('❌ Error en decryptTransport:', error.message);
        return '';
    }
};

export const login = async (req, res) => {
    const { encryptedUser, encryptedPassword } = req.body;
    
    const userIdentifier = decryptTransport(encryptedUser); 
    const password = decryptTransport(encryptedPassword);

    if (!userIdentifier || !password) {
        return res.status(400).json({ error: "Datos de credenciales incompletos." });
    }

    try {
        const result = await authService.loginUser(userIdentifier, password);
        return res.status(200).json({ 
            message: "Login exitoso",
            user: result.user,
            token: result.token
        });
    } catch (error) {
        const status = error.status || 500;
        return res.status(status).json({ error: error.message });
    }
};

export const register = async (req, res) => {
    // 1. CAPTURAR rol_id DEL BODY
    const { username, encryptedEmail, encryptedPassword, rol_id } = req.body;

    const email = decryptTransport(encryptedEmail); 
    const password = decryptTransport(encryptedPassword);
console.log('Datos recibidos en register:', { username, email, password, rol_id });
console.log('Encrypted data:', { encryptedEmail, encryptedPassword });
    if (!username || !email || !password) {
        return res.status(400).json({ error: "Por favor, complete todos los campos." });
    }

    try {
        // 2. PASAR EL rol_id AL SERVICE
        const result = await authService.registerUser(username, email, password, rol_id);

        return res.status(201).json({
            message: "Registro exitoso",
            user: result.user,
            token: result.token,
        });
        
    } catch (error) {
        const status = error.status || 500;
        
        // 3. ENVIAR LA BANDERA needsRoleSelection AL FRONTEND
        // Si el service lanzó este error, se lo pasamos al cliente para que muestre el combo
        if (error.needsRoleSelection) {
            return res.status(status).json({ 
                error: error.message, 
                needsRoleSelection: true 
            });
        }

        console.error("Error en registro:", error.message);
        return res.status(status).json({ error: error.message });
    }
};