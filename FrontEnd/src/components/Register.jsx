import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import HeaderNoLink from './HeaderNoLink';
import '../App.css';
import CryptoJS from 'crypto-js';

const SECRET_KEY = import.meta.env.VITE_CLIENT_SECRET_KEY;

// Función de Encriptación
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

    // Estado para capturar los datos del formulario
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
                alert('¡Registro exitoso! Serás redirigido.');
                navigate('/crear-sesion');
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
                    
                    {/* Mensaje de Error */}
                    {error && (
                        <div 
                            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl mb-4 text-sm" 
                            role="alert"
                        >
                            <p className="font-semibold">Error:</p>
                            <p>{error}</p>
                        </div>
                    )}

                    {/* Campo Nombre Completo */}
                    <div className="Usuario">
                        <label className="block text-gray-700 font-medium mb-2" htmlFor="username">
                            Nombre completo:
                        </label>
                        <div className="InputCorreo">
                            <input
                                id="username"
                                type="text"
                                placeholder="Tu nombre de usuario"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                disabled={loading}
                                required
                            />
                        </div>
                    </div>

                    {/* Campo Correo */}
                    <div className="Usuario">
                        <label className="block text-gray-700 font-medium mb-2" htmlFor="email">
                            Correo:
                        </label>
                        <div className="InputCorreo">
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="ej: tu.correo@dominio.com"
                                disabled={loading}
                                required
                            />
                        </div>
                    </div>

                    {/* Campo Contraseña */}
                    <div className="Clave">
                        <label className="block text-gray-700 font-medium mb-2" htmlFor="password">
                            Contraseña:
                        </label>
                        <div className="Password">
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Crea una contraseña segura"
                                disabled={loading}
                                required
                            />
                        </div>
                    </div>

                    {/* Botón de Registro */}
                    <button
                        type="submit"
                        className={`w-full py-3 px-4 rounded-xl text-black font-bold transition duration-300 ${
                            loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 shadow-lg'
                        }`}
                        disabled={loading}
                    >
                        {loading ? 'Registrando...' : 'Registrar Cuenta'}
                    </button>

                    {/* Enlace al Login */}
                    <div className="mt-6 text-center">
                        <Link to="/Login" className="text-sm font-semibold text-blue-600 hover:text-blue-800 hover:underline transition duration-150">
                            ¿Ya tienes cuenta? Inicia sesión aquí.
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}