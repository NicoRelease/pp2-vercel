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
  const [errorMessage, setErrorMessage] = useState(""); 
  
const SECRET_KEY= import.meta.env.VITE_CLIENT_SECRET_KEY;
  
const API_BASE_URL = import.meta.env.VITE_API_URL;


  // Función de Encriptación / Codificación
  const encrypt = (text) => {
    if (typeof CryptoJS !== 'undefined' && CryptoJS.AES) {
        return CryptoJS.AES.encrypt(text, SECRET_KEY).toString(); 
    }
    
    console.error("Encriptación no disponible.");
    return btoa(text); 
  };

  const handleLogin = (data) => {        
    if (data.token) {
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('UserId', data.user.id);
      
        
    } else {
        console.warn("Login exitoso, pero no se recibió token en la respuesta.");
    }

    navigate("/gestor-estudio");
  };

  // Función principal de manejo del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(""); 

    if (!loginUser || !loginPassword) {
      setErrorMessage("Por favor, ingresa el usuario y la contraseña.");
      return;
    }

    setIsLoading(true);

    // Codificación/encriptación

    const encryptedUser = encrypt(loginUser);
    const encryptedPassword = encrypt(loginPassword);
    try {
         
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
        handleLogin({ token: data.token, user: loginUser });
 
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('UserId', data.user.id);
        console.log("Token guardado en localStorage luego del post-login.", localStorage.getItem('authToken'));
        console.log("UserId guardado en localStorage luego del post-login.", localStorage.getItem('UserId'));
        
 
        return;
      }
      
      // Manejo de errores de servidor
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
          <div className="Usuario">
            <label className="block text-gray-700 font-medium mb-2" htmlFor="loginUser">
              Correo: 
            </label>
            <div className="InputCorreo">
                <input
              id="loginUser"
              type="email"
              value={loginUser}
              onChange={(e) => setLoginUser(e.target.value)}
              placeholder="ej: tu.correo@dominio.com"
              disabled={isLoading}
              required
            />
            </div>
            
          </div>

          {/* Campo de Contraseña */}
          <div className="Clave">
            <label className="block text-gray-700 font-medium mb-2" htmlFor="loginPassword">
              Contraseña:
            </label>
            <div className="Password">
            <input
              id="loginPassword"
              type="password"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              placeholder="Ingresa tu contraseña"
              disabled={isLoading}
              required
            />
            </div>
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