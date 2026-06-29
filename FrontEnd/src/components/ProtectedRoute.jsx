import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import DirectAccessError from './DirectAccessError';

/**
 * ProtectedRoute: Wrapper para rutas protegidas.
 * 
 * Lógica de Seguridad Anti-Acceso Directo:
 * 1. Verifica existencia de JWT en localStorage.
 * 2. Valida si la navegación fue interna (state.isInternalNav) o si ya inició sesión en esta pestaña.
 *    - Si hay token PERO el usuario tipeó la URL manualmente -> Acceso directo inválido (Cierra sesión).
 * 3. Permite refrescos dentro de la misma sesión validada vía sessionStorage.
 */

const ProtectedRoute = ({ children, allowedRoles }) => {
    const location = useLocation();
    const token = localStorage.getItem('authToken');
    
    // Decodificar payload JWT básico para obtener rol (sin verificación de firma en frontend)
    let userRole = null;
    if (token) {
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            userRole = payload.rol_id || payload.role;
            
            // Si hay allowedRoles definidos y el usuario no está en la lista, redirigir a waiting-room
            if (allowedRoles && !allowedRoles.includes(userRole)) {
                return <Navigate to="/waiting-room" replace state={{ isInternalNav: true }} />;
            }
        } catch (e) {
            // Token corrupto -> cerrar sesión inmediatamente
            localStorage.clear();
            sessionStorage.clear();
            return <DirectAccessError />;
        }
    }

    const validSessionActive = sessionStorage.getItem('validSession') === 'true';
    const isInternalNav = location.state?.isInternalNav === true;

    // Caso 1: No tiene token -> Redirigir a Login
    if (!token) {
        return <Navigate to="/Login" state={{ redirectFrom: location.pathname }} replace />;
    }

    // Caso 2: Tiene token, pero NO viene de una navegación interna ni de un login previo en esta pestaña.
    // Esto detecta cuando el usuario edita la URL manualmente y presiona Enter.
    if (!validSessionActive && !isInternalNav) {
        localStorage.clear();
        sessionStorage.clear();
        return <DirectAccessError />;
    }

    // Caso 3: Acceso válido -> Asegurar que la bandera de sesión persista para refrescos futuros y renderizar hijos.
    if (!validSessionActive && isInternalNav) {
        sessionStorage.setItem('validSession', 'true');
    }
    
    return children;
};

export default ProtectedRoute;
