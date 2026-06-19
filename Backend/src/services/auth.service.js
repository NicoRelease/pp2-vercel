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

export const loginUser = async (userIdentifier, password) => { 
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
    console.log("datos devueltos de la consulta: ",user);
    
    console.log ("datos del usuario al momento del login:",user?.id, user?.estado, user?.group_id);

    // Verificar si el usuario existe
    if (!user) {
        console.log("user es null");
        const error = new Error("Credenciales inválidas. Usuario o contraseña incorrectos.");
        error.status = 401; 
        throw error;
    }

    // Validar contraseña
    if (!(await user.validPassword(cleanPassword))) {
        const error = new Error("Credenciales inválidas. Usuario o contraseña incorrectos.");
        error.status = 401; 
        throw error;
    }

    if (user.rol_id === 3) {
        // Para rol 3, buscar en GrupoLista
        console.log("Entra en este if:2");
        const grupoAsociado = await db.GrupoLista.findOne({
            where: {
                email: { [db.Op.like]: `%${cleanIdentifier}%` }
            }
        });
        console.log ("grupoAsociado:",grupoAsociado)
        if (grupoAsociado) {
            user.group_id = grupoAsociado.grupo_id;
            user.estado = true; 
        } else {
            // Para usuarios de rol 3 que no están en GrupoLista:
            // Se permite el registro pero sin grupo asignado y con estado pendiente
            user.group_id = null;
            user.estado = false; 
        }
    }

    if (user.id && user.estado === false) {
        console.log("Entra en este if:3");
        const error = new Error("Acceso denegado. Tu cuenta está inactiva o pendiente de aprobación.");
        error.status = 403; 
        throw error;
    }
    
    const token = generateToken(user);
    console.log ("datos actualizados de usuario: ",user);
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

export const registerUser = async (username, email, plainPassword, selectedRolId = null) => {
    // Validaciones iniciales
    if (!username || !email || !plainPassword) {
        const error = new Error("Todos los campos son requeridos.");
        error.status = 400;
        throw error;
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = plainPassword.trim();
    const cleanUsername = username.trim();
    
    // Validar formato de correo
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
        const error = new Error("Formato de correo electrónico inválido.");
        error.status = 400;
        throw error;
    }
    
    // Verificar si el usuario ya existe
    const userExists = await db.User.findOne({ where: { email: cleanEmail } });
    if (userExists) {
        const error = new Error("El correo electrónico ya está registrado.");
        error.status = 400; 
        throw error;
    }

    let rol_id = null;     
    let group_id = null;
    let estado = false; 

    // Verificar si es un SysAdmin (Whitelist)
    const sysAdminEntry = await db.Whitelist.findOne({ 
        where: { email: cleanEmail, activo: true } 
    });

    if (sysAdminEntry) {
        rol_id = 1; 
        estado = true; 
    } else {
        console.log("Entra en el proceso de validación por rol")
        // Si no es SysAdmin, se requiere seleccionar un rol
        if (!selectedRolId) {
            const error = new Error("Debe seleccionar un tipo de cuenta.");
            error.status = 400;
            error.needsRoleSelection = true; 
            throw error;
        }

        rol_id = Number(selectedRolId);

        // Validar que el rol sea válido
        if (rol_id !== 2 && rol_id !== 3) {
            const error = new Error("Tipo de cuenta inválido.");
            error.status = 400;
            throw error;
        }

        if (rol_id === 2) {
            estado = true; 
        } else if (rol_id === 3) {
            // Para rol 3, buscar en GrupoLista
            const grupoAsociado = await db.GrupoLista.findOne({
                where: {
                    email: { [db.Op.like]: `%${cleanEmail}%` }
                }
            });
            console.log ("grupoAsociado:",grupoAsociado)
            if (grupoAsociado) {
                group_id = grupoAsociado.grupo_id;
                estado = true; 
            } else {
                // Para usuarios de rol 3 que no están en GrupoLista:
                // Se permite el registro pero sin grupo asignado y con estado pendiente
                group_id = null;
                estado = false; 
            }
        }
    }

    // Hash de contraseña
    const hashedPassword = await bcrypt.hash(cleanPassword, SALT_ROUNDS);

    // Crear usuario
    const newUser = await db.User.create({
        username: cleanUsername,
        email: cleanEmail,
        password: hashedPassword,
        rol_id,
        group_id,  // Este puede ser null
        estado
    });

    // =======================================================
    // AJUSTE PARA GROUP ADMIN (ROL 2)
    // =======================================================
    if (rol_id === 2) {
        const grupo = await db.Grupo.create({
            nombre_grupo: `Grupo de ${cleanUsername}`,
            admin_id: newUser.id,
            email: cleanEmail 
        });
        
        // Actualizar el group_id del usuario con el ID del grupo creado
        newUser.group_id = grupo.id;
        await newUser.save();
    }

    const token = generateToken(newUser.id);
    
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
}