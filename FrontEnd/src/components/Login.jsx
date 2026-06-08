import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../App.css';
import HeaderNoLink from './HeaderNoLink';
import CryptoJS from 'crypto-js';

export default function Login() {
  const navigate = useNavigate();
  const [loginUser, setLoginUser] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(""); 
  
  const SECRET_KEY = import.meta.env.VITE_CLIENT_SECRET_KEY;
  const API_BASE_URL = import.meta.env.VITE_API_URL;

  const encrypt = (text) => {
    if (typeof CryptoJS !== 'undefined' && CryptoJS.AES) {
        return CryptoJS.AES.encrypt(text, SECRET_KEY).toString(); 
    }
    return btoa(text); 
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(""); 
    setIsLoading(true);

    const encryptedUser = encrypt(loginUser);
    const encryptedPassword = encrypt(loginPassword);

    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ encryptedUser, encryptedPassword }),
      });

      const data = await response.json();
     
      if (response.ok && data.token) {
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('UserId', data.user.id);
        localStorage.setItem('user', JSON.stringify(data.user));

        const { rol_id, estado } = data.user;

        if (estado === false) {
          navigate("/waiting-room");
        } 
        else if (rol_id === 1) {
          navigate("/admin-dashboard");
        } 
        else if (rol_id === 2) {
          navigate("/group-admin");
        } 
        else if (rol_id === 3) {
          navigate("/gestor-estudio");
        } 
        else {
          navigate("/waiting-room");
        }
      } 
      else {
        setErrorMessage(data.error || "Credenciales incorrectas.");
      }
    } catch (err) {
      setErrorMessage("Error de conexión.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="Tarjeta-Principal">
      <HeaderNoLink />      
      <div className="Form-Container">
        <form onSubmit={handleSubmit}>
          {errorMessage && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl mb-4 text-sm">
              <p>{errorMessage}</p>
            </div>
          )}
          <div className="Usuario">
            <label className="block text-gray-700 font-medium mb-2">Correo:</label>
            <div className="InputCorreo">
              <input type="email" value={loginUser} onChange={(e) => setLoginUser(e.target.value)} required disabled={isLoading} />
            </div>
          </div>
          <div className="Clave">
            <label className="block text-gray-700 font-medium mb-2">Contraseña:</label>
            <div className="Password">
              <input type="password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} required disabled={isLoading} />
            </div>
          </div>
          
          {/* Botón con texto negro para mejor contraste */}
          <button 
            type="submit" 
            className={`w-full py-3 bg-blue-600 text-black rounded-xl font-bold mt-4 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${isLoading ? 'opacity-75 cursor-not-allowed' : ''}`}
            disabled={isLoading}
          >
            {isLoading 
              ? "Validando..." 
              : (
                <>
                  Iniciar sesión
                  <span className="inline-block ml-2 animate-pulse">→</span>
                </>
              )
            }
            
            {/* Efectos hover y focus para mejor accesibilidad */}
          >
            {isLoading ? "Validando..." : (
              <>Iniciar sesión<span className="ml-1 inline-block animate-bounce">➜</span></>
            )}
          </button>

          <style jsx>{`
            button[type='submit']::after {
              content: '';
              position: absolute;
              top: 0; left: -5px; right: -5px; bottom: 0;
              background-color: rgba(255, 255, 255, 0.1);
              border-radius: inherit;
              transform: scaleX(0);
              transition: transform .3s ease-in-out;
            }

            button[type='submit']:hover::after {
              transform: scaleX(1);
            }
          `}</style>

          {/* PARTE RESTAURADA: Enlace de Registro */}
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
