// middleware/authMiddleware.js

import jwt from 'jsonwebtoken';




const JWT_SECRET = process.env.JWT_SECRET;


/**
 * Middleware para proteger rutas.
 * Verifica el token JWT enviado en el header de autorización.
 * * NOTA: Esta versión NO hace una llamada a la base de datos para verificar 
 * la existencia del usuario, solo verifica que el token sea válido.
 */
export const protect = async (req, res, next) => {
    // 1. Obtener el token del encabezado (Header)
    let token;
    
    // El token típicamente viene como: "Bearer TOKEN_AQUI"
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer')) {
        // Extraemos solo el token (quitando "Bearer ")
        token = authHeader.split(' ')[1];
        
        try {
            // 2. Verificar el token
            // Si la verificación falla, salta al bloque catch
            const decoded = jwt.verify(token, JWT_SECRET);
            
            // 3. Adjuntar la información del usuario a la solicitud
            // El token solo contiene el 'id' del usuario, así que solo adjuntamos eso.
            req.user = { id: decoded.id }; 
            
            // 4. Continuar con la siguiente función (el controlador de la ruta)
            next();
            return; // Salir de la función después de llamar a next()

        } catch (error) {
            console.error('Error de verificación JWT:', error.message);
            // 401 Unauthorized
            return res.status(401).json({ 
                message: 'No autorizado, token fallido o expirado.',
                error: error.name
            });
        }
    }

    // Si el token no se pudo extraer del header (o no existía)
    if (!token) {
        return res.status(401).json({ message: 'No autorizado, no se proporcionó token.' });
    }
};