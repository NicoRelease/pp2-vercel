import jwt from 'jsonwebtoken';
import db from '../models/index.js'; // Importamos DB para validaciones de propiedad

const JWT_SECRET = process.env.JWT_SECRET;

// 1. PROTECCIÓN BÁSICA (Verifica Token y extrae Rol/Grupo)
export const protect = async (req, res, next) => {
    let token;
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
        
        try {
            const decoded = jwt.verify(token, JWT_SECRET);
            
            // Adjuntamos toda la info necesaria del usuario al request
            req.user = {
                id: decoded.id,
                rol_id: decoded.rol_id,
                group_id: decoded.group_id
            };
            next();
        } catch (error) {
            return res.status(401).json({ 
                message: 'No autorizado, token fallido o expirado.', 
                error: error.name 
            });
        }
    }

    if (!token) {
        return res.status(401).json({ message: 'No autorizado, no se proporcionó token.' });
    }
};

// 2. NUEVO: Autorización por Roles (RBAC)
export const authorizeRoles = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user || !allowedRoles.includes(req.user.rol_id)) {
            const rolesMap = { 1: 'SysAdmin', 2: 'GroupAdmin', 3: 'Miembro' };
            return res.status(403).json({ 
                error: `Acceso denegado. Se requiere rol de: ${allowedRoles.map(r => rolesMap[r] || r).join(' o ')}` 
            });
        }
        next();
    };
};

// 3. NUEVO: Verificación de Propiedad del Recurso (Ownership)
// Soporta recursos directos (Sesion, User) e indirectos (Tarea -> Sesion -> user_id)
export const checkOwnership = (modelName, ownerField = 'user_id') => {
    return async (req, res, next) => {
        try {
            // SysAdmin (rol 1) tiene acceso total a cualquier recurso
            if (req.user.rol_id === 1) return next();

            const Model = db[modelName];
            if (!Model) throw new Error(`Modelo ${modelName} no encontrado`);

            let resource;

            // CASO ESPECIAL: Tarea (no tiene user_id directo, pertenece a una Sesion)
            if (modelName === 'Tarea') {
                const Tarea = db.Tarea;
                const Sesion = db.Sesion;

                resource = await Tarea.findByPk(req.params.id, {
                    include: [
                        { model: Sesion, as: 'sesion', attributes: ['user_id'] }
                    ]
                });

                if (!resource) return res.status(404).json({ error: 'Tarea no encontrada' });

                // Verificar propiedad a través de la sesión padre
                const sesionUserId = resource.sesion?.user_id;
                if (String(sesionUserId) !== String(req.user.id)) {
                    return res.status(403).json({ 
                        error: 'No tienes permiso para modificar esta tarea. Pertenece a otro usuario.'
                    });
                }
            } else {
                // CASO GENERAL: Recurso con user_id directo (Sesion, User, etc.)
                resource = await Model.findByPk(req.params.id, { 
                    attributes: [ownerField]
                });

                if (!resource) return res.status(404).json({ error: 'Recurso no encontrado' });

                // Validamos que el ID del usuario logueado coincida con el dueño del recurso
                if (String(resource[ownerField]) !== String(req.user.id)) {
                    return res.status(403).json({ 
                        error: `No tienes permiso para modificar este recurso. El propietario es otro usuario.`
                    });
                }
            }

            // Adjuntamos el recurso completo al request para evitar reconsultas en el controlador
            req.resource = await Model.findByPk(req.params.id, {
                include: modelName === 'Tarea' ? [{ model: db.Sesion, as: 'sesion' }] : []
            });
            
            next();
        } catch (error) {
            console.error(`[checkOwnership] Error:`, error.message);
            res.status(500).json({ 
                error: 'Error interno validando propiedad', 
                detail: error.message 
            });
        }
    };
};
