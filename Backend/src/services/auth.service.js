// src/services/auth.service.js

import db from '../models/index.js'; 
import bcrypt from 'bcrypt'; 
import jwt from 'jsonwebtoken'; 

const JWT_SECRET = process.env.JWT_SECRET || 'clave_jwt_por_defecto';
const SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS || 10, 10);

/**
 * Genera un token JWT incluyendo la información de seguridad del usuario.
 * Esto permite que el group_id y rol_id estén disponibles en cada petición
 * sin necesidad de consultar la base de datos constantemente.
 */
const generateToken = (user) => {
    return jwt.sign(
        { 
            id: user.id, 
            rol_id: user.rol_id, 
            group_id: user.group_id 
        }, 
        JWT_SECRET, 
        { expiresIn: '30d' }
    );
};

// =======================================================
// SERVICIO DE LOGIN
// =======================================================
export const loginUser = async (userIdentifier, password) => { 
    // Buscamos al usuario por username o email usando el operador OR de Sequelize
    const user = await db.User.findOne({
        where: {
            [db.Op.or]: [
                { username: userIdentifier },
                { email: userIdentifier }
            ]
        }
    });

    // 1. Validar existencia y contraseña
    if (!user || !(await bcrypt.compare(password, user.password))) {
        const error = new Error("Credenciales inválidas. Usuario o contraseña incorrectos.");
        error.status = 401; 
        throw error;
    }

    // 2. VALIDACIÓN DE ESTADO: Verificar si el SysAdmin ha desactivado la cuenta
    if (user.estado === false) {
        const error = new Error("Acceso denegado. Tu cuenta está inactiva o pendiente de aprobación.");
        error.status = 403; // Forbidden
        throw error;
    }

    const token = generateToken(user);

    return { 
        user: { 
            id: user.id, 
            username: user.username, 
            email: user.email,
            rol_id: user.rol_id,
            group_id: user.group_id,
            estado: user.estado
        }, 
        token 
    };
};

// =======================================================
// SERVICIO DE REGISTRO
// =======================================================
export const registerUser = async (username, email, plainPassword) => {
    
    // 1. Verificar si el correo ya existe para evitar duplicados
    const userExists = await db.User.findOne({ where: { email } });
    if (userExists) {
        const error = new Error("El correo electrónico ya está registrado.");
        error.status = 400; 
        throw error;
    }

    /**
     * 2. Lógica de Onboarding Jerárquica:
     * Determinamos el ROL, GRUPO y ESTADO inicial cruzando las Whitelists.
     */
    let rol_id = 3;     // Valor por defecto: Usuario Regular
    let group_id = null;
    let estado = false; // Por defecto: Inactivo (esperando decisión o asignación)

    // A. ¿Es System Admin? (Consultamos la Whitelist Global)
    const sysAdminEntry = await db.Whitelist.findOne({ 
        where: { email: email, activo: true } 
    });

    if (sysAdminEntry) {
        rol_id = 1;    // ID correspondiente a 'System Admin'
        estado = true; // Se activa automáticamente
    } else {
        // B. ¿Es un usuario invitado a una instancia? (Consultamos GroupWhitelist)
        const groupEntry = await db.GroupWhitelist.findOne({ 
            where: { email: email } 
        });

        if (groupEntry) {
            rol_id = 3; // Mantiene rol 'Usuario'
            group_id = groupEntry.group_id; // Se vincula a su instancia/equipo
            estado = true; // Se activa automáticamente por estar pre-aprobado por el GroupAdmin
        }
    }

    // 3. Encriptación de la contraseña
    const hashedPassword = await bcrypt.hash(plainPassword, SALT_ROUNDS);

    // 4. Creación del registro final en la tabla 'users'
    const newUser = await db.User.create({
        username,
        email,
        password: hashedPassword,
        rol_id,
        group_id,
        estado
    });

    // Generamos el token con la sesión ya iniciada
    const token = generateToken(newUser);
    
    return { 
        user: { 
            id: newUser.id, 
            username: newUser.username, 
            email: newUser.email,
            rol_id: newUser.rol_id,
            group_id: newUser.group_id,
            estado: newUser.estado
        }, 
        token 
    };
};