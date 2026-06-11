import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../App.css';
import HeaderNoLink from './HeaderNoLink';
import CryptoJS from 'crypto-js';

export default function Login() {
  const navigate = useNavigate();
  const [loginUser, setLoginUser] = useState("uno.usuario@correo.com");
  const [loginPassword, setLoginPassword] = useState("1234");
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

        const { rol_id, estado, group_id} = data.user;
        let groupResponse = null;
        
        if (group_id) {
          try {
            const response = await fetch(`${API_BASE_URL}/groups/byGroupId/${group_id}`, {
              method: "GET",
              headers: { 'Authorization': `Bearer ${data.token}`,"Content-Type": "application/json" },
            });

            groupResponse = await response.json();
            console.log("Respuesta del servicio:", groupResponse);
          }
          catch (error) {
            console.error("Error al obtener detalles del grupo:", error);
          }
          console.log("Rol ID:", rol_id, "Estado:", estado, "Group ID:", group_id, "groupResonse:",groupResponse, "groupResponseLenght:", groupResponse ? groupResponse.usuarios.length : "N/A");
          
          // Primero verificamos si debe ir a grupo-resumen
          if (rol_id === 3 && groupResponse && groupResponse.usuarios && groupResponse.usuarios.length > 0) {
            navigate("/grupo-resumen");
            return; // Salimos de la función para evitar que continúe
          }
        }
        
        // Lógica de navegación principal
        if (estado === false) {
          navigate("/waiting-room");
        } 
        else if (rol_id === 1) {
          navigate("/admin-dashboard");
        } 
        else if (rol_id === 2) {
          navigate("/group-admin");
        } 
        else if (rol_id === 3 && (!groupResponse || !groupResponse.usuarios || groupResponse.usuarios.length === 0)) {
          navigate("/gestor-estudio");
        } 
        else {
          navigate("/waiting-room");
        }
      } else {
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
          <button type="submit" className="LoginButton" disabled={isLoading}>
            {isLoading ? "Validando..." : "Iniciar sesión"}
          </button>

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
