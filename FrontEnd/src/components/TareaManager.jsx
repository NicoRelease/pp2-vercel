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

  // Estados para las notas
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

      if (res.data.notas) {
        setNota(res.data.notas);
      }
    } catch (err) {
      alert("No tienes permiso para acceder a esa tarea")
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

  const handleGuardarNota = async () => {
    if (!nota.trim()) return;
    
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
      
      {/* Contenedor Principal: Grid/Flex */}
      <div className="Tarjetas">
        
        {/* COLUMNA IZQUIERDA: GESTIÓN Y TIMER */}
        <div className="Tarea">
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
        <div className="Resumen">
          <div className="espacio"> </div>
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
        </div>

        {/* TARJETA DE NOTAS: ANCHO COMPLETO (Debajo de todo) */}
        <div className="tm-notas-card">
            <h3 className="tm-resumen-title">📝 Notas de la Tarea</h3>
            <p className="tm-note-description">Deja constancia de tus avances o dudas (Máx 10,000 caracteres)</p>
            
            <textarea
              value={nota}
              onChange={(e) => {
                if (e.target.value.length <= 10000) setNota(e.target.value);
              }}
              placeholder="Escribe aquí tus observaciones, dudas o conclusiones..."
              className="tm-textarea"
            />

            <div className="tm-note-footer">
              <span className={`tm-char-count ${nota.length > 9000 ? 'text-red-500 font-bold' : ''}`}>
                {nota.length} / 10,000 caracteres
              </span>

              <button 
                onClick={handleGuardarNota}
                disabled={savingNote || nota.trim().length === 0}
                className="tm-btn-guardar-nota"
              >
                {savingNote ? 'Guardando...' : 'Guardar Nota'}
              </button>
            </div>
        </div>

      </div>
    </div>
  );
};

export default TareaManager;
