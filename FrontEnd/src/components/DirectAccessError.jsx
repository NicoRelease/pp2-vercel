import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const DirectAccessError = () => {
    const navigate = useNavigate();

    useEffect(() => {
        // Cerrar sesión al detectar acceso directo forzado
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        localStorage.removeItem('UserId');
        localStorage.removeItem('group_id');
        
        setTimeout(() => {
            navigate('/Login', { replace: true, state: { errorType: 'directAccess' } });
        }, 3000); 
    }, [navigate]);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', backgroundColor: '#f8d7da', textAlign: 'center', padding: '20px' }}>
            <div style={{ fontSize: '4rem', marginBottom: '20px' }}>🔒</div>
            <h2 style={{ color: '#dc3545', marginBottom: '15px', fontSize: '1.8rem' }}>Acceso Directo No Permitido</h2>
            <p style={{ maxWidth: '600px', marginBottom: '30px', color: '#721c24', lineHeight: '1.6', fontSize: '1.1rem' }}>
                Esta URL solo puede ser accedida a través de la navegación interna de la aplicación (botones/menús). 
                Para garantizar tu seguridad, se ha detectado un ingreso directo y se está cerrando tu sesión automáticamente.
            </p>
            <div style={{ padding: '12px 24px', background: '#fff', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)', color: '#6c757d' }}>
                Redirigiendo al inicio de sesión...
            </div>
        </div>
    );
};

export default DirectAccessError;
