import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import HeaderNoLink from './HeaderNoLink';
import '../App.css';
import CryptoJS from 'crypto-js';

const CLIENT_SECRET_KEY = import.meta.env.VITE_CLIENT_SECRET_KEY;

const encryptTransport = (text) => {
    try {
        if (!text) return '';
        const encryptedText = CryptoJS.AES.encrypt(text, CLIENT_SECRET_KEY).toString();
        return encryptedText || '';
    } catch (error) {
        console.error('❌ Error en encryptTransport:', error.message);
        return '';
    }
};

export default function Register() {
    const navigate = useNavigate();
    const API_BASE_URL = import.meta.env.VITE_API_URL;

    const [username, setUsername] = useState('a');
    const [email, setEmail] = useState('a@a.com');
    const [password, setPassword] = useState('1234');
    const [rol_id, setRolId] = useState(3);
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
    
        try {
            console.log('Datos a enviar en register:', { username, email, password, rol_id });
            
            const response = await fetch(`${API_BASE_URL}/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username,
                    encryptedEmail: encryptTransport(email),
                    encryptedPassword: encryptTransport(password),
                    rol_id
                }),
            });
            
            const data = await response.json();
            console.log('Respuesta del backend:', data);
            
            if (!response.ok) {
                setError(data.error || 'Error en el registro.');
                setLoading(false);
                return;
            }

            localStorage.setItem('authToken', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));

            alert('¡Registro exitoso!');
            
            // Redirección por Rol
            if (data.user.rol_id === 1) {
                navigate('/admin-dashboard');
            } else if (data.user.rol_id === 2) {
                navigate('/group-admin');
            } else if (data.user.estado === false) {
                navigate('/waiting-room');
            } else {
                navigate('/gestor-estudio');
            }
        } catch (err) {
            console.error('Error en el registro:', err);
            setError('Error de conexión. Por favor, inténtelo nuevamente.');
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
                        <div className="InputCorreo"><input type="text" value={username} onChange={(e) => setUsername(e.target.value)}  /></div>
                    </div>

                    <div className="Usuario">
                        <label className="block text-gray-700 font-medium mb-2">Correo:</label>
                        <div className="InputCorreo"><input type="email" value={email} onChange={(e) => setEmail(e.target.value)}  /></div>
                    </div>

                    <div className="Clave">
                        <label className="block text-gray-700 font-medium mb-2">Contraseña:</label>
                        <div className="Password"><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} /></div>
                    </div>
                    
                    <div className="Usuario mt-4 p-4 bg-blue-50 rounded-xl border border-blue-200">
                        <label className="block text-blue-800 font-bold mb-2">Selecciona tu función:</label>
                        <div className="InputCorreo">
                            <select value={rol_id} onChange={(e) => setRolId(e.target.value)} className="w-full bg-transparent outline-none">
                                <option value={3}>Usuario Regular (Participante)</option>
                                <option value={2}>Group Admin (Creador de Instancias)</option>
                                <option value={1}>System Admin (Administrador del Sistema)</option>
                            </select>
                        </div>
                    </div>

                    <button type="submit" className="RegisterButton">
                        {loading ? 'Procesando...' : ('Registrar Cuenta')}
                    </button>
                </form>
            </div>
        </div>
    );
}