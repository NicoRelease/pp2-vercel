import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import HeaderNoLink from './HeaderNoLink';
import '../App.css';

const TareaManager = () => {
  const { tareaId } = useParams();
  const navigate = useNavigate();
  
  const [tarea, setTarea] = useState(null);
  const [sesion, setSesion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [estaActiva, setEstaActiva] = useState(false);
  const [tiempoTranscurrido, setTiempoTranscurrido] = useState(0);

  // NUEVO: Estados para las notas
  const [nota, setNota] = useState('');
  const [savingNote, setSavingNote] = useState(false);

  const API_BASE_URL = import.meta.env.VITE_API_URL;
  const autosaveIntervalRef = useRef(null);

  const getConfig = useCallback(() => {
    const authToken = localStorage.getItem('authToken');
    if (!authToken) { navigate('/Login'); return {}; }
    return { headers: { 'Authorization': `Bearer ${authToken}` } };
  }, [navigate]);

  const fetchEstadoActualizado = useCallback(async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/sesiones/tareas/${tareaId}`, getConfig());
      const tiempoDB = res.data.tiempo_real_ejecucion || 0;
      const tiempoLocal = parseInt(localStorage.getItem(`temp_time_${tareaId}`)) || 0;
      const tiempoFinal = Math.max(tiempoDB, tiempoLocal);
      
      setTarea(res.data);
      setSesion(res.data.sesion);
      setTiempoTranscurrido(tiempoFinal);
      localStorage.setItem(`temp_time_${tareaId}`, tiempoFinal);

      // Cargar nota existente si la hay
      if (res.data.notas) {
        setNota(res.data.notas);
      }
    } catch (err) {
      console.error("Error de sincronización:", err);
    }
  }, [tareaId, API_BASE_URL, getConfig]);

  useEffect(() => {
    fetchEstadoActualizado().then(() => setLoading(false));
  }, [fetchEstadoActualizado]);

  useEffect(() => {
    let interval = null;
    if (estaActiva) {
      interval = setInterval(() => {
        setTiempoTranscurrido(prev => {
          const nuevo = prev + 1;
          localStorage.setItem(`temp_time_${tareaId}`, nuevo);
          return nuevo;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [estaActiva, tareaId]);

  useEffect(() => {
    if (estaActiva) {
      autosaveIntervalRef.current = setInterval(() => {
        const tiempoActual = parseInt(localStorage.getItem(`temp_time_${tareaId}`));
        axios.post(`${API_BASE_URL}/sesiones/tareas/${tareaId}/gestionar`, 
          { action: 'pause', tiempo_ejecutado: tiempoActual }, getConfig()
        ).catch(e => console.log("Autosave fallido"));
      }, 30000);
    } else {
      clearInterval(autosaveIntervalRef.current);
    }
    return () => clearInterval(autosaveIntervalRef.current);
  }, [estaActiva, tareaId, API_BASE_URL, getConfig]);

  const manejarAccion = async (accion) => {
    if (!tarea) return;
    if (accion === 'start') {
      await fetchEstadoActualizado();
      setEstaActiva(true);
      return;
    }
    const tiempoSnapshot = tiempoTranscurrido;
    setEstaActiva(false);
    try {
      // Validar que tiempo_ejecutado sea un número válido para evitar error 500
      const tiempoValido = (typeof tiempoSnapshot === 'number' && !isNaN(tiempoSnapshot)) ? tiempoSnapshot : 0;
      
      const res = await axios.post(`${API_BASE_URL}/sesiones/tareas/${tareaId}/gestionar`, 
        { action: accion, tiempo_ejecutado: tiempoValido }, getConfig()
      );
      if (accion === 'stop') {
        localStorage.removeItem(`temp_time_${tareaId}`);
        navigate('/gestor-estudio', { state: { isInternalNav: true } });
      } else {
        setTarea(res.data.tarea);
      }
    } catch (err) {
      console.error('Error al gestionar tarea:', err.response?.data || err.message);
      alert(`❌ Error al grabar: ${err.response?.data?.message || 'Error desconocido'}`);
    }
  };

  // NUEVO: Función para guardar notas
  const handleGuardarNota = async () => {
    if (!nota.trim()) return; // No hacer nada si está vacío o solo espacios
    
    setSavingNote(true);
    try {
      await axios.post(
        `${API_BASE_URL}/sesiones/tareas/${tareaId}/gestionar`, 
        { action: 'note', notas: nota.substring(0, 10000) },
        getConfig()
      );
      alert('✅ Nota guardada correctamente');
    } catch (err) {
      console.error("Error al guardar nota:", err);
      alert(`❌ Error al guardar la nota: ${err.response?.data?.message || 'Error desconocido'}`);
    } finally {
      setSavingNote(false);
    }
  };

  const formatTiempo = (s) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const seg = s % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${seg.toString().padStart(2, '0')}`;
  };

  if (loading) return <div className="loading-screen">Sincronizando...</div>;

  return (
    <div className="Tarjeta-Principal tm-page">
      <HeaderNoLink />
      <div className="Tarea">
        
        {/* COLUMNA IZQUIERDA: GESTIÓN */}
        <div className="Contador">
          <button onClick={() => navigate('/gestor-estudio')} className="tm-btn-back">↩️ Volver</button>
          
          <div className="tm-card">
            <h1 className="tm-task-title">{tarea?.nombre}</h1>
            {tarea?.es_completada && <span className="tm-done-badge">✅ Tarea Completada</span>}

            {!tarea?.es_completada && (
              <div className="tm-timer-container">
                <div className="tm-clock">{formatTiempo(tiempoTranscurrido)}</div>
                <div className="tm-btn-group">
                  {!estaActiva ? (
                    <button onClick={() => manejarAccion('start')} className="tm-btn-start">▶️ Iniciar</button>
                  ) : (
                    <button onClick={() => manejarAccion('pause')} className="tm-btn-pause">⏸️ Pausar</button>
                  )}
                  <button onClick={() => manejarAccion('stop')} className="tm-btn-stop">⏹️ Finalizar</button>
                </div>
                <p className="tm-autosave-text">{estaActiva ? 'Autosave activo (30s)' : 'Sincronizado'}</p>
              </div>
            )}
          </div>
        </div>

        {/* COLUMNA DERECHA: RESUMEN */}
        
        <aside className="Resumen">
          <div className="Espacio"></div>
          <div className="tm-resumen-card">
            <h3 className="tm-resumen-title">📊 Resumen General</h3>
            <div className="tm-divider" />
            <div className="tm-info-row">
              <span>📚 Sesión:</span>
              <strong>{sesion?.nombre}</strong>
            </div>
            <div className="tm-info-row">
              <span>🎯 Objetivo:</span>
              <strong>{tarea?.duracion_estimada} min</strong>
            </div>
            <div className="tm-info-row">
              <span>⏱️ Estado:</span>
              <strong className={estaActiva ? 'text-active' : 'text-paused'}>
                {estaActiva ? 'En curso' : 'Pausado'}
              </strong>
            </div>
          </div>

          {/* NUEVA: Tarjeta de Notas */}
          <div className="tm-resumen-card mt-6">
            <h3 className="tm-resumen-title">📝 Notas de la Tarea</h3>
            <p className="text-sm text-gray-500 mb-2">Deja constancia de tus avances o dudas (Máx 10,000 caracteres)</p>
            
            <textarea
              value={nota}
              onChange={(e) => {
                if (e.target.value.length <= 10000) setNota(e.target.value);
              }}
              placeholder="Escribe aquí tus observaciones, dudas o conclusiones..."
              className="w-full h-48 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-150 resize-none text-sm bg-gray-50"
            />

            <div className="flex justify-between items-center mt-3">
              <span className={`text-xs ${nota.length > 9000 ? 'text-red-500 font-bold' : 'text-gray-400'}`}>
                {nota.length} / 10,000 caracteres
              </span>

              <button 
                onClick={handleGuardarNota}
                disabled={savingNote || nota.trim().length === 0}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  savingNote 
                      ? 'bg-gray-300 cursor-not-allowed' 
                      : 'bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed'
                }`}
              >
                {savingNote ? 'Guardando...' : 'Guardar Nota'}
              </button>
            </div>
          </div>

        </aside>

      </div>
    </div>
  );
};

export default TareaManager;