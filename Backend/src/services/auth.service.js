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

    if (!user || !(await user.validPassword(cleanPassword))) {
        const error = new Error("Credenciales inválidas. Usuario o contraseña incorrectos.");
        error.status = 401; 
        throw error;
    }

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

export const registerUser = async (username, email, plainPassword, selectedRolId = null) => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = plainPassword.trim();
    const cleanUsername = username.trim();
    
    const userExists = await db.User.findOne({ where: { email: cleanEmail } });
    if (userExists) {
        const error = new Error("El correo electrónico ya está registrado.");
        error.status = 400; 
        throw error;
    }

    let rol_id = null;     
    let group_id = null;
    let estado = false; 

    const sysAdminEntry = await db.Whitelist.findOne({ 
        where: { email: cleanEmail, activo: true } 
    });

    if (sysAdminEntry) {
        rol_id = 1; 
        estado = true; 
    } else {
        if (!selectedRolId) {
            const error = new Error("Debe seleccionar un tipo de cuenta.");
            error.status = 400;
            error.needsRoleSelection = true; 
            throw error;
        }

        rol_id = Number(selectedRolId);

        if (rol_id === 2) {
            estado = true; 
        } else if (rol_id === 3) {
            const grupoAsociado = await db.Grupo.findOne({
                where: {
                    email: { [db.Op.like]: `%${cleanEmail}%` }
                }
            });

            if (grupoAsociado) {
                group_id = grupoAsociado.id;
                estado = true; 
            } else {
                estado = false; 
            }
        }
    }

    const hashedPassword = await bcrypt.hash(cleanPassword, SALT_ROUNDS);

    const newUser = await db.User.create({
        username: cleanUsername,
        email: cleanEmail,
        password: hashedPassword,
        rol_id,
        group_id,
        estado
    });

    // =======================================================
    // AJUSTE PARA GROUP ADMIN (ROL 2)
    // =======================================================
    if (rol_id === 2) {
        await db.Grupo.create({
            nombre_grupo: `Grupo de ${cleanUsername}`,
            admin_id: newUser.id,
            // IMPORTANTE: Si la DB tiene una FK en 'email', no podemos dejarlo vacío.
            // Lo inicializamos con el email del propio Admin para que la FK sea válida.
            email: cleanEmail 
        });
    }

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