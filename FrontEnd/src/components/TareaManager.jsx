import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import axios from 'axios';
import HeaderNoLink from './HeaderNoLink';
import '../App.css';

const TareaManager = () => {
  const { tareaId } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();
  
  const [tarea, setTarea] = useState(null);
  const [sesion, setSesion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Estado del cronómetro
  const [tiempoTranscurrido, setTiempoTranscurrido] = useState(0);
  const [estaActiva, setEstaActiva] = useState(false);
  const [modo, setModo] = useState('tarea-especifica');

  const API_BASE_URL = import.meta.env.VITE_API_URL;

  const getConfig = useCallback(() => {
    const authToken = localStorage.getItem('authToken');
    if (!authToken) {
      navigate('/Login');
      return {};
    }
    return {
      headers: { 'Authorization': `Bearer ${authToken}` }
    };
  }, [navigate]);

  // --- LÓGICA DE CARGA DE DATOS ---
  const cargarTareaDelDia = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/tarea-del-dia/actual`, getConfig());
      if (response.data.tieneSesiones && response.data.tarea) {
        setTarea(response.data.tarea);
        setSesion(response.data.sesion);
        setModo('tarea-del-dia');
      } else {
        setModo('sin-sesiones');
      }
    } catch (err) {
      setError('Error al cargar tarea del día: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL, getConfig]);

  useEffect(() => {
    const cargarDatos = async () => {
      if (tareaId) {
        setLoading(true);
        try {
          const response = await axios.get(`${API_BASE_URL}/sesiones/tareas/${tareaId}`, getConfig());
          setTarea(response.data);
          setSesion(response.data.sesion);
          setModo('tarea-especifica');
        } catch (err) {
          setError('Error al cargar tarea específica: ' + (err.response?.data?.message || err.message));
        } finally {
          setLoading(false);
        }
      } else {
        cargarTareaDelDia();
      }
    };
    cargarDatos();
  }, [tareaId, state, API_BASE_URL, getConfig, cargarTareaDelDia]);

  // --- LÓGICA DEL CRONÓMETRO ---

  // Inicializar tiempo desde la DB o LocalStorage
  useEffect(() => {
    if (tarea) {
      const tiempoGuardado = localStorage.getItem(`temp_time_${tarea.id}`);
      setTiempoTranscurrido(tiempoGuardado ? parseInt(tiempoGuardado) : (tarea.tiempo_real_ejecucion || 0));
    }
  }, [tarea]);

  // Intervalo del cronómetro
  useEffect(() => {
    let interval = null;
    if (estaActiva) {
      interval = setInterval(() => {
        setTiempoTranscurrido((prev) => {
          const nuevoTiempo = prev + 1;
          // Backup silencioso en cada segundo
          if (tarea?.id) localStorage.setItem(`temp_time_${tarea.id}`, nuevoTiempo);
          return nuevoTiempo;
        });
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [estaActiva, tarea?.id]);

  const formatTiempo = (segundos) => {
    const horas = Math.floor(segundos / 3600);
    const minutos = Math.floor((segundos % 3600) / 60);
    const segs = segundos % 60;
    return `${horas.toString().padStart(2, '0')}:${minutos.toString().padStart(2, '0')}:${segs.toString().padStart(2, '0')}`;
  };

  // --- ACCIONES (START, PAUSE, STOP) ---
  const manejarAccion = async (accion) => {
    if (!tarea) return;

    // 1. CAPTURA INMEDIATA (Snapshot)
    const tiempoCapturado = tiempoTranscurrido;

    // 2. ACTUALIZACIÓN UI INSTANTÁNEA (Optimista)
    if (accion === 'pause' || accion === 'stop') {
      setEstaActiva(false); // Detiene el cronómetro visualmente YA
    } else if (accion === 'start') {
      setEstaActiva(true);
    }

    try {
      // 3. PERSISTENCIA EN DB (Segundo plano)
      const response = await axios.post(
        `${API_BASE_URL}/sesiones/tareas/${tarea.id}/gestionar`,
        {
          action: accion,
          tiempo_ejecutado: (accion === 'stop' || accion === 'pause') ? tiempoCapturado : 0
        },
        getConfig()
      );

      // 4. SINCRONIZACIÓN FINAL
      if (accion === 'pause') {
        setTarea(response.data.tarea);
        localStorage.setItem(`temp_time_${tarea.id}`, tiempoCapturado);
      } else if (accion === 'stop') {
        setTarea(response.data.tarea);
        setTiempoTranscurrido(0);
        setEstaActiva(false);
        localStorage.removeItem(`temp_time_${tarea.id}`);
      }
    } catch (err) {
      console.error("Error en la sincronización:", err);
      // Si falla la red, el cronómetro ya está pausado, lo cual es correcto para el usuario.
      alert('Error al guardar en el servidor. El tiempo se mantuvo localmente.');
    }
  };

  const eliminarTarea = async () => {
    if (!tarea || !window.confirm('¿Estás seguro?')) return;
    try {
      await axios.delete(`${API_BASE_URL}/sesiones/tareas/${tarea.id}`, getConfig());
      localStorage.removeItem(`temp_time_${tarea.id}`);
      modo === 'tarea-del-dia' ? cargarTareaDelDia() : navigate('/gestor-estudio');
    } catch (err) {
      alert('Error al eliminar: ' + (err.response?.data?.message || err.message));
    }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '50px' }}>Cargando...</div>;
  if (error) return <div style={{ textAlign: 'center', padding: '50px', color: 'red' }}><h3>Error</h3><p>{error}</p></div>;

  if (modo === 'sin-sesiones') {
    return (
      <div style={{ maxWidth: '600px', margin: '50px auto', textAlign: 'center', padding: '40px' }}>
        <div style={{ backgroundColor: '#f8f9fa', padding: '40px', borderRadius: '10px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>
          <h1>📚 No hay sesiones activas</h1>
          <button onClick={() => navigate('/')}>Crear Nueva Sesión</button>
          <button onClick={() => navigate('/gestor-estudio')}>Ver Gestor de Estudio</button>
        </div>
      </div>
    );
  }

  return (
    <div className="Tarjeta-Principal">
      <HeaderNoLink />
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
        <div style={{ backgroundColor: '#f8f9fa', padding: '20px', borderRadius: '10px' }}>
          <button onClick={() => navigate('/gestor-estudio')}>↩️ Volver</button>
          <h1>🎯 Gestor de Tarea</h1>
          
          {tarea && (
            <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', marginBottom: '20px' }}>
              <h2>{tarea.nombre}</h2>
              {tarea.es_completada && <span style={{ color: 'green', fontWeight: 'bold' }}>✅ Completada</span>}
            </div>
          )}

          {tarea && !tarea.es_completada && (
            <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', textAlign: 'center' }}>
              <h3>⏰ Temporizador</h3>
              <div style={{ fontSize: '2.5em', fontWeight: 'bold', fontFamily: 'monospace', margin: '10px 0' }}>
                {formatTiempo(tiempoTranscurrido)}
              </div>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                <button onClick={() => manejarAccion('start')} disabled={estaActiva} style={{ backgroundColor: estaActiva ? '#ccc' : '#28a745', color: 'white' }}>
                  ▶️ Iniciar
                </button>
                <button onClick={() => manejarAccion('pause')} disabled={!estaActiva} style={{ backgroundColor: !estaActiva ? '#ccc' : '#ffc107' }}>
                  ⏸️ Pausar
                </button>
                <button onClick={() => manejarAccion('stop')} style={{ backgroundColor: '#dc3545', color: 'white' }}>
                  ⏹️ Finalizar
                </button>
              </div>
            </div>
          )}

          {sesion && (
            <div style={{ backgroundColor: '#fff3cd', padding: '15px', borderRadius: '8px', marginTop: '20px' }}>
              <h4>📚 Sesión Padre: {sesion.nombre}</h4>
            </div>
          )}

          <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
            <button onClick={eliminarTarea} style={{ backgroundColor: 'transparent', color: '#dc3545', border: '1px solid #dc3545' }}>
              🗑️ Eliminar Tarea
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TareaManager;