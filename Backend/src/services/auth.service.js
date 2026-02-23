import db from '../models/index.js'; 
import bcrypt from 'bcrypt'; 
import jwt from 'jsonwebtoken'; 

const JWT_SECRET = process.env.JWT_SECRET || 'clave_jwt_por_defecto';
const SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS || 10, 10);


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
    // 1. Limpieza de datos: trim() elimina espacios accidentales
    const cleanIdentifier = userIdentifier.trim();
    const cleanPassword = password.trim();

    const user = await db.User.findOne({
        where: {
            [db.Op.or]: [
                { username: cleanIdentifier },
                { email: cleanIdentifier }
            ]
        }
    });

    // 2. Validar existencia y contraseña usando el método del modelo

    if (!user || !(await user.validPassword(cleanPassword))) {
        const error = new Error("Credenciales inválidas. Usuario o contraseña incorrectos.");
        error.status = 401; 
        throw error;
    }

    // 3. Validación de estado
    if (user.estado === false) {
        const error = new Error("Acceso denegado. Tu cuenta está inactiva o pendiente de aprobación.");
        error.status = 403; 
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
    // Limpieza de datos
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = plainPassword.trim();
    const cleanUsername = username.trim();
    
    // 1. Verificar si el correo ya existe
    const userExists = await db.User.findOne({ where: { email: cleanEmail } });
    if (userExists) {
        const error = new Error("El correo electrónico ya está registrado.");
        error.status = 400; 
        throw error;
    }

    // 2. Lógica de Onboarding
    let rol_id = 3;     
    let group_id = null;
    let estado = false; 

    const sysAdminEntry = await db.Whitelist.findOne({ 
        where: { email: cleanEmail, activo: true } 
    });

    if (sysAdminEntry) {
        rol_id = 1;    
        estado = true; 
    } else {
        const groupEntry = await db.GroupWhitelist.findOne({ 
            where: { email: cleanEmail } 
        });

        if (groupEntry) {
            rol_id = 3; 
            group_id = groupEntry.group_id; 
            estado = true; 
        }
    }

    // 3. Encriptación
    const hashedPassword = await bcrypt.hash(cleanPassword, SALT_ROUNDS);

    // 4. Creación del registro
    const newUser = await db.User.create({
        username: cleanUsername,
        email: cleanEmail,
        password: hashedPassword,
        rol_id,
        group_id,
        estado
    });

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