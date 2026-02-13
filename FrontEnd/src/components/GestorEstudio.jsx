// components/GestorEstudio.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import HeaderNavegacion from './HeaderNavegacion';
import SesionesList from './SesionesList';
import TareasPorFecha from './TareasPorFecha';
import HeaderNoLink from './HeaderNoLink';
import '../App.css';

const GestorEstudio = () => {
  const [vistaActual, setVistaActual] = useState('sesiones'); // 'sesiones' o 'fechas'
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  
  // Obtener token y userId desde localStorage
  const authToken = localStorage.getItem('authToken');
  const userId = localStorage.getItem('UserId');
  

  const API_BASE_URL = import.meta.env.VITE_API_URL || '/backend';
  
  // Configuración de headers con token
  const getConfig = () => ({
    headers: {
      'Authorization': `Bearer ${authToken}`
    }
  });

  // Función para cargar datos
  const fetchSesiones = async () => {
    setLoading(true);
    setError(null);

    // Validar autenticación
    if (!authToken || !userId) {
      navigate('/Login');
      setError('No autorizado. Por favor, inicia sesión.');
      setLoading(false);
      return;
    }

    try {
      
      const url = `${API_BASE_URL}/sesiones/user/${userId}`;
      
      const response = await axios.get(url, getConfig());
      setData(response.data);
      
    } catch (err) {

      
      const errorMsg = 'Error al cargar las sesiones: ' + 
        (err.response?.data?.message || err.response?.data?.error || err.message);
      
      setError(errorMsg);
      
      // Si es error 404, sugerir verificar la ruta

      
    } finally {
      setLoading(false)
    }
  };

  useEffect(() => {
    fetchSesiones();
  }, []);

  // Funciones de manejo de eventos que se pasarán a los componentes hijos
  const handleTareaClick = (tarea, sesionPadre) => {
    navigate(`/tareas/${tarea.id}`, { 
      state: { 
        tarea: tarea,
        sesion: sesionPadre
      } 
    });
  };

  const handleSessionClick = (sesion) => {
    navigate(`/sesiones/${sesion.id}`, { state: { sesion } });
  };

  const handleDeleteSession = async (sessionId) => {
    if (!window.confirm("¿Confirmas que deseas eliminar esta sesión de estudio?")) {
      return;
    }


    try {
      // ✅ URL CORREGIDA: /sesiones/:id
      await axios.delete(`${API_BASE_URL}/sesiones/${sessionId}`, getConfig());
      console.log('✅ Sesión eliminada con éxito');
      alert('Sesión eliminada con éxito.');
      fetchSesiones();
    } catch (err) {
      const errorMsg = 'Error al eliminar sesión: ' + 
        (err.response?.data?.message || err.response?.data?.error || 'Error desconocido');
      console.error('❌ Error eliminando sesión:', errorMsg, err);
      alert(errorMsg);
    }
  };

  const handleDeleteTarea = async (tareaId, tareaNombre) => {
    if (!window.confirm(`⚠️ ¿Deseas eliminar la tarea: "${tareaNombre}"?`)) {
      return;
    }

    try {
      await axios.delete(`${API_BASE_URL}/sesiones/tareas/${tareaId}`, getConfig());
      alert(`Tarea "${tareaNombre}" eliminada con éxito.`);
      fetchSesiones();
    } catch (err) {
      const errorMsg = 'Error al eliminar tarea: ' + 
        (err.response?.data?.message || err.response?.data?.error || 'Error desconocido');
      console.error('❌ Error eliminando tarea:', errorMsg, err);
      alert(errorMsg);
    }
  };

  const handleGestionarTarea = async (tareaId, action) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/sesiones/tareas/${tareaId}/gestionar`,
        {
          action: action,
          tiempo_ejecutado: 30
        },
        getConfig() 
      );
      
      fetchSesiones();
    } catch (err) {
      const errorMsg = 'Error al gestionar tarea: ' + 
        (err.response?.data?.message || err.response?.data?.error || 'Error desconocido');
      alert(errorMsg);
    }
  };

  // Estados de carga
  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <p>Cargando sesiones...</p>
      </div>
    );
  }
  
  // Estados de error
  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '50px', color: 'red' }}>
        <h3>Error</h3>
        <p>{error}</p>
        <button 
          onClick={fetchSesiones}
          style={{ 
            padding: '10px 20px', 
            backgroundColor: '#007bff', 
            color: 'white', 
            border: 'none', 
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Reintentar
        </button>
      </div>
    );
  }
  
  // Sin datos
  if (data.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <p>No hay sesiones planificadas.</p>
        <button 
          onClick={() => navigate('/crear-sesion')}
          style={{ 
            padding: '10px 20px', 
            backgroundColor: '#28a745', 
            color: 'white', 
            border: 'none', 
            borderRadius: '5px',
            cursor: 'pointer',
            marginTop: '10px'
          }}
        >
          Crear primera sesión
        </button>
      </div>
    );
  }

  // Vista principal
  return (
    <>
      <div className="Tarjeta-Principal">
        <HeaderNoLink />
        
        {/* Header de navegación */}
        <HeaderNavegacion 
          vistaActual={vistaActual}
          onCambiarVista={setVistaActual}
        />
        
        {/* Contenido según vista seleccionada */}
        {vistaActual === 'sesiones' ? (
          <SesionesList 
            sesiones={data}
            onSessionClick={handleSessionClick}
            onTareaClick={handleTareaClick}
            onDeleteSession={handleDeleteSession}
            onDeleteTarea={handleDeleteTarea}
            onGestionarTarea={handleGestionarTarea}
          />
        ) : (
          <TareasPorFecha 
            sesiones={data}
            onTareaClick={handleTareaClick}
            onDeleteTarea={handleDeleteTarea}
            onGestionarTarea={handleGestionarTarea}
          />
        )}
      </div>
    </>
  );
};

export default GestorEstudio;