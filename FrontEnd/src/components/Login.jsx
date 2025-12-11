import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../App.css';
import HeaderNoLink from './HeaderNoLink';
import CryptoJS from 'crypto-js';



export default function Login() {
  const navigate = useNavigate();
  
  // 1. Estado del formulario
  const [loginUser, setLoginUser] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(""); // Estado para mensajes de error
  
const SECRET_KEY= import.meta.env.VITE_CLIENT_SECRET_KEY;
  
const API_BASE_URL = import.meta.env.VITE_API_URL;


  // Función de Encriptación / Codificación
  const encrypt = (text) => {
     // Comprobamos si la librería CryptoJS está disponible globalmente
        
    if (typeof CryptoJS !== 'undefined' && CryptoJS.AES) {
        return CryptoJS.AES.encrypt(text, SECRET_KEY).toString(); 
    }
    
    console.error("❌ Encriptación AES no disponible. Usando Base64 (¡NO SEGURO!).");
    return btoa(text); 
  };

  const handleLogin = (data) => {
    // Lógica para manejar el inicio de sesión exitoso

    console.log("Login exitoso, data:", data);
        
    // 🔥 CORRECCIÓN CLAVE: Guardar el token en localStorage
    if (data.token) {
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('UserId', data.user.id);
      
        
    } else {
        console.warn("Login exitoso, pero no se recibió token en la respuesta.");
    }

    // Navegar a la página principal después del login
    navigate("/gestor-estudio");
  };

  // Función principal de manejo del formulario (async para usar await)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(""); // Limpiar errores anteriores

    if (!loginUser || !loginPassword) {
      setErrorMessage("Por favor, ingresa el usuario y la contraseña.");
      return;
    }

    setIsLoading(true);

    // La codificación/encriptación se realiza aquí, justo antes del fetch

    const encryptedUser = encrypt(loginUser);
    const encryptedPassword = encrypt(loginPassword);
    try {
         // 💡 Nota: Se recomienda usar rutas relativas o un proxy para evitar problemas de CORS
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          encryptedUser,
          encryptedPassword
        }),
      });

      const data = await response.json();
     
      if (response.ok && data.token) {
        // Llamada a la función de manejo de éxito, que ahora guarda el token
        handleLogin({ token: data.token, user: loginUser });
 
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('UserId', data.user.id);
        console.log("Token guardado en localStorage luego del post-login.", localStorage.getItem('authToken'));
        console.log("UserId guardado en localStorage luego del post-login.", localStorage.getItem('UserId'));
        
 
        return;
      }
      
      // Manejo de errores de servidor (4xx o 5xx)
      setErrorMessage(data.error || `Error en login: ${response.statusText}. Credenciales inválidas.`);

    } catch (err) {
      // Manejo de errores de conexión de red
      setErrorMessage(`Error de conexión: El servidor no está disponible o el proxy falló. ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="Tarjeta-Principal">
      <HeaderNoLink />     
         
      
      <div className="Form-Container">
        <form 
          onSubmit={handleSubmit} 
          className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md border border-gray-100"
        >
          

          {/* Mensaje de Error */}
          {errorMessage && (
            <div 
              className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl mb-4 text-sm" 
              role="alert"
            >
              <p className="font-semibold">Error:</p>
              <p>{errorMessage}</p>
            </div>
          )}

          {/* Campo de Usuario */}
          <div className="mb-5">
            <label className="block text-gray-700 font-medium mb-2" htmlFor="loginUser">
              Correo: 
            </label>
            <input
              id="loginUser"
              type="email"
              className="w-[calc(100%-5px)] p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-150 shadow-sm"
              value={loginUser}
              onChange={(e) => setLoginUser(e.target.value)}
              placeholder="ej: tu.correo@dominio.com"
              disabled={isLoading}
              required
            />
          </div>

          {/* Campo de Contraseña */}
          <div className="mb-8">
            <label className="block text-gray-700 font-medium mb-2" htmlFor="loginPassword">
              Contraseña:
            </label>
            <input
              id="loginPassword"
              type="password"
              className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-150 shadow-sm"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              placeholder="Ingresa tu contraseña"
              disabled={isLoading}
              required
            />
          </div>

          {/* Botón de Submit */}
          <button
            type="submit"
            className={`w-full py-3 px-4 rounded-xl text-black font-bold transition duration-300 ${
              isLoading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 shadow-lg'
            }`}
            disabled={isLoading}
          >
            {isLoading ? "Conectando..." : "Iniciar sesión"}
          </button>

          {/* Enlace de Registro */}
          <div className="mt-6 text-center">
            <Link to="/Register" className="text-sm font-semibold text-blue-600 hover:text-blue-800 hover:underline transition duration-150">
              ¿No tienes cuenta? Regístrate aquí.
            </Link>
          </div>
          
        </form>
      </div>
    </div>
  );
}