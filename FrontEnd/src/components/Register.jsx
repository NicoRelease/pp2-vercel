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
    return text;
};

export default function Register() {
    const navigate = useNavigate();
    const API_BASE_URL = import.meta.env.VITE_API_URL;

    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rol_id, setRolId] = useState(null); // null significa que aún no se decide el rol
    const [showRoleSelector, setShowRoleSelector] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const encryptedEmail = encrypt(email);
        const encryptedPassword = encrypt(password);

        try {
            const response = await fetch(`${API_BASE_URL}/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username,
                    encryptedEmail,
                    encryptedPassword,
                    rol_id: rol_id ? Number(rol_id) : null // Enviamos el rol si ya se seleccionó
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                // LÓGICA CLAVE: Si el backend dice que falta el rol, mostramos el combo
                if (data.needsRoleSelection) {
                    setShowRoleSelector(true);
                    setRolId(3); // Por defecto Usuario
                } else {
                    setError(data.error || 'Error en el registro.');
                }
            } else {
                localStorage.setItem('authToken', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));

                alert('¡Registro exitoso!');
                
                // Redirección por Rol
                if (data.user.rol_id === 1) navigate('/admin-dashboard');
                if (data.user.rol_id === 2) navigate('/group-admin');
                else if (data.user.estado === false) navigate('/waiting-room');
                else navigate('/gestor-estudio');
            }
        } catch (err) {
            setError('Error de conexión.');
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
                        <div className="InputCorreo"><input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required disabled={showRoleSelector} /></div>
                    </div>

                    <div className="Usuario">
                        <label className="block text-gray-700 font-medium mb-2">Correo:</label>
                        <div className="InputCorreo"><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={showRoleSelector} /></div>
                    </div>

                    <div className="Clave">
                        <label className="block text-gray-700 font-medium mb-2">Contraseña:</label>
                        <div className="Password"><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required disabled={showRoleSelector} /></div>
                    </div>

                    {/* SECTOR DINÁMICO: Solo aparece si no es Whitelist */}
                    {showRoleSelector && (
                        <div className="Usuario mt-4 p-4 bg-blue-50 rounded-xl border border-blue-200">
                            <label className="block text-blue-800 font-bold mb-2">Selecciona tu función:</label>
                            <div className="InputCorreo">
                                <select value={rol_id} onChange={(e) => setRolId(e.target.value)} className="w-full bg-transparent outline-none">
                                    <option value={3}>Usuario Regular (Participante)</option>
                                    <option value={2}>Group Admin (Creador de Instancias)</option>
                                </select>
                            </div>
                        </div>
                    )}

                    <button type="submit" className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold mt-6">
                        {loading ? 'Procesando...' : (showRoleSelector ? 'Confirmar y Registrar' : 'Registrar Cuenta')}
                    </button>
                </form>
            </div>
        </div>
    );
}