import db from '../models/index.js'; // Acceso al modelo User
import jwt from 'jsonwebtoken';

const User = db.User;

export const loginUser = async (req, res) => {
    const { username, password } = req.body;
    
    // 1. Encontrar el usuario por username (email)
    const user = await User.findOne({ where: { username } });

    if (!user) {
        return res.status(401).json({ error: 'Credenciales inválidas.' });
    }

    // 2. Usar el método del modelo para validar el password con Bcrypt
    const isPasswordValid = await user.validPassword(password);

    if (!isPasswordValid) {
        return res.status(401).json({ error: 'Credenciales inválidas.' });
    }

    // 3. Generar el JWT
    const token = jwt.sign(
        { id: user.id, username: user.username },
        process.env.JWT_SECRET,
        { expiresIn: '1h' } // Token expira en 1 hora
    );

    res.json({ token, userId: user.id });
};