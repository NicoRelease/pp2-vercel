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
    
    console.error("❌ ERROR: CryptoJS no disponible. La registración enviará datos sin cifrar.");
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
        e.preventDefault(); // Previene el comportamiento por defecto del formulario

        // 1. Validaciones básicas
        if (!username || !email || !password) {
            setError('Todos los campos son obligatorios.');
            return;
        }

        setLoading(true);
        setError('');


    const encryptedEmail = encrypt(email);
    const encryptedPassword = encrypt(password);



        try {
            // 2. Llamada al backend: POST /register
            const response = await fetch(`${API_BASE_URL}/register`, { 
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: username,
                    encryptedEmail: encryptedEmail,
                    encryptedPassword: encryptedPassword,
                }),
            });
console.log ('Respuesta del servidor:', response);
            // 3. Procesar la respuesta
            const data = await response.json();
console.log ('Datos recibidos:', data);
            if (!response.ok) {
                // Si la respuesta no es 2xx (ej: 400, 401, 500)
                setError(data.error || 'Fallo en el registro. Inténtalo de nuevo.');
            } else {
                // Registro exitoso (Respuesta 201)s
                console.log('Registro exitoso:', data);
                
                // 4. Guardar token y redirigir al área protegida
                localStorage.setItem('authToken', data.token);
                localStorage.setItem('UserId', data.user.id);
                console.log('Info de LocalStorage: ', localStorage);
                // navigate('/crear-sesion'); // Redirige a la página principal de la app
                alert('Registro exitoso! Serás redirigido a Crear Sesión.');
                navigate('/crear-sesion');
            }

        } catch (err) {
            console.error('Error de red al registrar:', err);
            setError('Error de conexión con el servidor.');
        } finally {
            setLoading(false);
        }
    };
    return (
        <>
        <div className="Tarjeta-Principal">
            <HeaderNoLink />
            
            
                <div className="Form-Container">
                        <form 
                          onSubmit={handleRegister} 
                          className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md border border-gray-100"
                        >
                          
                
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

                {/* Campo Nombre Completo / Username */}
                        <div className="mb-4">
                            <label htmlFor="username" className="block text-gray-700 text-sm font-bold mb-2 text-left">
                                Nombre completo (Username)
                            </label>
                            <input
                                id="username"
                                type="text"
                                placeholder="Tu nombre de usuario"
                                className="shadow appearance-none border rounded w-full py-3 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                disabled={loading}
                                required
                            />
                        </div>
                
                          {/* Campo de Usuario */}
                          <div className="mb-5">
                            <label className="block text-gray-700 font-medium mb-2" htmlFor="loginUser">
                              Correo: 
                            </label>
                            <input
                              id="email"
                              type="email"
                              className="w-[calc(100%-5px)] p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-150 shadow-sm"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              placeholder="ej: tu.correo@dominio.com"
                              disabled={loading}
                              required
                            />
                          </div>
                
                          {/* Campo de Contraseña */}
                          <div className="mb-8">
                            <label className="block text-gray-700 font-medium mb-2" htmlFor="loginPassword">
                              Contraseña:
                            </label>
                            <input
                              id="password"
                              type="password"
                              className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-150 shadow-sm"
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              placeholder="Crea una contraseña segura"
                              disabled={loading}
                              required
                            />
                          </div>
                
                          {/* Botón de Registro */}
                          <button
                            type="submit"
                            className="w-full py-3 bg-blue-600 text-black font-semibold rounded-xl hover:bg-blue-700 transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                            disabled={loading}
                        >
                            {loading ? 'Registrando...' : 'Registrar Cuenta'}
                        </button>
                
                          {/* Enlace de Registro */}
                          <div className="mt-6 text-center">
                            <Link to="/Login" className="text-sm font-semibold text-blue-600 hover:text-blue-800 hover:underline transition duration-150">
                              ¿Ya tenés cuenta? Logueate aquí.
                            </Link>
                          </div>
                          
                        </form>
                </div>
            </div>
        </>
    );
}