import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import HeaderNoLink from './HeaderNoLink';
import '../App.css';
import CryptoJS from 'crypto-js';

const SECRET_KEY = import.meta.env.VITE_CLIENT_SECRET_KEY;

const encrypt = (text) => {
    if (typeof CryptoJS !== 'undefined' && CryptoJS.AES) {
        return CryptoJS.AES.encrypt(text, SECRET_KEY).toString();
    }
    console.error("ERROR: Crypto no disponible.");
    return text;
};

export default function Register() {
    const navigate = useNavigate();
    const API_BASE_URL = import.meta.env.VITE_API_URL;

    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleRegister = async (e) => {
        e.preventDefault();
        if (!username || !email || !password) {
            setError('Todos los campos son obligatorios.');
            return;
        }

        setLoading(true);
        setError('');

        const encryptedEmail = encrypt(email);
        const encryptedPassword = encrypt(password);

        try {
            const response = await fetch(`${API_BASE_URL}/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: username,
                    encryptedEmail: encryptedEmail,
                    encryptedPassword: encryptedPassword,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.error || 'Fallo en el registro. Inténtalo de nuevo.');
            } else {
                localStorage.setItem('authToken', data.token);
                localStorage.setItem('UserId', data.user.id);
                localStorage.setItem('user', JSON.stringify(data.user));

                alert('¡Registro exitoso!');
                
                // LÓGICA DE REDIRECCIÓN MANTENIENDO EL HASHEO FUNCIONAL
                if (data.user.rol_id === 1) {
                    navigate('/admin-dashboard');
                } else if (data.user.estado === false) {
                    navigate('/waiting-room');
                } else {
                    navigate('/crear-sesion');
                }
            }
        } catch (err) {
            setError('Error de conexión con el servidor.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="Tarjeta-Principal">
            <HeaderNoLink />
            <div className="Form-Container">
                <form onSubmit={handleRegister}>
                    {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl mb-4 text-sm">{error}</div>}
                    <div className="Usuario">
                        <label className="block text-gray-700 font-medium mb-2">Nombre completo:</label>
                        <div className="InputCorreo">
                            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required />
                        </div>
                    </div>
                    <div className="Usuario">
                        <label className="block text-gray-700 font-medium mb-2">Correo:</label>
                        <div className="InputCorreo">
                            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                        </div>
                    </div>
                    <div className="Clave">
                        <label className="block text-gray-700 font-medium mb-2">Contraseña:</label>
                        <div className="Password">
                            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                        </div>
                    </div>
                    <button type="submit" className={`w-full py-3 px-4 rounded-xl text-black font-bold ${loading ? 'bg-blue-400' : 'bg-blue-600'}`} disabled={loading}>
                        {loading ? 'Registrando...' : 'Registrar Cuenta'}
                    </button>
                    <div className="mt-6 text-center">
                        <Link to="/Login" className="text-sm font-semibold text-blue-600">¿Ya tienes cuenta? Inicia sesión.</Link>
                    </div>
                </form>
            </div>
        </div>
    );
}